import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function YourEvents() {
  const navigate = useNavigate();
  const [yourEvents, setYourEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState(undefined); // undefined = jeszcze nie wiemy

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) {
        setYourEvents([]);
        setLoading(false);
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const allEvents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const filtered = allEvents.filter(
          ev =>
            ev.createdBy === user.uid ||
            (ev.participants || []).includes(user.uid)
        );

        setYourEvents(filtered);
      } catch (err) {
        console.error("Błąd podczas ładowania wydarzeń:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user, refreshKey]);

  const handleLeave = async (eventId) => {
    try {
      const ref = doc(db, "events", eventId);
      const event = yourEvents.find(e => e.id === eventId);
      const updated = {
        participants: (event.participants || []).filter(p => p !== user.uid)
      };
      await updateDoc(ref, updated);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error("Błąd przy rezygnacji:", err);
    }
  };

  const handleDelete = async (eventId) => {
    const confirm = window.confirm("Czy na pewno chcesz usunąć to wydarzenie?");
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, "events", eventId));
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error("Błąd przy usuwaniu wydarzenia:", err);
    }
  };

  if (user === undefined || loading) return <p>⏳ Ładowanie...</p>;

  if (!user) {
    return <p>🔒 Musisz być zalogowany, aby zobaczyć swoje wydarzenia.</p>;
  }

  const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(",") || [];
  const isAdmin = adminEmails.includes(user.email);

  return (
    <div>
      <h2>🧾 Twoje wydarzenia</h2>
      {yourEvents.length === 0 ? (
        <p>Brak wydarzeń, które utworzyłeś lub do których się zapisałeś.</p>
      ) : (
        yourEvents.map(event => {
          const isOwner = event.createdBy === user.uid;
          const isParticipant = (event.participants || []).includes(user.uid);
          const freeSlots = event.slots - (event.participants?.length || 0);
          const canManage = isOwner || isAdmin;

          return (
            <div
              key={event.id}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                background: "#f5f5f5",
                borderRadius: "8px"
              }}
            >
              <h3>{event.sport}</h3>
              <p><strong>Miejsce:</strong> {event.place}</p>
              <p><strong>Data:</strong> {event.date}</p>
              <p><strong>Wolnych miejsc:</strong> {freeSlots}</p>

              {isParticipant && (
                <button onClick={() => handleLeave(event.id)}>🚪 Zrezygnuj</button>
              )}

              {canManage && (
                <>
                  <button onClick={() => handleDelete(event.id)}>🗑️ Usuń wydarzenie</button>
                  <button onClick={() => navigate(`/edytuj/${event.id}`)}>✏️ Edytuj</button>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default YourEvents;
