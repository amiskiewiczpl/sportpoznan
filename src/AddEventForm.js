import React, { useState } from "react";

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

    const handleSubmit = (e) => {
    e.preventDefault();

    const newEvent = {
      id: Date.now(),
      sport: form.sport,
      place: form.place,
      coords: [parseFloat(form.lat), parseFloat(form.lng)],
      date: form.date,
      slots: parseInt(form.slots)
    };

    onAdd(newEvent);
    setForm({ sport: "", place: "", lat: "", lng: "", date: "", slots: "" });
  };

  const handleSearch = async () => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
    const data = await res.json();
    setResults(data);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <h3>➕ Dodaj wydarzenie</h3>
      <select name="sport" value={form.sport} onChange={handleChange} required>
  <option value="">-- Wybierz sport --</option>
  <option value="Piłka nożna">Piłka nożna</option>
  <option value="Siatkówka">Siatkówka</option>
  <option value="Squash">Squash</option>
  <option value="Tenis">Tenis</option>
</select>
<input
  type="text"
  placeholder="Wyszukaj miejsce..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
<button type="button" onClick={handleSearch}>🔍 Szukaj</button>
{results.length > 0 && (
  <ul>
    {results.map((result, index) => (
      <li
        key={index}
        onClick={() => {
          setForm({ ...form, place: result.display_name, lat: result.lat, lng: result.lon });
          setResults([]);
        }}
        style={{ cursor: "pointer", borderBottom: "1px solid #ccc", padding: "0.5rem 0" }}
      >
        {result.display_name}
      </li>
    ))}
  </ul>
)}
      <input name="place" placeholder="Miejsce (np. Orlik)" value={form.place} onChange={handleChange} required /><br />
      <input name="lat" placeholder="Latitude (np. 52.4)" value={form.lat} onChange={handleChange} required /><br />
      <input name="lng" placeholder="Longitude (np. 16.9)" value={form.lng} onChange={handleChange} required /><br />
      <input name="date" type="datetime-local" value={form.date} onChange={handleChange} required /><br />
      <input name="slots" placeholder="Liczba graczy" value={form.slots} onChange={handleChange} required /><br />
      <button type="submit">Dodaj</button>
    </form>
  );
};

export default AddEventForm;
