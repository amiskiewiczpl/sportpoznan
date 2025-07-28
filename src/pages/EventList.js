import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";

function EventList() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("Wszystkie");

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
            <button onClick={() => handleDelete(event.id)}>🗑️ Usuń</button>
          </div>
        ))
      )}
    </div>
  );
}

export default EventList;
