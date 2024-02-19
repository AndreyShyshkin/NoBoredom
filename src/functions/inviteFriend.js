import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, ref, set } from 'firebase/database'
import '../../firebase.config'
const db = getDatabase()
const auth = getAuth()

export default function inviteFriend(friendId, friendName) {
	onAuthStateChanged(auth, user => {
		if (user) {
			set(ref(db, 'users/' + friendId + '/inviteFromFriends/' + user.uid), {
				id: user.uid,
				name: user.displayName,
			})
			set(ref(db, 'users/' + user.uid + '/inviteToFriends/' + friendId), {
				id: friendId,
				name: friendName,
			})
		} else {
			console.log('error')
		}
	})
}
