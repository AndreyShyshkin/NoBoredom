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

function Group() {
	const [user, setUser] = useState(null)
	const [groupMembers, setGroupMembers] = useState([])
	const [userFriends, setUserFriends] = useState([])
	const beforeStart = useRef()

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
		if (user) {
			try {
				await removeFromGroup(user)
			} catch (error) {
				console.error('Ошибка удаления из группы:', error)
			}
		}
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
			if (allUsersReady && groupMembers.length >= 2) {
				// Изменение условия проверки
				beforeStart.current.style.display = 'none'
			}
		}
	}, [user, groupMembers])

	return (
		<div ref={beforeStart}>
			<Friend />
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
	)
}

export default Group
