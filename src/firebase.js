import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

// ⛏️ Konfiguracja z Firebase Console
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// ✅ Najpierw inicjalizacja app
const app = initializeApp(firebaseConfig);

// ✅ Dopiero potem inne rzeczy
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export {
  auth,
  provider,
  signInWithPopup,
  signOut,
  db,
  setDoc,
  doc,
  getDoc
};
export const toggleParticipant = async (eventId, userId) => {
  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);
  if (!eventSnap.exists()) return;

  const data = eventSnap.data();
  const current = data.participants || [];

  const updated = current.includes(userId)
    ? current.filter((id) => id !== userId)
    : [...current, userId];

  await setDoc(eventRef, { participants: updated }, { merge: true });
};
