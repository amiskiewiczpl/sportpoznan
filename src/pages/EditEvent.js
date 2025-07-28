import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

function EditEvent() {
  const { id } = useParams(); // pobiera z linku np. /edytuj/ABC123
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      const ref = doc(db, "events", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (auth.currentUser?.uid !== data.createdBy) {
          alert("To nie Ty zrobiłeś to wydarzenie – nie możesz edytować!");
          navigate("/wydarzenia");
          return;
        }
        setForm(data); // wypełniamy formularz istniejącymi danymi
      } else {
        alert("Nie ma takiego wydarzenia.");
        navigate("/wydarzenia");
      }
    };

    if (user) fetchEvent();
  }, [user, id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "events", id), {
      sport: form.sport,
      place: form.place,
      date: form.date,
      slots: parseInt(form.slots),
    });
    alert("✅ Zapisano zmiany!");
    navigate("/twoje");
  };

  if (user === undefined || form === null) return <p>⏳ Ładowanie...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>✏️ Edytuj wydarzenie</h2>

      <label>Sport:</label><br />
      <input name="sport" value={form.sport} onChange={handleChange} /><br />

      <label>Miejsce:</label><br />
      <input name="place" value={form.place} onChange={handleChange} /><br />

      <label>Data:</label><br />
      <input type="datetime-local" name="date" value={form.date} onChange={handleChange} /><br />

      <label>Liczba miejsc:</label><br />
      <input type="number" name="slots" value={form.slots} onChange={handleChange} /><br /><br />

      <button type="submit">💾 Zapisz</button>
    </form>
  );
}

export default EditEvent;
