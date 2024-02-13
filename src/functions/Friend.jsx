import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, onValue, ref } from 'firebase/database'
import { useEffect, useRef, useState } from 'react'
import '../../firebase.config'
const auth = getAuth()
const db = getDatabase()

function Friend() {
	const [user, setUser] = useState(null)
	const [userFriends, setUserFriends] = useState([])
	const userRef = useRef(null)
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
		return () => {
			unsubscribe()
		}
	}, [user])

	useEffect(() => {
		if (user) {
			const friendRef = ref(db, 'users/' + user.uid + '/friends')
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

	return (
		<div>
			{user ? (
				<div>
					<p>Friend list:</p>
					<div>
						{userFriends.map(friend => (
							<li key={friend.id}>{friend.name}</li>
						))}
					</div>
				</div>
			) : (
				<div>
					<h2>Пожалуйста, войдите в систему</h2>
				</div>
			)}
		</div>
	)
}

export default Friend
