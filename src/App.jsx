import { useState } from 'react'
import Typing from './Components/TypingPage/typing'

function App() {
	const [count, setCount] = useState(0)

	return (
		<>
			<Typing/>   
		</>
	)
}

export default App
