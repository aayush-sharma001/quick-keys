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
    const typingAreaRef = useRef(null);

    useEffect(() => {
        setWords(wordCounts[time]);
    }, [time]);

    useEffect(() => {
        setParagraph(randomParagraph(level, words));
    }, [words, level, time]);

    const getRandomWords = (wordArray, count) => {
        const shuffledArray = wordArray.sort(() => 0.5 - Math.random());
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
        if (event.key === 'Backspace') {
            setUserInput(userInput.slice(0, -1));
        } else if (event.key.length === 1) {
            setUserInput(userInput + event.key);
        }
    };

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

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [userInput]);

    useEffect(() => {
        const typingArea = typingAreaRef.current;
        const cursorElement = document.querySelector('.cursor');

        if (typingArea && cursorElement) {
            const cursorPosition = cursorElement.offsetTop + cursorElement.offsetHeight;
            const typingAreaHeight = typingArea.offsetHeight;
            const scrollTop = typingArea.scrollTop;

            if (cursorPosition > scrollTop + typingAreaHeight) {
                typingArea.scrollTop = cursorPosition - typingAreaHeight;
            }
        }
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
        </div>
    )
}

export default TypingArea

