import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";

function EventList() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("Wszystkie");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const querySnapshot = await getDocs(collection(db, "events"));
      const eventList = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setEvents(eventList);
    };

    fetchEvents();
  }, []);

  const handleJoin = async (event) => {
    if (!currentUser) return alert("Zaloguj się, aby dołączyć!");

    if (event.participants?.includes(currentUser.uid)) {
      // już zapisany – rezygnacja
      const updated = event.participants.filter((id) => id !== currentUser.uid);
      await updateDoc(doc(db, "events", event.id), {
        participants: updated,
      });
    } else {
      if (event.participants?.length >= event.slots) {
        alert("Brak wolnych miejsc!");
        return;
      }

      const updated = [...(event.participants || []), currentUser.uid];
      await updateDoc(doc(db, "events", event.id), {
        participants: updated,
      });
    }

    // Odśwież listę
    const querySnapshot = await getDocs(collection(db, "events"));
    setEvents(
      querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
    );
  };

  const handleDelete = async (event) => {
    if (
      currentUser &&
      (event.createdBy === currentUser.uid ||
        process.env.REACT_APP_ADMIN_IDS?.includes(currentUser.uid))
    ) {
      await deleteDoc(doc(db, "events", event.id));
      setEvents(events.filter((e) => e.id !== event.id));
    } else {
      alert("Brak uprawnień do usunięcia tego wydarzenia.");
    }
  };

  const filteredEvents =
    filter === "Wszystkie"
      ? events
      : events.filter((event) => event.sport === filter);

  return (
    <div>
      <h2>📅 Nadchodzące wydarzenia</h2>

      <label>Filtruj po sporcie:</label>{" "}
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="Wszystkie">Wszystkie</option>
        <option value="Piłka nożna">Piłka nożna</option>
        <option value="Siatkówka">Siatkówka</option>
        <option value="Squash">Squash</option>
        <option value="Tenis">Tenis</option>
      </select>

      <hr style={{ margin: "1rem 0" }} />

      {filteredEvents.length === 0 ? (
        <p>Brak wydarzeń do wyświetlenia.</p>
      ) : (
        filteredEvents.map((event) => {
          const isParticipant = event.participants?.includes(currentUser?.uid);
          const freeSlots = event.slots - (event.participants?.length || 0);
          const canDelete =
            currentUser &&
            (event.createdBy === currentUser.uid ||
              process.env.REACT_APP_ADMIN_IDS?.includes(currentUser.uid));

          return (
            <div
              key={event.id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                background: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <h3>{event.sport}</h3>
              <p>
                <strong>Miejsce:</strong> {event.place}
              </p>
              <p>
                <strong>Data:</strong> {event.date}
              </p>
              <p>
                <strong>Wolnych miejsc:</strong> {freeSlots}
              </p>
              <p>
                <strong>Uczestnicy:</strong>{" "}
                {event.participants?.length > 0
                  ? event.participants.length
                  : "Brak"}
              </p>

              {currentUser && (
                <button onClick={() => handleJoin(event)}>
                  {isParticipant ? "🚪 Opuść" : "✅ Dołącz"}
                </button>
              )}

              {canDelete && (
                <button onClick={() => handleDelete(event)}>🗑️ Usuń</button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default EventList;
