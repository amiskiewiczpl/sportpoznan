import React from "react";
import AddEventForm from "../AddEventForm";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function AddEvent() {
  const addEvent = async (event) => {
    try {
      await addDoc(collection(db, "events"), {
        ...event,
        createdBy: auth.currentUser?.uid || "anon",
        participants: [],
      });
      alert("Wydarzenie dodane!");
    } catch (error) {
      console.error("Błąd przy dodawaniu wydarzenia:", error);
      alert("Nie udało się dodać wydarzenia.");
    }
  };

  return (
    <div>
      <AddEventForm onAdd={addEvent} />
    </div>
  );
}

export default AddEvent;
