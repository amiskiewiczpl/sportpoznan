import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebase";

function EventList() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("Wszystkie");
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventList = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            alreadyJoined: data.participants?.includes(userEmail),
          };
        });
        setEvents(eventList);
      } catch (error) {
        console.error("Błąd podczas pobierania wydarzeń:", error);
      }
    };

    if (userEmail !== undefined) fetchEvents();
  }, [userEmail]);

  const handleDelete = async (id) => {
    console.log("Kliknięto usuń, id:", id);
    if (!id || typeof id !== "string") {
      console.error("Nieprawidłowe ID wydarzenia do usunięcia:", id);
      return;
    }

    try {
      await deleteDoc(doc(db, "events", id));
      setEvents((prevEvents) => prevEvents.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Błąd podczas usuwania wydarzenia:", error);
    }
  };

  const handleJoin = async (eventId) => {
    if (!userEmail) {
      alert("Musisz być zalogowany, aby dołączyć!");
      return;
    }

    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        participants: arrayUnion(userEmail),
      });

      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, participants: [...(e.participants || []), userEmail], alreadyJoined: true }
            : e
        )
      );
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
        filteredEvents.map((event) => (
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
              <strong>Miejsc:</strong> {event.slots}
            </p>
            <button onClick={() => handleDelete(event.id)}>🗑️ Usuń</button>{" "}
            <button
              onClick={() => handleJoin(event.id)}
              disabled={event.alreadyJoined}
            >
              {event.alreadyJoined ? "✅ Zapisany" : "Dołącz"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default EventList;
