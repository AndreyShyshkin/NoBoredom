import { getAuth, onAuthStateChanged } from 'firebase/auth'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './app/styles/main.styles.scss'
import Group from './functions/group'
import Home from './home/Home'
import SingIn from './sing/SingIn'

const AppRouter = () => {
	const [user, setUser] = useState(null)
	const auth = getAuth()

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
	}, [auth])

	return (
		<BrowserRouter>
			<nav>
				<div>
					<Link to='/'>NoBoredom</Link>
				</div>
				<div>
					{user ? (
						<span>
							{!user.isAnonymous && user.displayName
								? user.displayName
								: 'anonymous'}
						</span>
					) : (
						<Link to='/login'>login</Link>
					)}
				</div>
			</nav>
			<main>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='/group' element={<Group />} />
					<Route path='/login' element={<SingIn />} />
				</Routes>
			</main>
		</BrowserRouter>
	)
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<React.StrictMode>
		<div className='container'>
			<AppRouter />
		</div>
	</React.StrictMode>
)
