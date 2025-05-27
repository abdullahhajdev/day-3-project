import express from 'express';
import pool from './db.js';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// GET all users
app.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// POST create new user with validation
app.post('/users', async (req, res) => {
  const { name, email, birthDate } = req.body;
  
  if (!name || !email || !birthDate) {
    return res.status(400).json({ error: 'Name, email, and birthDate are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, birthDate) VALUES ($1, $2, $3) RETURNING *`,
      [name, email, birthDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// GET user by id
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// DELETE user by id
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM users WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json({ message: 'User deleted', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// PUT update user by id with validation
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, birthDate } = req.body;

  if (!name || !email || !birthDate) {
    return res.status(400).json({ error: 'Name, email, and birthDate are required' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET name = $1, email = $2, birthDate = $3 WHERE id = $4 RETURNING *`,
      [name, email, birthDate, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
