import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { getDatabase, onValue, ref, remove, set } from 'firebase/database'
import { useEffect, useRef, useState } from 'react'
import '../../firebase.config'
const auth = getAuth()
const db = getDatabase()
let $_GET = {}

function Group() {
	const [user, setUser] = useState(null)
	const [groupMembers, setGroupMembers] = useState([])
	const userRef = useRef(null)

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
				userRef.current = user
			} else {
				setUser(null)
				userRef.current = null
			}
		})

		window.addEventListener('beforeunload', handleBeforeUnload)

		return () => {
			unsubscribe()
			window.removeEventListener('beforeunload', handleBeforeUnload)
		}
	}, [])

	async function handleBeforeUnload(event) {
		event.preventDefault() // Отменяем закрытие вкладки
		const user = userRef.current
		if (user) {
			try {
				event.returnValue = '' // Устанавливаем пустое значение для возврата строки
				await removeFromGroup(user) // Ждем завершения операции удаления
				window.removeEventListener('beforeunload', handleBeforeUnload) // Удаляем обработчик события
				window.close() // Закрываем вкладку
			} catch (error) {
				console.error('Ошибка удаления из группы:', error)
			}
		}
	}

	function removeFromGroup(user) {
		return new Promise((resolve, reject) => {
			const groupRef = ref(db, 'groups/' + groupID)
			onValue(groupRef, snapshot => {
				const data = snapshot.val()
				if (data) {
					const members = Object.values(data)
					if (members.length === 1 && members[0] === user.uid) {
						remove(ref(db, 'groups/' + groupID))
							.then(() => resolve()) // Успешно удалено
							.catch(error => reject(error)) // Обработка ошибки
					} else {
						const updatedMembers = members.filter(member => member !== user.uid)
						set(groupRef, updatedMembers)
							.then(() => resolve()) // Успешно удалено
							.catch(error => reject(error)) // Обработка ошибки
					}
				}
			})
		})
	}

	function joinGroup(user) {
		// Присоединение пользователя к группе
		set(ref(db, 'groups/' + groupID), {
			userId: user.uid,
		})
	}

	useEffect(() => {
		if (user) {
			const groupRef = ref(db, 'groups/' + groupID)
			onValue(groupRef, snapshot => {
				// Use onValue instead of on
				const data = snapshot.val()
				if (data) {
					const members = Object.values(data) // Convert object to array
					setGroupMembers(members)
				} else {
					setGroupMembers([]) // Set an empty array if no data
				}
			})
		}
	}, [user])

	return (
		<div>
			{user ? (
				<div>
					<h2>Вы вошли в систему как {user.uid}</h2>
					<button onClick={() => joinGroup(user)}>
						Присоединиться к группе
					</button>
					<button onClick={() => console.log(user)}>выйти</button>
					<h3>Участники группы:</h3>
					<ul>
						{groupMembers.map(memberId => (
							<li key={memberId}>{memberId}</li>
						))}
					</ul>
				</div>
			) : (
				<div>
					<h2>Пожалуйста, войдите в систему</h2>
					<button onClick={() => signInAnonymously(auth)}>
						Войти анонимно
					</button>
				</div>
			)}
		</div>
	)
}

export default Group
