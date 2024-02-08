import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Group from './functions/group'
import Home from './home/Home'
import './main.styles.scss'

const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			<Route path='/' element={<Home />} />
			<Route path='/functions/group' element={<Group />} />
		</Routes>
	</BrowserRouter>
)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<React.StrictMode>
		<AppRouter />
	</React.StrictMode>
)
