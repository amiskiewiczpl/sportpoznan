import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function YourEvents() {
  const [yourEvents, setYourEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const allEvents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtered = allEvents.filter(
          ev => ev.createdBy === user.email || (ev.participants || []).includes(user.email)
        );

        setYourEvents(filtered);
      } catch (err) {
        console.error("Błąd podczas ładowania wydarzeń:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p>⏳ Ładowanie...</p>;

  return (
    <div>
      <h2>🧾 Twoje wydarzenia</h2>
      {yourEvents.length === 0 ? (
        <p>Brak wydarzeń, które utworzyłeś lub do których się zapisałeś.</p>
      ) : (
        yourEvents.map(event => (
          <div key={event.id} style={{ marginBottom: "1rem", padding: "1rem", background: "#f9f9f9" }}>
            <h3>{event.sport}</h3>
            <p><strong>Miejsce:</strong> {event.place}</p>
            <p><strong>Data:</strong> {event.date}</p>
            <p><strong>Wolnych miejsc:</strong> {event.slots - (event.participants?.length || 0)}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default YourEvents;
