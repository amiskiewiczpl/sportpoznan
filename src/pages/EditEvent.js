import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { loadGoogleMaps } from "../helpers/loadGoogleMaps";

const adminEmails = process.env.REACT_APP_ADMIN_EMAILS?.split(",") || [];

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [user, setUser] = useState(undefined);
  const [gmapsReady, setGmapsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await loadGoogleMaps();       // ⬅️ załaduj Google Maps JS
        setGmapsReady(true);          // ⬅️ dopiero potem kontynuuj
      } catch (err) {
        console.error("Błąd ładowania Google Maps API", err);
      }
    };
    init();
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

    if (user && gmapsReady) fetchEvent();
  }, [user, gmapsReady, id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceChange = (address) => {
    setForm((f) => ({ ...f, place: address }));
  };

  const handleSelect = async (address) => {
    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);

      setForm((f) => ({
        ...f,
        place: address,
        coords: latLng,
      }));
    } catch (error) {
      console.error("Błąd geokodowania:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
if (!form.coords || !form.coords.lat || !form.coords.lng) {
  alert("Musisz wybrać lokalizację z podpowiedzi.");
  return;
}

    await updateDoc(doc(db, "events", id), {
      sport: form.sport,
      place: form.place,
      date: form.date,
      slots: parseInt(form.slots),
      coords: form.coords,
    });

    alert("✅ Zapisano zmiany!");
    navigate("/twoje");
  };

  if (user === undefined || form === null || !gmapsReady)
    return <p>⏳ Ładowanie...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>✏️ Edytuj wydarzenie</h2>

      <label>Sport:</label><br />
      <input name="sport" value={form.sport} onChange={handleChange} /><br />

      <label>Miejsce:</label><br />
      <PlacesAutocomplete
        value={form.place}
        onChange={handlePlaceChange}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <input
  {...getInputProps({ placeholder: "Wpisz nazwę obiektu sportowego..." })}
  style={{
    padding: "0.5rem",
    width: "100%",
    marginBottom: "0.5rem"
  }}
/>
            <div>
              {loading && <div>⏳ Szukam miejsc...</div>}
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  {...getSuggestionItemProps(s)}
                  style={{
                    backgroundColor: s.active ? "#fafafa" : "#fff",
                    padding: "0.5rem",
                    cursor: "pointer",
                  }}
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
