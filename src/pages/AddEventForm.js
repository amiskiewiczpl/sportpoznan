import React, { useEffect, useState } from "react";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";
import { loadGoogleMaps } from "../helpers/loadGoogleMaps";

function AddEventForm({ onAdd }) {
  const [gmapsReady, setGmapsReady] = useState(false);
  const [form, setForm] = useState({
    sport: "",
    place: "",
    date: "",
    slots: 1,
    coords: null
  });

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setGmapsReady(true))
      .catch(err => console.error("❌ Google Maps load error:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = async (address) => {
    setForm((prev) => ({ ...prev, place: address }));
    const results = await geocodeByAddress(address);
    const latLng = await getLatLng(results[0]);
    setForm((prev) => ({ ...prev, coords: latLng }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.place || !form.coords) {
      alert("Wybierz lokalizację z podpowiedzi!");
      return;
    }
    onAdd(form);
  };

  if (!gmapsReady) return <p>⏳ Ładowanie mapy...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <label>Sport:</label><br />
      <select name="sport" value={form.sport} onChange={handleChange} required>
        <option value="">-- Wybierz sport --</option>
        <option value="Piłka nożna">Piłka nożna</option>
        <option value="Siatkówka">Siatkówka</option>
        <option value="Squash">Squash</option>
        <option value="Tenis">Tenis</option>
      </select><br /><br />

      <label>Miejsce:</label><br />
      <PlacesAutocomplete
        value={form.place}
        onChange={(address) => setForm({ ...form, place: address })}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <input {...getInputProps({ placeholder: "Wpisz miejsce..." })} />
            <div style={{ background: "#fff", border: "1px solid #ccc" }}>
              {loading && <div>Ładowanie...</div>}
              {suggestions.map((sug) => (
                <div {...getSuggestionItemProps(sug)} key={sug.placeId}>
                  {sug.description}
                </div>
              ))}
            </div>
          </div>
        )}
      </PlacesAutocomplete>

      <br />
      <label>Data:</label><br />
      <input type="datetime-local" name="date" value={form.date} onChange={handleChange} /><br />

      <label>Liczba miejsc:</label><br />
      <input type="number" name="slots" value={form.slots} onChange={handleChange} /><br /><br />

      <button type="submit">➕ Dodaj</button>
    </form>
  );
}

export default AddEventForm;
