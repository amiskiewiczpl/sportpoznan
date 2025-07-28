import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const sportIcons = {
  "Piłka nożna": "⚽",
  "Siatkówka": "🏐",
  Squash: "🏳",
  Tenis: "🏓",
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapPage() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("Wszystkie");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "events"));
      const list = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const participants = data.participants || [];
        return {
          id: docSnap.id,
          ...data,
          participants,
          alreadyJoined: participants.includes(user?.uid),
          freeSlots: Math.max(data.slots - participants.length, 0),
        };
      });
      setEvents(list);
    } catch (err) {
      console.error("Błąd pobierania wydarzeń:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user !== undefined) fetchEvents();
  }, [user]);

  const handleJoinOrLeave = async (event) => {
    if (!user) return alert("Zaloguj się, żeby dołączyć!");

    const eventRef = doc(db, "events", event.id);
    try {
      if (event.alreadyJoined) {
        await updateDoc(eventRef, {
          participants: arrayRemove(user.uid),
        });
      } else {
        if (event.participants.length >= event.slots) {
          return alert("Brak wolnych miejsc!");
        }
        await updateDoc(eventRef, {
          participants: arrayUnion(user.uid),
        });
      }
      await fetchEvents();
    } catch (err) {
      console.error("Błąd przy dołączaniu/wychodzeniu:", err);
    }
  };

  const handleDelete = async (eventId) => {
    const confirm = window.confirm("Na pewno usunąć wydarzenie?");
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, "events", eventId));
      await fetchEvents();
    } catch (err) {
      console.error("Błąd przy usuwaniu:", err);
    }
  };

  const filteredEvents =
    filter === "Wszystkie"
      ? events
      : events.filter((e) => e.sport === filter);

  const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(",") || [];
  const isAdmin = adminEmails.includes(user?.email);

  return (
    <div>
      <h2>📺 Mapa wydarzeń</h2>

      <label>Filtruj po sporcie:</label>{" "}
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="Wszystkie">Wszystkie</option>
        <option value="Piłka nożna">Piłka nożna</option>
        <option value="Siatkówka">Siatkówka</option>
        <option value="Squash">Squash</option>
        <option value="Tenis">Tenis</option>
      </select>

      <div style={{ height: "70vh", width: "100%", marginTop: "1rem" }}>
        {loading ? (
          <p style={{ textAlign: "center" }}>⏳ Ładowanie wydarzeń...</p>
        ) : (
          <MapContainer
            center={[52.4064, 16.9252]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredEvents.map((event) => {
              const canManage =
                user &&
                (event.createdBy === user.uid || isAdmin);

              return (
                <Marker key={event.id} position={event.coords}>
                  <Popup>
                    <div style={{ fontSize: "1rem" }}>
                      <strong>
                        {sportIcons[event.sport] || "📍"} {event.sport}
                      </strong>
                      <br />📍 {event.place}
                      <br />📅 {event.date}
                      <br />👥 {event.freeSlots} z {event.slots}
                      <br />
                      {user && (
                        <button
                          onClick={() => handleJoinOrLeave(event)}
                        >
                          {event.alreadyJoined ? "❌ Opuść" : "✅ Dołącz"}
                        </button>
                      )}
                      {canManage && (
                        <>
                          <br />
                          <button
                            onClick={() => handleDelete(event.id)}
                          >
                            🗑️ Usuń
                          </button>
                          <button
                            onClick={() => navigate(`/edytuj/${event.id}`)}
                          >
                            ✏️ Edytuj
                          </button>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
}

export default MapPage;
