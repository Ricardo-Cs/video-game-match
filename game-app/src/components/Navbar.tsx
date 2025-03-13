import React from 'react';
import { Link } from 'react-router-dom';


const Navbar: React.FC = () => (
  <nav className="">
    <h1 className="">VideogameMatch</h1>
    <div>
      <Link to="/" className="mx-2">Início</Link>
      <Link to="/singleplayer" className="mx-2">Singleplayer</Link>
      <Link to="/multiplayer" className="mx-2">Multiplayer</Link>
    </div>
  </nav>
);

export default Navbar;