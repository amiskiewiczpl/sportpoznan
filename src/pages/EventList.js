import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

function EventList() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("Wszystkie");
  const user = auth.currentUser;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventList = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setEvents(eventList);
      } catch (error) {
        console.error("Błąd podczas pobierania wydarzeń:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Czy na pewno usunąć wydarzenie?");
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, "events", id));
      setEvents((prevEvents) => prevEvents.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Błąd podczas usuwania wydarzenia:", error);
    }
  };

  const handleJoin = async (id) => {
    try {
      const event = events.find(e => e.id === id);
      const isFull = (event.participants?.length || 0) >= event.slots;
      if (isFull) return alert("Brak miejsc!");

      const updated = {
        participants: [...(event.participants || []), user.email]
      };
      await updateDoc(doc(db, "events", id), updated);
      setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    } catch (err) {
      console.error("Błąd przy dołączaniu:", err);
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
          const isOwner = event.createdBy === user?.email;
          const isParticipant = (event.participants || []).includes(user?.email);
          const isFull = (event.participants?.length || 0) >= event.slots;
          const freeSlots = event.slots - (event.participants?.length || 0);

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
              <p><strong>Miejsce:</strong> {event.place}</p>
              <p><strong>Data:</strong> {event.date}</p>
              <p><strong>Wolnych miejsc:</strong> {freeSlots}</p>

              {/* Lista uczestników */}
              {event.participants && event.participants.length > 0 && (
                <p><strong>Uczestnicy:</strong> {event.participants.join(", ")}</p>
              )}

              {/* Akcje */}
              {isOwner && (
                <button onClick={() => handleDelete(event.id)}>🗑️ Usuń</button>
              )}

              {!isOwner && !isParticipant && (
                <button
                  onClick={() => handleJoin(event.id)}
                  disabled={isFull}
                >
                  {isFull ? "🚫 Brak miejsc" : "✅ Dołącz"}
                </button>
              )}

              {isParticipant && !isOwner && (
                <span style={{ color: "green" }}>✅ Już zapisany</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default EventList;
