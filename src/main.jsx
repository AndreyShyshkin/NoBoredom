import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Group from './functions/group'
import Home from './home/Home'
import './main.styles.scss'
import SingIn from './sing/SingIn'

const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			<Route path='/' element={<Home />} />
			<Route path='/group' element={<Group />} />
			<Route path='/login' element={<SingIn />} />
		</Routes>
	</BrowserRouter>
)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<React.StrictMode>
		<a href='/'>Home</a>
		<AppRouter />
	</React.StrictMode>
)
