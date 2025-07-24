import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import AddEventForm from "./AddEventForm";
import React, { useState, useEffect } from "react";

// Fix ikon na mapie
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
const [events, setEvents] = useState(() => {
  const stored = localStorage.getItem("events");
  return stored ? JSON.parse(stored) : [];
});
const addEvent = (event) => {
  const updated = [...events, event];
  setEvents(updated);
  localStorage.setItem("events", JSON.stringify(updated));
};

function App() {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
  {/* Lewa kolumna: formularz + lista */}
  <div style={{ width: "30%", padding: "1rem", background: "#f3f3f3", overflowY: "auto" }}>
    <AddEventForm onAdd={addEvent} />
    <h2>📅 Twoje wydarzenia</h2>
    {events.map((event) => (
      <div key={event.id} style={{ marginBottom: "1rem", padding: "0.5rem", background: "#fff", borderRadius: "8px" }}>
        <h3>{event.sport}</h3>
        <p><strong>Miejsce:</strong> {event.place}</p>
        <p><strong>Data:</strong> {event.date}</p>
        <p><strong>Miejsc:</strong> {event.slots}</p>
      </div>
    ))}
  </div>

  {/* Mapa */}
  <div style={{ flex: 1 }}>
    <MapContainer center={[52.4064, 16.9252]} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {events.map((event) => (
        <Marker key={event.id} position={event.coords}>
          <Popup>
            <strong>{event.sport}</strong><br />
            {event.place}<br />
            {event.date}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
</div>
  );
}

export default App;
