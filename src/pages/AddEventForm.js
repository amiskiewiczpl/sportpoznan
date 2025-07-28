import React, { useState } from "react";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-places-autocomplete";

function AddEventForm({ onAdd }) {
  const [form, setForm] = useState({
    sport: "",
    place: "",
    date: "",
    slots: 1,
    coords: null
  });

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

  return (
    <form onSubmit={handleSubmit}>
      <label>Sport:</label><br />
      <input name="sport" value={form.sport} onChange={handleChange} /><br />

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
