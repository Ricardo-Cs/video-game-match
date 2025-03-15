// import React, { useState, useEffect } from 'react';
// import { io } from 'socket.io-client';
// import GameBoard from '../components/GameBoard';

// const socket = io('http://localhost:3333');

// const Multiplayer: React.FC = () => {
//   const [board, setBoard] = useState(Array(9).fill(''));
//   const [currentPlayer, setCurrentPlayer] = useState('X');
//   const [isGameOver, setIsGameOver] = useState(false);
//   const [winner, setWinner] = useState<string | null>(null);

//   useEffect(() => {
//     socket.on('moveMade', (data: { board: string[], currentPlayer: string }) => {
//       setBoard(data.board);
//       setCurrentPlayer(data.currentPlayer);
//     });

//     socket.on('gameOver', (data: { winner: string | null }) => {
//       setIsGameOver(true);
//       setWinner(data.winner);
//     });

//     return () => {
//       socket.off('moveMade');
//       socket.off('gameOver');
//     };
//   }, []);

//   const handleMove = (index: number) => {
//     if (board[index] || isGameOver) return;

//     const newBoard = [...board];
//     newBoard[index] = currentPlayer;

//     setBoard(newBoard);

//     socket.emit('makeMove', { board: newBoard, currentPlayer });
//   };

//   return (
//     <GameBoard
//       playerType="multiplayer"
//       onMove={handleMove}
//       board={board}
//       currentPlayer={currentPlayer}
//       isGameOver={isGameOver}
//       winner={winner}
//     />
//   );
// };

const Multiplayer: React.FC = () => { 
  return (
    <div>Multiplayer</div>
  )
}

export default Multiplayer;
