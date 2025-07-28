import React, { useState } from "react";
import {
  auth,
  provider,
  signInWithPopup,
  signOut,
  db,
  setDoc,
  doc,
  getDoc
} from "../firebase";

function Profile() {
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;

      // Zapis do Firestore
      const userRef = doc(db, "users", loggedUser.uid);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        await setDoc(userRef, {
          uid: loggedUser.uid,
          name: loggedUser.displayName,
          email: loggedUser.email,
          createdAt: new Date().toISOString()
        });
      }

      setUser(loggedUser);
    } catch (err) {
      console.error("Błąd logowania:", err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div>
      <h2>🙋 Profil</h2>
      {user ? (
        <div>
          <p>Zalogowany jako: <strong>{user.displayName}</strong></p>
          <p>Email: {user.email}</p>
          <button onClick={handleLogout}>🚪 Wyloguj się</button>
        </div>
      ) : (
        <button onClick={handleLogin}>🔐 Zaloguj się z Google</button>
      )}
    </div>
  );
}

export default Profile;
