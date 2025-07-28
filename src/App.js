import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import NavbarUserInfo from "./components/NavbarUserInfo";
import { auth, db } from "./firebase";
import EditEvent from "./pages/EditEvent";
import HomePage from "./pages/HomePage";
import AddEvent from "./pages/AddEvent";
import EventList from "./pages/EventList";
import MapPage from "./pages/MapPage";
import Profile from "./pages/Profile";
import YourEvents from "./pages/YourEvents";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "",
            createdAt: new Date(),
          });
          console.log("✅ Użytkownik zapisany w Firestore");
        } else {
          console.log("ℹ️ Użytkownik już istnieje w Firestore");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div style={{ padding: "1rem", background: "#eee", position: "relative" }}>
        <h1>⚽ SportPoznań</h1>

        <NavbarUserInfo user={user} setUser={setUser} />

        <nav style={{ marginBottom: "1rem" }}>
          <Link to="/" style={{ marginRight: "1rem" }}>🏠 Strona główna</Link>
          <Link to="/wydarzenia" style={{ marginRight: "1rem" }}>📅 Wydarzenia</Link>
          <Link to="/dodaj" style={{ marginRight: "1rem" }}>➕ Dodaj</Link>
          <Link to="/mapa" style={{ marginRight: "1rem" }}>🗺️ Mapa</Link>
          <Link to="/profil" style={{ marginRight: "1rem" }}>🙋 Profil</Link>
          <Link to="/twoje">🧾 Twoje wydarzenia</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wydarzenia" element={<EventList />} />
          <Route path="/dodaj" element={<AddEvent />} />
          <Route path="/mapa" element={<MapPage />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="/twoje" element={<YourEvents />} />
          <Route path="/edytuj/:id" element={<EditEvent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
