import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, set } from 'firebase/database'
import '../../firebase.config'
const db = getDatabase()
const auth = getAuth()

export default function addFriend(myId, friendId, friendName) {
	onAuthStateChanged(auth, user => {
		if (user) {
			set(ref(db, 'users/' + myId + '/friends/' + friendId), {
				id: friendId,
				name: friendName,
			})
		} else {
			console.log('error')
		}
	})
}
