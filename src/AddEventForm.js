import React, { useState } from "react";
import { auth } from "./firebase";

const AddEventForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    sport: "",
    place: "",
    lat: "",
    lng: "",
    date: "",
    slots: ""
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Musisz być zalogowany, aby dodać wydarzenie.");
      return;
    }

    const eventToAdd = {
      sport: form.sport,
      place: form.place,
      coords: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
      date: form.date,
      slots: parseInt(form.slots),
      createdBy: auth.currentUser.uid,
      participants: [],
    };
if (!form.lat || !form.lng || isNaN(form.lat) || isNaN(form.lng)) {
  alert("Musisz wybrać lokalizację z podpowiedzi po wyszukaniu.");
  return;
}
    await onAdd(eventToAdd);

    // Reset formularza
    setForm({ sport: "", place: "", lat: "", lng: "", date: "", slots: "" });
    setResults([]);
    setSearchQuery("");
  };

  const handleSearch = async () => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
    const data = await res.json();
    setResults(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>➕ Dodaj wydarzenie</h2>

      <label>Sport:</label><br />
      <select name="sport" value={form.sport} onChange={handleChange} required>
        <option value="">-- Wybierz sport --</option>
        <option value="Piłka nożna">Piłka nożna</option>
        <option value="Siatkówka">Siatkówka</option>
        <option value="Squash">Squash</option>
        <option value="Tenis">Tenis</option>
      </select><br /><br />

      <label>Wyszukaj miejsce:</label><br />
      <input
        type="text"
        placeholder="np. Orlik Poznań"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button type="button" onClick={handleSearch}>Szukaj</button><br />

      {results.length > 0 && (
        <ul>
          {results.map((result, index) => (
            <li
              key={index}
              onClick={() => {
                setForm({
                  ...form,
                  place: result.display_name,
                  lat: result.lat,
                  lng: result.lon
                });
                setResults([]);
              }}
              style={{
                cursor: "pointer",
                borderBottom: "1px solid #ccc",
                padding: "0.5rem 0"
              }}
            >
              {result.display_name}
            </li>
          ))}
        </ul>
      )}

      <br />
      <label>Data i godzina:</label><br />
      <input type="datetime-local" name="date" value={form.date} onChange={handleChange} required /><br /><br />

      <label>Liczba miejsc:</label><br />
      <input type="number" name="slots" value={form.slots} onChange={handleChange} required /><br /><br />

      <button type="submit">Dodaj wydarzenie</button>
    </form>
  );
};

export default AddEventForm;
