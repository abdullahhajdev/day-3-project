import express from 'express';
import pool from './db.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = ['https://day-3-project-nine.vercel.app'];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow REST clients or server-to-server
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Add explicit OPTIONS handler for preflight requests
app.options('*', cors());

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
