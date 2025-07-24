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

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <h3>➕ Dodaj wydarzenie</h3>
      <input name="sport" placeholder="Sport (np. siatkówka)" value={form.sport} onChange={handleChange} required /><br />
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
