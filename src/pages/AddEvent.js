import React from "react";
import AddEventForm from "./AddEventForm";

function AddEvent({ onAdd }) {
  return <AddEventForm onAdd={onAdd} />;
}

export default AddEvent;
