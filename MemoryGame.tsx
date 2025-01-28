/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import './MemoryGame.css';

const MemoryGame: React.FC = () => {
  const [revealed, setRevealed] = useState<boolean[]>(Array(16).fill(false));
  const [answers, setAnswers] = useState<number[]>([]);
  const [showingAnswers, setShowingAnswers] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [energy, setEnergy] = useState<number>(100);
  const [score, setScore] = useState<number>(0);
  const [correctTaps, setCorrectTaps] = useState<number>(0);
  const [level, setLevel] = useState<number>(4);
  const [tap, setTap] = useState<number>(0);
  const [allTaps, setAllTaps] = useState<number>(4);
  const [won, setWon] = useState<number>(0);
  const [addAnswers, setAddAnswers] = useState<number>(0);
  const [hasReferralCode, setHasReferralCode] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  useEffect(() => {
    if (hasStarted) {
      const audio = new Audio('/background.mp3');
      audio.loop = true;
      audio.play().catch(error => console.log("Playback failed:", error));
    }
  }, [hasStarted]);

  useEffect(() => {
    loadGameData();
    checkReferralCode();
  }, []);

  const loadGameData = () => {
    const lastPlayDate = localStorage.getItem('lastPlayDate');
    const now = new Date();
    const lastPlayDateObj = lastPlayDate ? new Date(lastPlayDate) : now;
    const playCount = parseInt(localStorage.getItem('playCount') || '0');

    if ((now.getTime() - lastPlayDateObj.getTime()) / (1000 * 60 * 60 * 24) >= 1) {
      localStorage.setItem('playCount', '0');
    }

    resetGame();
  };

  const updateGameData = () => {
    const now = new Date();
    localStorage.setItem('lastPlayDate', now.toISOString());
    const playCount = (parseInt(localStorage.getItem('playCount') || '0') || 0) + 1;
    localStorage.setItem('playCount', playCount.toString());
  };

  const resetGame = () => {
    const newAnswers = generateRandomAnswers(level);
    setRevealed(Array(level * level).fill(false));
    setAnswers(newAnswers);
    setShowingAnswers(true);
    setGameOver(false);
    setCorrectTaps(0);
    setTap(0);
    setTimeout(() => setShowingAnswers(false), 1500);
  };

  const generateRandomAnswers = (size: number): number[] => {
    const allIndices = Array.from({ length: size * size }, (_, index) => index);
    allIndices.sort(() => Math.random() - 0.5);
    setAllTaps(size + addAnswers);
    return allIndices.slice(0, size + addAnswers);
  };

  const toggleCell = (index: number) => {
    if (gameOver || showingAnswers || energy <= 0) return;

    const isAnswer = answers.includes(index);
    setRevealed(prev => {
      const newRevealed = [...prev];
      if (isAnswer) {
        if (!newRevealed[index]) {
          newRevealed[index] = true;
          setCorrectTaps(correctTaps + 1);
          setTap(tap + 1);
          if (tap <= allTaps) {
            new Audio('/tap.mp3').play();
          }
        }
        if (correctTaps + 1 === answers.length) {
          setScore(score + 100);
          setEnergy(energy - 1);
          new Audio('/won.mp3').play();
          showGameWonDialog();
        }
      } else {
        newRevealed[index] = true;
        setGameOver(true);
        setEnergy(energy - 1);
        new Audio('/game_over.mp3').play();
        showGameOverDialog();
      }
      return newRevealed;
    });
    if (energy <= 0) {
      updateGameData();
    }
  };

  const showGameOverDialog = () => {
    alert('Game Over: You tapped an incorrect answer.');
    resetGame();
  };

  const showGameWonDialog = () => {
    setWon(won + 1);
    if (won % 50 === 0) {
      setLevel(level + 1);
      if (level > 6) setLevel(6);
    }
    if (won % 5 === 0) {
      setAddAnswers(addAnswers + 1);
    }
    alert('Congratulations! You have matched all the answers.');
    resetGame();
  };

  const checkReferralCode = () => {
    const referralCode = localStorage.getItem('friendReferralCode1');
    setHasReferralCode(referralCode !== null);
  };

  const handleReferralCodeFromFriend = (code: string) => {
    localStorage.setItem('friendReferralCode', code);
    setHasReferralCode(true);
    alert(`Referral code "${code}" saved!`);
  };

  const showReferralCodeDialog = (code: string) => {
    const url = `https://yourgame.com/referral?code=${code}`;
    alert(`Join me in the game! Use my referral code: ${code} or click ${url}`);
  };

  return (
    <div className="memory-game">
      {!hasStarted && <button onClick={() => setHasStarted(true)}>Start Game</button>}
      <div>Energy: {energy}</div>
      <div>{tap} : {allTaps}</div>
      <div>Score: {score}</div>
      <div className="grid-container">
        {revealed.map((isRevealed, index) => {
          const isAnswer = answers.includes(index);
          const cellColor = gameOver && !isAnswer && isRevealed ? 'red' : (isRevealed ? (isAnswer ? 'green' : 'blue') : 'red');
          return (
            <div
              key={index}
              className={`grid item cell ${cellColor}`}
              onClick={() => toggleCell(index)}
            />
          );
        })}
      </div>
      <button onClick={() => showReferralCodeDialog('yourReferralCode')}>Share Referral Code</button>
      {!hasReferralCode && <button onClick={() => showReferralCodeDialog('')}>Enter Friend's Referral Code</button>}
    </div>
  );
};

export default MemoryGame;
