import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <span>Video Game Match</span>
        <p>Escolha um modo para jogar</p>

        <div className="home-buttons">
          <Link to="/singleplayer">
            <button>Singleplayer</button>
          </Link>

          <Link to="/multiplayer">
            <button>Multiplayer</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
