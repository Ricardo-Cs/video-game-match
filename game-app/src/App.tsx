import React from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Singleplayer from './pages/Singleplayer';
import Multiplayer from './pages/Multiplayer';
import Navbar from './components/Navbar';

const App: React.FC = () => (
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/singleplayer" element={<Singleplayer />} />
      <Route path="/multiplayer" element={<Multiplayer />} />
    </Routes>
  </Router>
);

export default App;
