import React, { useState } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import CreateGame from './components/CreateGame';
import JoinGame from './components/JoinGame';
import Home from './components/Home';
import Rejoin from './components/Rejoin';
import { getGameSession } from './utils/gameSession';

function App() {
  // Checked once, synchronously, on first render — before anything else
  // mounts. If a saved session exists, we attempt to rejoin that game
  // instead of showing the normal Home/Create/Join routes.
  const [session, setSession] = useState(() => getGameSession());

  if (session) {
    return (
      <div className="App">
        <Rejoin session={session} onGiveUp={() => setSession(null)} />
      </div>
    );
  }

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/create" element={<CreateGame />} />
          <Route path="/join" element={<JoinGame />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
