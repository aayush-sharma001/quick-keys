import React, { useState, useEffect, useRef } from 'react';
import { easyWordMap, hardWordMap } from '../../Helper/words';
import './typingArea.css';

const wordCounts = {
	15: 70,
	30: 150,
	60: 300
};

const TypingArea = ({ resetCount }) => {
	const [words, setWords] = useState(wordCounts[30]);
	const [level, setLevel] = useState('easy');
	const [time, setTime] = useState(30);
	const [paragraph, setParagraph] = useState('');

	const [userInput, setUserInput] = useState('');
	const [startTime, setStartTime] = useState(null);
	const [endTime, setEndTime] = useState(null);
	const [countdown, setCountdown] = useState(time);
	const [speed, setSpeed] = useState(0);
	const [accuracy, setAccuracy] = useState(0);
	const typingAreaRef = useRef(null);
	const [wrongCharCount, setWrongCharCount] = useState(0);
	const [testCompleted, setTestCompleted] = useState(false);

	useEffect(() => {
		resetTest();
	}, [resetCount]);

	useEffect(() => {
		setWords(wordCounts[time]);
		setParagraph(randomParagraph(level, wordCounts[time]));
		resetTest();
	}, [time, level, resetCount]);

	useEffect(() => {
		let timerId;

		if (startTime && countdown > 0) {
			timerId = setTimeout(() => {
				const newCountdown = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
				setCountdown(newCountdown);

				if (newCountdown <= 0) {
					calculateFinalResults();
				}
			}, 1000);
		}

		return () => clearTimeout(timerId);
	}, [countdown, startTime, endTime]);

	useEffect(() => {
		if (startTime && countdown > 0) {
			calculateIntermediateResults();
		}
	}, [userInput]);

	const getRandomWords = (wordArray, count) => {
		const shuffledArray = [...wordArray].sort(() => 0.5 - Math.random());
		return shuffledArray.slice(0, count);
	};

	const randomParagraph = (level, words) => {
		let paragraph = '';
		if (level === 'easy') {
			paragraph = getRandomWords(easyWordMap, words).join(" ");
		} else if (level === 'hard') {
			paragraph = getRandomWords(hardWordMap, words).join(" ");
		} else if (level === 'medium') {
			const halfWords = Math.floor(words / 2);
			const easyWords = getRandomWords(easyWordMap, halfWords);
			const hardWords = getRandomWords(hardWordMap, words - halfWords);
			const combinedWords = easyWords.concat(hardWords).sort(() => 0.5 - Math.random());
			paragraph = combinedWords.join(" ");
		}
		return paragraph;
	};

	const handleKeyDown = (event) => {
		if (testCompleted || countdown <= 0) return;

		if (event.key === 'Tab') {
			event.preventDefault();
			return;
		}

		if (!startTime && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
			setStartTime(Date.now());
			setEndTime(Date.now() + time * 1000);
			setTestCompleted(false);
		}

		if (event.key === 'Backspace') {
			setUserInput((prev) => prev.slice(0, -1));
		} else if (event.key === ' ' && userInput.slice(-1) !== ' ') {
			setUserInput((prev) => prev + ' ');
		} else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
			setUserInput((prev) => prev + event.key);
		}
	};

	const countWords = (text) => {
		const wordsArray = text.trim().split(/\s+/);
		return wordsArray.filter(word => word.length > 0).length;
	};

	const getDisplayText = () => {
		let displayText = '';
		const inputLength = userInput.length;
		const paragraphLength = paragraph.length;

		for (let i = 0; i < paragraphLength; i++) {
			if (i < inputLength) {
				if (userInput[i] === paragraph[i]) {
					displayText += `<span class="correct">${paragraph[i]}</span>`;
				} else {
					displayText += `<span class="incorrect">${paragraph[i]}</span>`;
				}
			} else if (i === inputLength) {
				displayText += '<span class="cursor">|</span>';
				displayText += paragraph[i];
			} else {
				displayText += paragraph[i];
			}
		}

		if (inputLength >= paragraphLength) {
			displayText += '<span class="cursor">|</span>';
		}

		return displayText;
	};

	const calculateIntermediateResults = () => {
		let correctChars = 0;
		const inputLength = userInput.length;

		for (let i = 0; i < inputLength; i++) {
			if (i < paragraph.length && userInput[i] === paragraph[i]) {
				correctChars++;
			}
		}

		const totalChars = Math.max(inputLength, 1);
		const newAccuracy = (correctChars / totalChars) * 100;
		setAccuracy(newAccuracy);

		const elapsedMinutes = (time - countdown) / 60;
		const currentSpeed = countWords(userInput) / Math.max(elapsedMinutes, 0.1);
		setSpeed(currentSpeed);
	};

	const calculateFinalResults = () => {
		if (!startTime || testCompleted) return;

		const totalWordsWritten = countWords(userInput);
		const timeInMinutes = time / 60;
		const wpm = Math.round(totalWordsWritten / timeInMinutes);

		let correctChars = 0;
		const inputLength = userInput.length;

		for (let i = 0; i < inputLength; i++) {
			if (i < paragraph.length && userInput[i] === paragraph[i]) {
				correctChars++;
			}
		}

		const finalAccuracy = inputLength > 0 ? (correctChars / inputLength) * 100 : 0;

		setSpeed(wpm);
		setAccuracy(finalAccuracy);
		setTestCompleted(true);
	};

	const resetTest = () => {
		setStartTime(null);
		setEndTime(null);
		setCountdown(time);
		setUserInput('');
		setSpeed(0);
		setAccuracy(0);
		setTestCompleted(false);
		setWrongCharCount(0);

		// Focus the typing area on reset
		if (typingAreaRef.current) {
			typingAreaRef.current.focus();
		}
	};

	useEffect(() => {
		const handleKeyDownWrapper = (event) => handleKeyDown(event);
		window.addEventListener('keydown', handleKeyDownWrapper);
		return () => {
			window.removeEventListener('keydown', handleKeyDownWrapper);
		};
	}, [userInput, countdown, testCompleted]);

	return (
		<div className='typingDiv' ref={typingAreaRef} tabIndex="0">
			<div className='typingSettingsBar'>
				<div className='levels'>
					Select Level:
					<span onClick={() => setLevel('easy')} className={level === 'easy' ? 'selected' : ''}>Easy</span>
					<span onClick={() => setLevel('medium')} className={level === 'medium' ? 'selected' : ''}>Medium</span>
					<span onClick={() => setLevel('hard')} className={level === 'hard' ? 'selected' : ''}>Hard</span>
				</div>
				<div className='timer'>
					Select Timer:
					<span onClick={() => setTime(15)} className={time === 15 ? 'selected' : ''}>15s</span>
					<span onClick={() => setTime(30)} className={time === 30 ? 'selected' : ''}>30s</span>
					<span onClick={() => setTime(60)} className={time === 60 ? 'selected' : ''}>60s</span>
				</div>
			</div>
			<div className='typingArea'>
				<p id="original-text">{paragraph}</p>
				<p
					id="typed-text"
					dangerouslySetInnerHTML={{ __html: getDisplayText() }}
				/>
			</div>
			<div className='countdown'>
				{startTime ? (
					<p>Time Left: {countdown} seconds</p>
				) : (
					<p>Start typing to begin the timer!</p>
				)}
			</div>
			<div className='results'>
				<div className='mainData'>
					<p>Speed: {Math.round(speed)} WPM</p>
					<p>Accuracy: {accuracy.toFixed(2)}%</p>
				</div>
				<div className='resetButton'>
					{testCompleted && (
						<button onClick={resetTest}>Restart Test</button>
					)}
				</div>

			</div>
		</div>
	);
};

export default TypingArea;