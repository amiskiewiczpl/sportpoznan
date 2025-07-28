import React, { useState } from "react";
import AddEventForm from "../AddEventForm";

function AddEvent() {
  const [events, setEvents] = useState(() => {
    const stored = localStorage.getItem("events");
    return stored ? JSON.parse(stored) : [];
  });

  const addEvent = (event) => {
    const updated = [...events, event];
    setEvents(updated);
    localStorage.setItem("events", JSON.stringify(updated));
  };

  return (
    <div>
      <AddEventForm onAdd={addEvent} />
    </div>
  );
}

export default AddEvent;
