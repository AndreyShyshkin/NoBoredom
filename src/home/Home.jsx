import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
const url = '//www.boredapi.com/api/activity/'
function Home() {
	const [data, setData] = useState(null)
	const [error, setError] = useState(null)

	useEffect(() => {
		fetch(url)
			.then(response => {
				if (
					!response.ok ||
					!response.headers.get('content-type')?.includes('application/json')
				) {
					throw new Error('Failed to get JSON')
				}
				return response.json()
			})
			.then(jsonData => {
				setData(jsonData)
			})
			.catch(fetchError => {
				setError(fetchError)
				console.error(fetchError)
			})
	}, [])

	if (error) {
		return <div>Error: {error.message}</div>
	}

	if (!data) {
		return <div>Loading...</div>
	}

	function generateRandomString(length) {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		let result = ''
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length))
		}
		return result
	}

	const randomString = generateRandomString(4)

	return (
		<>
			<div className='container'>
				<h1>NoBoredom</h1>
				<h2>Нечем заняться?</h2>
				<p>Займитесь:</p>
			</div>
			<div>{JSON.stringify(data.activity).replace(/['"]+/g, '')}</div>
			<div>{JSON.stringify(data.type).replace(/['"]+/g, '')}</div>
			<div>
				Не знаете чем заняться в компании? Зарегистрируйтесь для общего
				придумывания идеи.
			</div>
			<Link to={`/group?id=${randomString}`}>Создать группу</Link>
		</>
	)
}

export default Home
