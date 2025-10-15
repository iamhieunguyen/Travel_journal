import React, { useState } from "react";
import api from "../api";

export default function EntryForm() {
  const [form, setForm] = useState({
    userId: "",
    title: "",
    content: "",
    location: "",
    photoUrl: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/entries", form);
      alert("✅ Created entry: " + res.data.entryId);
    } catch (err) {
      alert("❌ Error creating entry");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <input name="userId" placeholder="User ID" onChange={handleChange} />
      <input name="title" placeholder="Title" onChange={handleChange} />
      <input name="content" placeholder="Content" onChange={handleChange} />
      <input name="location" placeholder="Location" onChange={handleChange} />
      <input name="photoUrl" placeholder="Photo URL" onChange={handleChange} />
      <button type="submit">Add Entry</button>
    </form>
  );
}
