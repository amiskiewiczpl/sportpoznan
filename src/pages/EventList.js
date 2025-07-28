import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase";

function EventList() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("Wszystkie");
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({});

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

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "events", id));
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const startEdit = (event) => {
    setEditingEvent(event.id);
    setEditForm({
      sport: event.sport,
      place: event.place,
      date: event.date,
      slots: event.slots,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    const docRef = doc(db, "events", id);
    await updateDoc(docRef, editForm);
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...editForm } : e))
    );
    setEditingEvent(null);
  };

  const cancelEdit = () => {
    setEditingEvent(null);
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
        <p>Brak wydarzeń.</p>
      ) : (
        filteredEvents.map((event) => {
          const isAuthor = auth.currentUser?.uid === event.createdBy;

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
              {editingEvent === event.id ? (
                <>
                  <input
                    name="sport"
                    value={editForm.sport}
                    onChange={handleEditChange}
                  />
                  <input
                    name="place"
                    value={editForm.place}
                    onChange={handleEditChange}
                  />
                  <input
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    type="datetime-local"
                  />
                  <input
                    name="slots"
                    value={editForm.slots}
                    onChange={handleEditChange}
                    type="number"
                  />
                  <button onClick={() => saveEdit(event.id)}>💾 Zapisz</button>
                  <button onClick={cancelEdit}>❌ Anuluj</button>
                </>
              ) : (
                <>
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

                  {isAuthor && (
                    <>
                      <button onClick={() => startEdit(event)}>✏️ Edytuj</button>{" "}
                      <button onClick={() => handleDelete(event.id)}>🗑️ Usuń</button>
                    </>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default EventList;
