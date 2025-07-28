import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { loadGoogleMaps } from "../helpers/loadGoogleMaps"; // dostosuj ścieżkę

const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(",") || [];

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);
useEffect(() => {
  loadGoogleMaps(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
}, []);

  useEffect(() => {
    const fetchEvent = async () => {
      const ref = doc(db, "events", id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();

        const isCreator = auth.currentUser?.uid === data.createdBy;
        const isAdmin = adminEmails.includes(auth.currentUser?.email);

        if (!isCreator && !isAdmin) {
          alert("Nie masz uprawnień do edycji tego wydarzenia.");
          navigate("/wydarzenia");
          return;
        }

        setForm(data);
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

  const handleAddressChange = (address) => {
    setForm((prev) => ({ ...prev, place: address }));
  };

  const handleSelectAddress = async (address) => {
    try {
      const results = await geocodeByAddress(address);
      const coords = await getLatLng(results[0]);
      setForm((prev) => ({ ...prev, place: address, coords }));
    } catch (error) {
      console.error("Błąd geokodowania:", error);
      alert("Nie udało się pobrać współrzędnych dla tego miejsca.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "events", id), {
      sport: form.sport,
      place: form.place,
      coords: form.coords, // uwzględniamy koordynaty!
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
      <PlacesAutocomplete
        value={form.place}
        onChange={handleAddressChange}
        onSelect={handleSelectAddress}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <input {...getInputProps({ placeholder: "Wyszukaj miejsce" })} />
            <div style={{ border: "1px solid #ccc", background: "#fff" }}>
              {loading && <div>⏳ Szukam...</div>}
              {suggestions.map((s) => (
                <div
                  key={s.placeId}
                  {...getSuggestionItemProps(s, {
                    style: {
                      backgroundColor: s.active ? "#eee" : "#fff",
                      padding: "0.5rem",
                      cursor: "pointer",
                    },
                  })}
                >
                  {s.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </PlacesAutocomplete><br />

      <label>Data:</label><br />
      <input type="datetime-local" name="date" value={form.date} onChange={handleChange} /><br />

      <label>Liczba miejsc:</label><br />
      <input type="number" name="slots" value={form.slots} onChange={handleChange} /><br /><br />

      <button type="submit">💾 Zapisz</button>
    </form>
  );
}

export default EditEvent;
