import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useEffect, useRef, useState } from 'react'
import '../../firebase.config'
const auth = getAuth()

function Friend() {
	const [user, setUser] = useState(null)
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
	}, [])

	return (
		<div>
			{user ? (
				<div>
					<p>Friend list:</p>
					<div></div>
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
