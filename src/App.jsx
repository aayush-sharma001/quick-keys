import { useState } from 'react'
import './App.css'
import Typing from './Components/Typing/typing'

function App() {
	const [count, setCount] = useState(0)

	return (
		<>
			<Typing/>   
		</>
	)
}

export default App
