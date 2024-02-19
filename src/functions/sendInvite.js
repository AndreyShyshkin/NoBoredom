import { getDatabase, ref, set } from 'firebase/database'
import '../../firebase.config'

const db = getDatabase()

function SendInvite(userId, userDisplayName, userGroupId) {
	const userRef = ref(db, 'users/' + userId + '/invite/inviteTo' + userGroupId)
	set(userRef, {
		inviteName: userDisplayName,
		inviteGroup: userGroupId,
	})
	setTimeout(() => {
		set(userRef, {
			inviteName: null,
			inviteGroup: null,
		})
	}, 30000)
}

export default SendInvite
