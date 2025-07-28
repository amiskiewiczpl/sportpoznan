// src/components/NavbarUserInfo.js
import React from "react";
import { auth, signInWithPopup, provider, signOut } from "../firebase";

function NavbarUserInfo({ user, setUser }) {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => setUser(null))
      .catch((error) => console.error("Logout error:", error));
  };

  return (
    <div style={{ position: "absolute", top: 10, right: 10 }}>
      {user ? (
        <>
          <span style={{ marginRight: "1rem" }}>👤 {user.displayName}</span>
          <button onClick={handleLogout}>🚪 Wyloguj</button>
        </>
      ) : (
        <button onClick={handleLogin}>🔐 Zaloguj się</button>
      )}
    </div>
  );
}

export default NavbarUserInfo;
