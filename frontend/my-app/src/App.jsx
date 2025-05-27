import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000'; // Your Express backend

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    birthDate: ''
  });

  // Fetch users on load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/`);
    const data = await res.json();
    setUsers(data);
  };

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreate = async () => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      await fetchUsers();
      alert('User created');
    }
  };

  const handleUpdate = async () => {
    const res = await fetch(`${API_URL}/users/${formData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      await fetchUsers();
      alert('User updated');
    }
  };

  const handleDelete = async id => {
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      await fetchUsers();
      alert('User deleted');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>User Form</h1>
      <input name="id" placeholder="ID (for update)" onChange={handleChange} />
      <br />
      <input name="name" placeholder="Name" onChange={handleChange} />
      <br />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <br />
      <input name="birthDate" placeholder="Birthdate (YYYY-MM-DD)" onChange={handleChange} />
      <br />
      <button onClick={handleCreate}>Create</button>
      <button onClick={handleUpdate}>Update</button>

      <h2>Users</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            #{user.id} - {user.name} ({user.email}) - {user.birthdate?.split('T')[0]}
            <button onClick={() => handleDelete(user.id)} style={{ marginLeft: 10 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
