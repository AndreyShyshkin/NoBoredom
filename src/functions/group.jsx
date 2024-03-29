import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, onValue, ref, remove, set } from 'firebase/database'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../firebase.config'
import Friend from './Friend'
import GET from './GET'
import inviteFriend from './inviteFriend'
import JoinGroup from './joinGroup'
import Notification from './notification'
const auth = getAuth()
const db = getDatabase()
let onGame = false

function Group() {
	const [user, setUser] = useState(null)
	const [data, setData] = useState(null)
	const [matched, setMatched] = useState(null)
	const [groupMembers, setGroupMembers] = useState([])
	const [userFriends, setUserFriends] = useState([])
	const beforeStart = useRef()
	const Start = useRef()
	const goToMatch = useRef()
	const startBtn = useRef()
	const [mouseStartX, setMouseStartX] = useState(null)
	const [mouseEndX, setMouseEndX] = useState(null)
	const [touchStartX, setTouchStartX] = useState(null)
	const [touchEndX, setTouchEndX] = useState(null)

	const groupID = GET('id')

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, user => {
			if (user) {
				setUser(user)
			} else {
				setUser(null)
			}
		})

		window.addEventListener('beforeunload', handleBeforeUnload)

		return () => {
			unsubscribe()
		}
	}, [user])

	async function handleBeforeUnload(event) {
		event.preventDefault()
		window.addEventListener('unload', async function () {
			if (user) {
				try {
					await removeFromGroup(user)
				} catch (error) {
					console.error('Ошибка удаления из группы:', error)
				}
			}
		})
	}

	function removeFromGroup(user) {
		return new Promise((resolve, reject) => {
			const groupRef = ref(db, 'groups/' + groupID + '/' + user.uid)
			remove(groupRef)
				.then(() => resolve())
				.catch(error => reject(error))
		})
	}

	function joinGroup(user) {
		let name
		if (!user.isAnonymous) {
			name = user.displayName
		} else {
			name = 'anonymous'
		}
		set(ref(db, 'groups/' + groupID + '/' + user.uid), {
			id: user.uid,
			name: name,
			ready: 'not',
			type: '',
			match: '',
			matched: 'false',
		}).catch(error => {
			console.error('Ошибка при присоединении к группе:', error)
		})
	}

	useEffect(() => {
		if (user) {
			const groupRef = ref(db, 'groups/' + groupID)
			const friendRef = ref(db, 'users/' + user.uid + '/friends')
			onValue(groupRef, snapshot => {
				const data = snapshot.val()
				if (data) {
					const members = Object.values(data)
					setGroupMembers(members)
				} else {
					setGroupMembers([])
				}
			})
			onValue(friendRef, snapshot => {
				const data = snapshot.val()
				if (data) {
					const friends = Object.values(data)
					setUserFriends(friends)
				} else {
					setUserFriends([])
				}
			})
		}
	}, [user])

	function ready(user) {
		const userRef = ref(db, `groups/${groupID}/${user.uid}`)
		const member = groupMembers.find(member => member.id === user.uid)
		if (member) {
			const newStatus = member.ready === 'yes' ? 'not' : 'yes'
			set(userRef, { ...member, ready: newStatus }).catch(error =>
				console.error('Ошибка при обновлении статуса пользователя:', error)
			)
		}
	}

	useEffect(() => {
		if (user) {
			const allUsersReady = groupMembers.every(member => member.ready === 'yes')
			const allUsersSameType = groupMembers.every(
				member => member.type == groupMembers[0].type && member.type !== ''
			)

			if (allUsersSameType && groupMembers.length !== 0 && !onGame) {
				onGame = true
				game()
			}

			if (allUsersReady && groupMembers.length >= 2) {
				beforeStart.current.style.display = 'none'
				Start.current.style.display = 'block'
			}

			const matchedUsers = groupMembers.filter(
				member => member.matched !== 'false'
			)

			if (matchedUsers.length > 0) {
				matchedUsers.forEach(member => {
					setMatched(member.matched)
					goToMatch.current.style.display = 'none'
				})
			}
		}
	}, [user, groupMembers, matched])

	function start(type) {
		const userRef = ref(db, `groups/${groupID}/${user.uid}`)
		const member = groupMembers.find(member => member.id === user.uid)

		if (member) {
			set(userRef, { ...member, type: type }).catch(error =>
				console.error('Ошибка при обновлении статуса пользователя:', error)
			)
		}
	}

	function game() {
		startBtn.current.style.display = 'none'
		goToMatch.current.style.display = 'flex'

		const fetchDataPromises = groupMembers.map(member => {
			let url = '//www.boredapi.com/api/activity/'
			if (member.type !== 'random') {
				url = url + '?type=' + member.type
			}
			return fetch(url)
				.then(response => {
					if (
						!response.ok ||
						!response.headers.get('content-type')?.includes('application/json')
					) {
						throw new Error('Failed to get JSON')
					}
					return response.json()
				})
				.catch(fetchError => {
					console.error(fetchError)
				})
		})

		Promise.all(fetchDataPromises)
			.then(results => {
				const combinedData = results.reduce(
					(acc, data) => {
						return data
					},
					{ activity: '' }
				)
				setData(combinedData)

				const matchedUsers = groupMembers.filter(member => {
					return (
						member.match &&
						member.match.split(';').includes(JSON.stringify(data.activity))
					)
				})

				matchedUsers.forEach(matchedUser => {
					const userRef = ref(db, `groups/${groupID}/${matchedUser.id}`)
					set(userRef, {
						...matchedUser,
						matched: JSON.stringify(data.activity),
					}).catch(error =>
						console.error('Ошибка при обновлении статуса пользователя:', error)
					)
				})
			})
			.catch(error => {
				console.error(error)
			})
	}

	function matchPlus(userId) {
		const userRef = ref(db, `groups/${groupID}/${userId}`)
		const member = groupMembers.find(member => member.id === userId)
		if (member) {
			set(userRef, {
				...member,
				match:
					(member.match ? member.match + ';' : '') +
					JSON.stringify(data.activity),
			})
				.then(() => game()) // Вызов game() после обновления совпадений
				.catch(error =>
					console.error('Ошибка при обновлении статуса пользователя:', error)
				)
		}
	}

	const handleTouchStart = event => {
		setTouchStartX(event.touches[0].clientX)
	}

	const handleTouchMove = event => {
		const touchX = event.touches[0].clientX
		const plusButtonRect = document
			.getElementById('plusButton')
			.getBoundingClientRect()
		const minusButtonRect = document
			.getElementById('minusButton')
			.getBoundingClientRect()

		if (touchX >= plusButtonRect.left && touchX <= plusButtonRect.right) {
			setTouchEndX(event.touches[0].clientX)
		} else if (
			touchX >= minusButtonRect.left &&
			touchX <= minusButtonRect.right
		) {
			setTouchEndX(event.touches[0].clientX)
		}
	}

	const handleTouchEnd = event => {
		if (touchStartX && touchEndX) {
			const diff = touchEndX - touchStartX
			if (diff > 0) {
				console.log('Swipe right')
			} else if (diff < 0) {
				console.log('Swipe left')
			}
			setTouchStartX(null)
			setTouchEndX(null)
		}
	}

	const handleMouseDown = event => {
		setMouseStartX(event.clientX)
	}

	const handleMouseMove = event => {
		const mouseX = event.clientX
		const plusButtonRect = document
			.getElementById('plusButton')
			.getBoundingClientRect()
		const minusButtonRect = document
			.getElementById('minusButton')
			.getBoundingClientRect()

		if (
			(mouseStartX &&
				mouseX >= plusButtonRect.left &&
				mouseX <= plusButtonRect.right) ||
			(mouseX >= minusButtonRect.left && mouseX <= minusButtonRect.right)
		) {
			setMouseEndX(event.clientX)
		}
	}

	const handleMouseUp = () => {
		if (mouseStartX && mouseEndX) {
			const diff = mouseEndX - mouseStartX
			if (diff > 0) {
				console.log('Swipe right')
			} else if (diff < 0) {
				console.log('Swipe left')
			}
			setMouseStartX(null)
			setMouseEndX(null)
		}
	}

	return (
		<div style={{ display: 'flex' }}>
			<div>
				<Notification />
				<JoinGroup />
				<Friend />
			</div>
			<div>
				<div ref={beforeStart}>
					{user ? (
						<div>
							{groupMembers.some(member => member.id === user.uid) ? (
								<button onClick={() => removeFromGroup(user)}>Выйти</button>
							) : (
								<button onClick={() => joinGroup(user)}>
									Присоединиться к группе
								</button>
							)}
							<h3>Участники группы:</h3>
							<ul>
								<ul>
									{groupMembers.map(member => (
										<li key={member.id}>
											<p>{member.name}</p>
											<p>Ready: {member.ready}</p>
											{(userFriends.length > 0
												? userFriends.some(friend => friend.id !== member.id)
												: true) &&
											member.id !== user.uid &&
											member.name !== 'anonymous' &&
											!user.isAnonymous ? (
												<button
													onClick={() => inviteFriend(member.id, member.name)}
												>
													Добавить в друзья
												</button>
											) : null}
										</li>
									))}
								</ul>
							</ul>
							{groupMembers.map(member =>
								member.id === user.uid && groupMembers.length >= 2 ? (
									<button key={member.id} onClick={() => ready(user)}>
										{member.ready === 'yes' ? 'Not ready' : 'Ready'}
									</button>
								) : null
							)}
						</div>
					) : (
						<div>
							<h2>Пожалуйста, войдите в систему</h2>
							<Link to={'/login'}>Login</Link>
						</div>
					)}
				</div>
				<div ref={Start} style={{ display: 'none' }}>
					<div ref={startBtn} style={{ display: 'block' }}>
						<button onClick={() => start('random')}>Random</button>
						<button onClick={() => start('education')}>Education</button>
						<button onClick={() => start('recreational')}>Recreational</button>
						<button onClick={() => start('social')}>Social</button>
						<button onClick={() => start('diy')}>DIY</button>
						<button onClick={() => start('charity')}>Charity</button>
						<button onClick={() => start('cooking')}>Cooking</button>
						<button onClick={() => start('relaxation')}>Relaxation</button>
						<button onClick={() => start('music')}>Music</button>
						<button onClick={() => start('busywork')}>Busywork</button>
					</div>
					<div
						ref={goToMatch}
						className='swipeable-element'
						style={{ display: matched ? 'none' : 'none' }}
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
					>
						<div>
							<button
								className='matchBtn'
								id='plusButton'
								onClick={() => matchPlus(user.uid)}
							>
								+
							</button>
						</div>

						<div>
							{data
								? JSON.stringify(data.activity).replace(/['"]+/g, '')
								: null}
						</div>
						<div>
							<button
								className='matchBtn'
								id='minusButton'
								onClick={() => game()}
							>
								-
							</button>
						</div>
					</div>
					{matched ? matched.replace(/['"]+/g, '') : null}
				</div>
			</div>
		</div>
	)
}

export default Group
