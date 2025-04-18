import React, { useState } from 'react';
import './typing.css';
import NavBar from '../NavBar/navbar';
import TypingArea from './../TypingArea/typingArea';

const Typing = () => {
    const [resetCount, setResetCount] = useState(0);

    return (
        <>
            <NavBar onReset={() => setResetCount(c => c + 1)} />
            <TypingArea resetCount={resetCount} />
        </>
    );
};

export default Typing;