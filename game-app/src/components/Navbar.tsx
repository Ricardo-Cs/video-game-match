import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/navBar.css';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';

const Navbar: React.FC = () => (
  <nav className="navbar">
    <div className="navbar-brand">
      <VideogameAssetIcon />
      <span>VideogameMatch</span>
    </div>
    <div className="navbar-links">
      <Link to="/">Início</Link>
      <Link to="/singleplayer">Singleplayer</Link>
      <Link to="/multiplayer">Multiplayer</Link>
    </div>
  </nav>
);

export default Navbar;
