import React from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
const Home: React.FC = () => {
  return (
    <div className="">
      <h1 className="">VideogameMatch</h1>
      <p className="">Escolha um modo para jogar</p>
      <HomeIcon color='primary'/>

      <div className="">
        <Link to="/singleplayer">
          <button className="">
            Singleplayer
          </button>
        </Link>

        <Link to="/multiplayer">
          <button className="">
            Multiplayer
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
