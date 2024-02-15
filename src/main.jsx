import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './app/styles/main.styles.scss'
import Group from './functions/group'
import Home from './home/Home'
import SingIn from './sing/SingIn'

const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			<Route path='/' element={<Home />} />
			<Route
				path='/group'
				element={
					<>
						<Link to='/'>NoBoredom</Link>
						<Group />
					</>
				}
			/>
			<Route
				path='/login'
				element={
					<>
						<Link to='/'>NoBoredom</Link>
						<SingIn />
					</>
				}
			/>
		</Routes>
	</BrowserRouter>
)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<React.StrictMode>
		<div className='container'>
			<AppRouter />
		</div>
	</React.StrictMode>
)
