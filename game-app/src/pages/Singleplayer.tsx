import React, { useState } from 'react';
import GameBoard from '../components/GameBoard';

const Singleplayer: React.FC = () => {
  const [board, setBoard] = useState(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const checkWinner = (newBoard: string[]) => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], 
      [0, 3, 6], [1, 4, 7], [2, 5, 8], 
      [0, 4, 8], [2, 4, 6]
    ];

    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        return newBoard[a];
      }
    }

    return newBoard.includes('') ? null : 'Empate';
  };

  const handleMove = (index: number) => {
    if (board[index] || isGameOver) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    const result = checkWinner(newBoard);
    if (result) {
      setIsGameOver(true);
      setWinner(result === 'Empate' ? null : result);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }

    setBoard(newBoard);
  };

  return (
    <GameBoard
      playerType="singleplayer"
      onMove={handleMove}
      board={board}
      currentPlayer={currentPlayer}
      isGameOver={isGameOver}
      winner={winner}
    />
  );
};

export default Singleplayer;
