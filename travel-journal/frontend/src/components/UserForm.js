import React, { useState } from "react";
import { api } from "../api";

function UserForm() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post("/users", { userId, name });
      alert("User created successfully!");
      setName("");
      setUserId("");
    } catch (error) {
      console.error(error);
      alert("Failed to create user.");
    }
  };

  return (
    <form onSubmit={createUser}>
      <h3>Create User</h3>
      <input
        type="text"
        placeholder="User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Create</button>
    </form>
  );
}

export default UserForm;
