import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('/api/users')
      .then(res => {
        if (Array.isArray(res.data)) setUsers(res.data);
        else setUsers([]);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
        setUsers([]);
      });
  }, []);

  return (
    <div className="app">
      <h1>Characters (from AniList)</h1>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
        {users.map(user => (
          <li key={user.id} style={{ textAlign: 'center' }}>
            {user.image && (
              <img
                src={user.image}
                alt={user.name}
                style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '8px' }}
              />
            )}
            <p>{user.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App