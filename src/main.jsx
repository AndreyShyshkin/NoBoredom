import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Group from './functions/group'
import Home from './home/Home'
import './main.styles.scss'

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<Router>
			<Routes>
				<Route path='/' element={<Home />} />
				<Route path='/functions/group' element={<Group />} />
			</Routes>
		</Router>
	</React.StrictMode>
)
