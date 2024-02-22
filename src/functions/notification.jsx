import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
const auth = getAuth()
const db = getDatabase()

function Notification() {
	const [user, setUser] = useState(null)
	const [notifications, setNotifications] = useState([])
	const navigate = useNavigate()
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, user => {
			if (user) {
				setUser(user)
			} else {
				setUser(null)
			}
		})

		return () => {
			unsubscribe()
		}
	}, [])

	useEffect(() => {
		if (user) {
			const notificationRef = ref(db, 'users/' + user.uid + '/invite')
			onValue(notificationRef, snapshot => {
				const data = snapshot.val()
				if (data) {
					const dates = Object.values(data)
					setNotifications(dates)
				} else {
					setNotifications([])
				}
			})
		}
	}, [user])

	function accept(user, inviteGroup) {
		const userRef = ref(db, 'users/' + user.uid + '/invite')
		set(userRef, {
			inviteName: null,
			inviteGroup: null,
		})
		navigate(`/group?id=${inviteGroup}`)
	}

	function decline(user) {
		const userRef = ref(db, 'users/' + user.uid + '/invite')
		set(userRef, {
			inviteName: null,
			inviteGroup: null,
		})
	}

	return (
		<div>
			{notifications.map((notification, index) =>
				notification ? (
					<li key={notification.id || index}>
						<h1>Notification</h1>
						{notification.inviteName}{' '}
						<button onClick={() => decline(user)}>Отклонить</button>
						<button onClick={() => accept(user, notification.inviteGroup)}>
							Принять
						</button>{' '}
					</li>
				) : null
			)}
		</div>
	)
}

export default Notification
