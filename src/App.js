import React from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";

import HomePage from "./pages/HomePage";
import AddEvent from "./pages/AddEvent";
import EventList from "./pages/EventList";
import MapPage from "./pages/MapPage";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <div style={{ padding: "1rem", background: "#eee" }}>
        <h1>⚽ SportPoznań</h1>
        <nav style={{ marginBottom: "1rem" }}>
          <Link to="/" style={{ marginRight: "1rem" }}>🏠 Strona główna</Link>
          <Link to="/wydarzenia" style={{ marginRight: "1rem" }}>📅 Wydarzenia</Link>
          <Link to="/dodaj" style={{ marginRight: "1rem" }}>➕ Dodaj</Link>
          <Link to="/mapa" style={{ marginRight: "1rem" }}>🗺️ Mapa</Link>
          <Link to="/profil">🙋 Profil</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wydarzenia" element={<EventList />} />
          <Route path="/dodaj" element={<AddEvent />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/profil" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
