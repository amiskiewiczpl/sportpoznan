import React, { useEffect, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import {
  collection, getDocs, updateDoc, deleteDoc,
  doc, arrayUnion, arrayRemove
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const containerStyle = { width: '100%', height: '70vh' };
const center = { lat: 52.4064, lng: 16.9252 };

const sportIcons = {
  "Piłka nożna": "⚽", "Siatkówka": "🏐", Squash: "🏳", Tenis: "🏓"
};

const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(",") || [];

function MapPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("Wszystkie");

  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  const fetchEvents = async () => {
    const snapshot = await getDocs(collection(db, "events"));
    const parsed = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const participants = data.participants || [];
      return {
        id: docSnap.id,
        ...data,
        alreadyJoined: participants.includes(user?.uid),
        freeSlots: data.slots - participants.length,
      };
    });
    setEvents(parsed);
  };

  useEffect(() => {
    if (user !== undefined) fetchEvents();
  }, [user]);

  const handleJoinOrLeave = async (event) => {
    if (!user) return alert("Zaloguj się!");

    const ref = doc(db, "events", event.id);
    const isFull = event.participants?.length >= event.slots;

    try {
      if (event.alreadyJoined) {
        await updateDoc(ref, { participants: arrayRemove(user.uid) });
      } else {
        if (isFull) return alert("Brak wolnych miejsc!");
        await updateDoc(ref, { participants: arrayUnion(user.uid) });
      }
      fetchEvents();
    } catch (err) {
      console.error("Błąd przy zapisie:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Na pewno usunąć?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      fetchEvents();
    } catch (err) {
      console.error("Błąd przy usuwaniu:", err);
    }
  };

  const filtered = filter === "Wszystkie"
    ? events
    : events.filter(e => e.sport === filter);

  if (!isLoaded) return <p>⏳ Ładowanie mapy...</p>;

  return (
    <div>
      <h2>🗺️ Mapa wydarzeń</h2>

      <label>Filtruj po sporcie:</label>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option>Wszystkie</option>
        <option>Piłka nożna</option>
        <option>Siatkówka</option>
        <option>Squash</option>
        <option>Tenis</option>
      </select>

      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {filtered.map((event) => {
          const canManage = user &&
            (event.createdBy === user.uid || adminEmails.includes(user.email));

          return (
            <Marker
              key={event.id}
              position={event.coords}
              onClick={() => setSelected(event)}
            />
          );
        })}

        {selected && (
          <InfoWindow
            position={selected.coords}
            onCloseClick={() => setSelected(null)}
          >
            <div>
              <strong>{sportIcons[selected.sport]} {selected.sport}</strong><br />
              📍 {selected.place}<br />
              📅 {selected.date}<br />
              👥 {selected.freeSlots} / {selected.slots}<br /><br />

              {user && (
                <button onClick={() => handleJoinOrLeave(selected)}>
                  {selected.alreadyJoined ? "❌ Opuść" : "✅ Dołącz"}
                </button>
              )}

              {canManage && (
                <>
                  <button onClick={() => navigate(`/edytuj/${selected.id}`)}>✏️ Edytuj</button>
                  <button onClick={() => handleDelete(selected.id)}>🗑️ Usuń</button>
                </>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default MapPage;
