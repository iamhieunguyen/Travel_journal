import React, { useEffect, useState } from "react";
import api from "./api";

export default function EntryList() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.get("/entries").then((res) => setEntries(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h2>📖 All Entries</h2>
      {entries.length === 0 && <p>No entries yet.</p>}
      {entries.map((e) => (
        <div key={e.entryId} style={{ border: "1px solid #ccc", padding: 10, margin: 10 }}>
          <h3>{e.title}</h3>
          <p>{e.content}</p>
          <p><b>📍</b> {e.location}</p>
          {e.photoUrl && (
            <img src={e.photoUrl} alt="entry" style={{ width: 200, borderRadius: 8 }} />
          )}
        </div>
      ))}
    </div>
  );
}
