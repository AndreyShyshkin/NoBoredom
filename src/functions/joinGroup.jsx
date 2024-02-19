import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../firebase.config'

function JoinGroup() {
	const joinInput = useRef()
	const navigate = useNavigate()
	const [joinInputValue, setJoinInputValue] = useState('')

	useEffect(() => {
		if (joinInput.current) {
			setJoinInputValue(joinInput.current.value)
		}
	}, [])

	function join() {
		if (joinInput.current && joinInput.current.value.length === 4) {
			navigate(`/group?id=${joinInput.current.value.toUpperCase()}`)
		}
	}

	return (
		<div>
			<div>
				<p>Присоединиться к группе:</p>
				<input
					type='text'
					ref={joinInput}
					maxLength='4'
					onChange={() => setJoinInputValue(joinInput.current.value)}
				/>
				<button onClick={join} disabled={joinInputValue.length !== 4}>
					Присоединиться
				</button>
			</div>
		</div>
	)
}

export default JoinGroup
