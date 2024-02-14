import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, onValue, ref, remove, set } from 'firebase/database'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../../firebase.config'
import Friend from './Friend'
import addFriend from './addFriend'
const auth = getAuth()
const db = getDatabase()
let $_GET = {}
let onGame = false

function Group() {
	const [user, setUser] = useState(null)
	const [data, setData] = useState(null)
	const [groupMembers, setGroupMembers] = useState([])
	const [userFriends, setUserFriends] = useState([])
	const beforeStart = useRef()
	const Start = useRef()
	const goToMatch = useRef()
	const startBtn = useRef()

	function GET() {
		let url = new URL(window.location.href)
		let params = new URLSearchParams(url.search)
		params.forEach((value, key) => {
			$_GET[key] = value
		})
	}
	GET()

	const groupID = $_GET['id']

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
				member => member.type == groupMembers[0].type && member.type != ''
			)
			if (allUsersSameType && groupMembers.length != 0 && onGame !== true) {
				console.log('all users same type')
				game()
			}
			if (allUsersReady && groupMembers.length >= 2) {
				beforeStart.current.style.display = 'none'
				Start.current.style.display = 'block'
			}
		}
	}, [user, groupMembers])

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
		onGame = true
		startBtn.current.style.display = 'none'
		goToMatch.current.style.display = 'block'

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
				// Combine all results into one
				const combinedData = results.reduce(
					(acc, data) => {
						acc.activity += data.activity + ' '
						return acc
					},
					{ activity: '' }
				)

				// Set the combined data once
				setData(combinedData)
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
				match: member.match + JSON.stringify(data.activity),
			})
				.then(game())
				.catch(error =>
					console.error('Ошибка при обновлении статуса пользователя:', error)
				)
		}
	}

	return (
		<div>
			<Friend />
			<div ref={beforeStart}>
				{user ? (
					<div>
						<h2>
							Вы вошли в систему как{' '}
							{!user.isAnonymous && user.displayName
								? user.displayName
								: 'anonymous'}
						</h2>
						<button onClick={() => joinGroup(user)}>
							Присоединиться к группе
						</button>
						{groupMembers.map(member =>
							member.id === user.uid ? (
								<button key={member.id} onClick={() => removeFromGroup(user)}>
									выйти
								</button>
							) : null
						)}
						<h3>Участники группы:</h3>
						<ul>
							<ul>
								{groupMembers.map(member => (
									<li key={member.id}>
										<p>{member.name}</p>
										<p>Ready: {member.ready}</p>
										{userFriends.some(friend => friend.id !== member.id) &&
										member.id !== user.uid &&
										member.name !== 'anonymous' &&
										!user.isAnonymous ? (
											<button onClick={() => addFriend(member.id, member.name)}>
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
				<div>
					{data ? JSON.stringify(data.activity).replace(/['"]+/g, '') : null}
				</div>
				<div ref={goToMatch} style={{ display: 'none' }}>
					<button onClick={() => matchPlus(user.uid)}>+</button>
					<button onClick={() => game()}>-</button>
				</div>
			</div>
		</div>
	)
}

export default Group
