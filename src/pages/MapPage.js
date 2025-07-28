import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { collection, getDocs, updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebase";

// Ikonki sportów:
const sportIcons = {
  "Piłka nożna": "⚽",
  "Siatkówka": "🏐",
  "Squash": "🎾",
  "Tenis": "🏓",
};

// Zresetuj domyślne ikony Leaflet
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
  const [userEmail, setUserEmail] = useState("");

  // Pobierz aktualnego użytkownika
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email || "");
    });
    return () => unsubscribe();
  }, []);

  // Pobieranie wydarzeń z Firestore
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventList = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const participants = data.participants || [];
        return {
          id: docSnap.id,
          ...data,
          participants,
          alreadyJoined: participants.includes(userEmail),
          freeSlots: Math.max(data.slots - participants.length, 0),
        };
      });
      setEvents(eventList);
    } catch (err) {
      console.error("Błąd podczas pobierania wydarzeń:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userEmail !== undefined) {
      fetchEvents();
    }
  }, [userEmail]);

  const handleJoinOrLeave = async (eventId, alreadyJoined) => {
    if (!userEmail) {
      alert("Musisz być zalogowany, aby dołączyć!");
      return;
    }

    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        participants: alreadyJoined
          ? arrayRemove(userEmail)
          : arrayUnion(userEmail),
      });

      await fetchEvents(); // Odśwież po zmianie
    } catch (err) {
      console.error("Błąd przy aktualizacji uczestnictwa:", err);
    }
  };

  const filteredEvents =
    filter === "Wszystkie"
      ? events
      : events.filter((event) => event.sport === filter);

  return (
    <div>
      <h2>🗺️ Mapa wydarzeń</h2>

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
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            ⏳ Ładowanie wydarzeń...
          </div>
        ) : (
          <MapContainer
            center={[52.4064, 16.9252]}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredEvents.map((event) => (
              <Marker key={event.id} position={event.coords}>
                <Popup>
                  <div style={{ fontSize: "1rem" }}>
                    <strong>{sportIcons[event.sport] || "📍"} {event.sport}</strong><br />
                    📍 {event.place}<br />
                    📅 {event.date}<br />
                    👥 {event.freeSlots} wolnych z {event.slots}
                    <br />
                    <button
                      onClick={() =>
                        handleJoinOrLeave(event.id, event.alreadyJoined)
                      }
                    >
                      {event.alreadyJoined ? "❌ Opuść" : "✅ Dołącz"}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}

export default MapPage;
