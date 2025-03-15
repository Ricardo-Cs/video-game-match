import React, { useState } from 'react';

interface GameBoardProps {
  playerType: 'singleplayer' | 'multiplayer';
  onMove: (index: number) => void; // Função chamada quando o jogador faz uma jogada
  board: string[]; // Estado atual do tabuleiro
  currentPlayer: string; // Jogador atual (X ou O)
  isGameOver: boolean;
  winner: string | null;
}

const GameBoard: React.FC<GameBoardProps> = ({
  playerType,
  onMove,
  board,
  currentPlayer,
  isGameOver,
  winner,
}) => {
  const handleCellClick = (index: number) => {
    if (!board[index] && !isGameOver) {
      onMove(index);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Modo: {playerType === 'singleplayer' ? 'Singleplayer' : 'Multiplayer'}</h2>
      <div style={styles.board}>
        {board.map((cell, index) => (
          <div
            key={index}
            style={styles.cell}
            onClick={() => handleCellClick(index)}
          >
            {cell}
          </div>
        ))}
      </div>
      {isGameOver && (
        <div style={styles.message}>
          {winner ? `Vencedor: ${winner}` : 'Empate!'}
        </div>
      )}
    </div>
  );
};

const styles: { 
    container: React.CSSProperties;
    board: React.CSSProperties;
    cell: React.CSSProperties;
    message: React.CSSProperties;
  } = {
    container: {
      textAlign: 'center',
    },
    board: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 100px)',
      gap: '10px',
      margin: '20px auto',
    },
    cell: {
      width: '100px',
      height: '100px',
      backgroundColor: '#ddd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      cursor: 'pointer',
    },
    message: {
      marginTop: '20px',
      fontSize: '1.2rem',
    },
  };  

export default GameBoard;