import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, onValue, ref, remove, set } from 'firebase/database'
import { useEffect, useState } from 'react'
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
		event.preventDefault() // Отменяем закрытие вкладки
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
		}).catch(error => {
			console.error('Ошибка при присоединении к группе:', error)
		})
	}

	useEffect(() => {
		if (user) {
			const groupRef = ref(db, 'groups/' + groupID)
			onValue(groupRef, snapshot => {
				const data = snapshot.val()
				if (data) {
					const members = Object.values(data)
					setGroupMembers(members)
				} else {
					setGroupMembers([])
				}
			})
		}
	}, [user])

	return (
		<div>
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
					<button onClick={() => console.log(user)}>выйти</button>
					<h3>Участники группы:</h3>
					<ul>
						{groupMembers.map(member => (
							<li key={member.id}>
								<p>{member.name}</p>
								{member.id != user.uid &&
								member.name != 'anonymous' &&
								!user.isAnonymous ? (
									<button onClick={() => addFriend(member.id, member.name)}>
										Добавить в друзей
									</button>
								) : null}
							</li>
						))}
					</ul>
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
