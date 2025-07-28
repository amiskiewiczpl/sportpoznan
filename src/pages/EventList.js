import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../firebase";

const ADMIN_EMAILS = ["admin@example.com"]; // 👈 Dodaj tu swoje maile adminów

function EventList() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("Wszystkie");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserEmail(user?.email || "");
    });
    return () => unsubscribe();
  }, []);

  const fetchEvents = async () => {
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
    } catch (error) {
      console.error("Błąd podczas pobierania wydarzeń:", error);
    }
  };

  useEffect(() => {
    if (userEmail !== undefined) fetchEvents();
  }, [userEmail]);

  const isAdminOrOrganizer = (event) =>
    event.createdBy === userEmail || ADMIN_EMAILS.includes(userEmail);

  const handleDelete = async (id) => {
    const eventToDelete = events.find((e) => e.id === id);
    if (!eventToDelete || !isAdminOrOrganizer(eventToDelete)) {
      alert("Nie masz uprawnień do usunięcia tego wydarzenia.");
      return;
    }

    try {
      await deleteDoc(doc(db, "events", id));
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Błąd podczas usuwania wydarzenia:", error);
    }
  };

  const handleJoinOrLeave = async (id, alreadyJoined) => {
    if (!userEmail) {
      alert("Zaloguj się, aby dołączyć.");
      return;
    }

    try {
      const ref = doc(db, "events", id);
      await updateDoc(ref, {
        participants: alreadyJoined
          ? arrayRemove(userEmail)
          : arrayUnion(userEmail),
      });
      fetchEvents();
    } catch (err) {
      console.error("Błąd przy aktualizacji uczestnictwa:", err);
    }
  };
const ADMIN_EMAILS = process.env.REACT_APP_ADMIN_EMAILS
  ? process.env.REACT_APP_ADMIN_EMAILS.split(",")
  : [];
  const canDelete = (event, userEmail) =>
  event.createdBy === userEmail || ADMIN_EMAILS.includes(userEmail);

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
            <p><strong>Miejsce:</strong> {event.place}</p>
            <p><strong>Data:</strong> {event.date}</p>
            <p><strong>Wolnych miejsc:</strong> {event.freeSlots} z {event.slots}</p>

            <button onClick={() => handleJoinOrLeave(event.id, event.alreadyJoined)}>
              {event.alreadyJoined ? "❌ Opuść" : "✅ Dołącz"}
            </button>

            {isAdminOrOrganizer(event) && (
              <button
                style={{ marginLeft: "1rem" }}
                onClick={() => handleDelete(event.id)}
              >
                🗑️ Usuń
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default EventList;
