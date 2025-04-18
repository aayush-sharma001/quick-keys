import React, { useState, useEffect, useRef } from 'react';
import { easyWordMap, hardWordMap } from '../../Helper/words';
import './typingArea.css';

const wordCounts = {
    15: 70,
    30: 150,
    60: 300
};

const TypingArea = () => {
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
    const [wrongCharCount, setWrongCharCount] = useState(0)

    useEffect(() => {
        setWords(wordCounts[time]);
        setParagraph(randomParagraph(level, words));
        resetTest();
    }, [time, level]);

    useEffect(() => {
        if (startTime && endTime) {
            const id = setInterval(() => {
                const remainingTime = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
                console.log("Remaining time:", remainingTime);
                setCountdown(remainingTime);

                if (remainingTime <= 0) {
                    console.log("Time's up! Calculating results...");
                    clearInterval(id);
                    calculateResults();
                }
            }, 1000);
            return () => clearInterval(id);
        }
    }, [startTime, endTime]);

    // Reset timer if user deletes all input
    useEffect(() => {
        if (userInput.length === 0 && startTime) {
            console.log("User input is empty. Resetting timer.");
            resetTest();
        }
    }, [userInput, startTime]);

    useEffect(() => {
        if (startTime) {
            // Compare characters for accuracy
            let correctChars = 0;
            let totalCharsEntered = userInput.length;
            let wrongChars = 0;
    
            for (let i = 0; i < totalCharsEntered; i++) {
                if (i < paragraph.length && userInput[i] === paragraph[i]) {
                    correctChars++;
                } else {
                    wrongChars++;
                }
            }

            setWrongCharCount(wrongChars);
    
            // Calculate accuracy
            const accuracy = totalCharsEntered > 0 ? (((correctChars-wrongCharCount) / totalCharsEntered) * 100) : 0;
            console.log("Correct characters:", correctChars);
            console.log("Total characters entered:", totalCharsEntered);
            console.log("Calculated accuracy:", accuracy);
    
            // Update state
            setAccuracy(accuracy);
        }
    }, [userInput, startTime, paragraph]);

    // Real-time word count and accuracy calculation
    useEffect(() => {
        if (startTime) {
            const totalWordsWritten = countWords(userInput);
            console.log("Total words written:", totalWordsWritten);

            const originalWords = paragraph.trim().split(/\s+/);
            const userWords = userInput.trim().split(/\s+/);

            let correctWords = 0;
            let incorrectWords = 0;

            for (let i = 0; i < originalWords.length; i++) {
                if (i < userWords.length) {
                    if (userWords[i] === originalWords[i]) {
                        correctWords++;
                    } else {
                        incorrectWords++;
                    }
                } else {
                    incorrectWords += originalWords.length - i;
                    break;
                }
            }

            incorrectWords += Math.min(0, userWords.length - originalWords.length);

            const accuracy = ((correctWords / (correctWords + incorrectWords)) * 100) || 0;
            console.log("Correct words:", correctWords);
            console.log("Incorrect words:", incorrectWords);
            console.log("Calculated accuracy:", accuracy);

            setSpeed(totalWordsWritten); // Update speed in real-time
            // setAccuracy(accuracy); // Update accuracy in real-time
        }
    }, [userInput, startTime, paragraph]);

    // Generate random words from a word array
    const getRandomWords = (wordArray, count) => {
        // console.log("Getting random words from array:", wordArray);
        const shuffledArray = wordArray.sort(() => 0.5 - Math.random());
        // console.log("Shuffled array:", shuffledArray);
        return shuffledArray.slice(0, count);
    };

    // Generate a random paragraph based on level and word count
    const randomParagraph = (level, words) => {
        // console.log("Generating random paragraph for level:", level, "with word count:", words);
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
        // console.log("Generated paragraph:", paragraph);
        return paragraph;
    };

    // Handle keydown events
    const handleKeyDown = (event) => {
        if (countdown <= 0) return; 
        console.log("Key pressed:", event.key);
        if (!startTime && event.key.length === 1) {
            console.log("Timer started");
            setStartTime(Date.now());
            setEndTime(Date.now() + time * 1000);
        }

        if (event.key === 'Backspace') {
            console.log("Backspace pressed. Updating user input.");
            setUserInput((prev) => prev.slice(0, -1));
        } else if (event.key === ' ' && userInput.slice(-1) !== ' ') {
            console.log("Space pressed. Adding space to user input.");
            setUserInput((prev) => prev + ' ');
        } else if (event.key.length === 1) {
            console.log("Character pressed. Adding to user input.");
            setUserInput((prev) => prev + event.key);
        }
        console.log("Current user input:", userInput);
    };

    // Count the number of words in the input text
    const countWords = (text) => {
        console.log("Input text:", text);
        const wordsArray = text.trim().split(/\s+/);
        console.log("Words array:", wordsArray);
        const filteredWords = wordsArray.filter(Boolean);
        console.log("Filtered words:", filteredWords);
        const wordCount = filteredWords.length;
        console.log("Word count:", wordCount);
        return wordCount;
    };

    // Generate display text with correct/incorrect indicators
    const getDisplayText = () => {
        let displayText = '';

        for (let i = 0; i < paragraph.length; i++) {
            if (i < userInput.length) {
                if (userInput[i] === paragraph[i]) {
                    displayText += `<span class="correct">${paragraph[i]}</span>`;
                } else {
                    displayText += `<span class="incorrect">${paragraph[i]}</span>`;
                }
            } else if (i === userInput.length) {
                displayText += '<span class="cursor">|</span>';
                displayText += paragraph[i];
            } else {
                displayText += paragraph[i];
            }
        }

        if (userInput.length === paragraph.length) {
            displayText += '<span class="cursor">|</span>';
        }

        return displayText;
    };

    // Calculate final results when the timer ends
    const calculateResults = () => {
        console.log("Calculating results...");
        if (!startTime) {
            console.log("Start time not set. Exiting.");
            return;
        }

        const totalWordsWritten = countWords(userInput);
        console.log("Total words written:", totalWordsWritten);

        const timeInMinutes = time / 60;
        const wpm = Math.round(totalWordsWritten / timeInMinutes);

        const originalWords = paragraph.trim().split(/\s+/);
        const userWords = userInput.trim().split(/\s+/);

        let correctWords = 0;
        let incorrectWords = 0;
        let correctChars = 0;
        let totalCharsEntered = userInput.length;

        for (let i = 0; i < originalWords.length; i++) {
            if (i < userWords.length) {
                if (userWords[i] === originalWords[i]) {
                    correctWords++;
                } else {
                    incorrectWords++;
                }
            } else {
                incorrectWords += originalWords.length - i;
                break;
            }
        }

        incorrectWords += Math.min(0, userWords.length - originalWords.length);

        const accuracy = totalCharsEntered > 0 ? ((correctChars / totalCharsEntered) * 100) : 0;
        console.log("Correct words:", correctWords);
        console.log("Incorrect words:", incorrectWords);
        console.log("Calculated accuracy:", accuracy);

        setSpeed(wpm);
        setAccuracy(accuracy);
    };

    // Reset the test
    const resetTest = () => {
        console.log("Resetting test...");
        setStartTime(null);
        setEndTime(null);
        setCountdown(time);
        setUserInput('');
        setSpeed(0);
        setAccuracy(0);
    };

    // Add keydown event listener
    useEffect(() => {
        console.log("Effect: Adding keydown event listener");
        const handleKeyDownWrapper = (event) => handleKeyDown(event);
        document.addEventListener('keydown', handleKeyDownWrapper);
        return () => {
            console.log("Effect: Removing keydown event listener");
            document.removeEventListener('keydown', handleKeyDownWrapper);
        };
    }, [userInput]);

    return (
        <div className='typingDiv'>
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
            <div className='typingArea' ref={typingAreaRef}>
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
            {endTime && (
                <div className='results'>
                    <h2>Final Results</h2>
                    <p>Speed: {speed} WPM</p>
                    <p>Accuracy: {accuracy.toFixed(2)}%</p>
                </div>
            )}
        </div>
    );
};

export default TypingArea;