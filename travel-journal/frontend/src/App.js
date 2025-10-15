import React from "react";
import EntryForm from "./components/EntryForm";
import EntryList from "./components/EntryList";

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>🌍 Travel Journal</h1>
      <EntryForm />
      <hr />
      <EntryList />
    </div>
  );
}

export default App;
