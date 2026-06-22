import React, { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('Connecting to backend...');

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('Backend disconnected ❌'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>CodeVector Product Browser</h1>
      <p><strong>Backend Status:</strong> {status}</p>
    </div>
  );
}

export default App;