import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getDatabase, onValue, ref, set } from 'firebase/database'
import { useEffect, useRef, useState } from 'react'
import '../../firebase.config'
import GET from './GET'
import addFriend from './addFriend'
import SendInvite from './sendInvite'
const auth = getAuth()
const db = getDatabase()

function Friend() {
	const [user, setUser] = useState(null)
	const [userFriends, setUserFriends] = useState([])
	const [inviteFrom, setInviteFrom] = useState([])
	const [inviteTo, setInviteTo] = useState([])
	const userRef = useRef(null)
	const friendList = useRef()
	const friendInviteFrom = useRef()
	const friendInviteTo = useRef()

	const groupID = GET('id')

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
			switchFriendBtn()
			const friendRef = ref(db, 'users/' + user.uid + '/friends')
			const inviteFromRef = ref(db, 'users/' + user.uid + '/inviteFromFriends')
			const inviteToRef = ref(db, 'users/' + user.uid + '/inviteToFriends')
			onValue(friendRef, snapshot => {
				const data = snapshot.val()
				if (data) {
					const friends = Object.values(data)
					setUserFriends(friends)
				} else {
					setUserFriends([])
				}
			})
			onValue(inviteFromRef, snapshot => {
				const data = snapshot.val()
				if (data) {
					const dates = Object.values(data)
					setInviteFrom(dates)
				} else {
					setInviteFrom([])
				}
			})
			onValue(inviteToRef, snapshot => {
				const data = snapshot.val()
				if (data) {
					const dates = Object.values(data)
					setInviteTo(dates)
				} else {
					setInviteTo([])
				}
			})
		}
	}, [user])

	function declineInviteTo(friendId) {
		set(ref(db, 'users/' + friendId + '/inviteFromFriends/' + user.uid), {
			id: null,
			name: null,
		})
		set(ref(db, 'users/' + user.uid + '/inviteToFriends/' + friendId), {
			id: null,
			name: null,
		})
	}
	function declineInviteFrom(friendId) {
		set(ref(db, 'users/' + friendId + '/inviteToFriends/' + user.uid), {
			id: null,
			name: null,
		})
		set(ref(db, 'users/' + user.uid + '/inviteFromFriends/' + friendId), {
			id: null,
			name: null,
		})
	}

	function acceptInvite(friendId, friendName) {
		declineInviteFrom(friendId)
		addFriend(user.uid, friendId, friendName)
		addFriend(friendId, user.uid, user.displayName)
	}

	function goToRemoveFriend(myId, friendId) {
		removeFriend(myId, friendId)
		removeFriend(friendId, myId)
	}

	function removeFriend(myId, friendId) {
		set(ref(db, 'users/' + myId + '/friends/' + friendId), {
			id: null,
			name: null,
		})
	}

	function switchFriendBtn(key) {
		switch (key) {
			case 'friendList':
				friendList.current.style.display = 'block'
				friendInviteFrom.current.style.display = 'none'
				friendInviteTo.current.style.display = 'none'
				break
			case 'friendInviteFrom':
				friendInviteFrom.current.style.display = 'block'
				friendList.current.style.display = 'none'
				friendInviteTo.current.style.display = 'none'
				break
			case 'friendInviteTo':
				friendInviteTo.current.style.display = 'block'
				friendList.current.style.display = 'none'
				friendInviteFrom.current.style.display = 'none'
				break
			default:
				friendList.current.style.display = 'block'
				friendInviteFrom.current.style.display = 'none'
				friendInviteTo.current.style.display = 'none'
				break
		}
	}

	return (
		<div>
			{user ? (
				<div>
					<div>
						<button onClick={() => switchFriendBtn('friendList')}>
							Friend list:
						</button>
						<button onClick={() => switchFriendBtn('friendInviteFrom')}>
							inviteFrom:
						</button>
						<button onClick={() => switchFriendBtn('friendInviteTo')}>
							inviteTo:
						</button>
					</div>
					<div>
						<div ref={friendList}>
							<p>Friend list:</p>
							{userFriends.map(friend => (
								<li key={friend.id}>
									{friend.name}{' '}
									<button
										onClick={() =>
											SendInvite(friend.id, user.displayName, groupID)
										}
									>
										Пригласить
									</button>
									<button onClick={() => goToRemoveFriend(user.uid, friend.id)}>
										Удалить
									</button>{' '}
								</li>
							))}
						</div>
						<div ref={friendInviteFrom}>
							<p>inviteFrom:</p>
							{inviteFrom.map(friend => (
								<li key={friend.id}>
									{friend.name}{' '}
									<button onClick={() => acceptInvite(friend.id, friend.name)}>
										Принять
									</button>
									<button onClick={() => declineInviteFrom(friend.id)}>
										Отменить
									</button>{' '}
								</li>
							))}
						</div>
						<div ref={friendInviteTo}>
							<p>inviteTo:</p>
							{inviteTo.map(friend => (
								<li key={friend.id}>
									{friend.name}{' '}
									<button onClick={() => declineInviteTo(friend.id)}>
										Отменить
									</button>{' '}
								</li>
							))}
						</div>
					</div>
				</div>
			) : null}
		</div>
	)
}

export default Friend
