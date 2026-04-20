require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve your frontend files here

// ─── PostgreSQL Connection ────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || null,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'verox_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '123',
});

// ─── Create Tables on Startup ────────────────────────────────
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id         SERIAL PRIMARY KEY,
      email      VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255),
      email      VARCHAR(255),
      phone      VARCHAR(50),
      message    TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS purchase_requests (
      id          SERIAL PRIMARY KEY,
      product     VARCHAR(255),
      customer    VARCHAR(255),
      phone       VARCHAR(50),
      email       VARCHAR(255),
      created_at  TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('✅ Database tables ready');
}

// ─── ROUTES ──────────────────────────────────────────────────

// POST /api/newsletter  — save subscriber email
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const result = await pool.query(
      'INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING *',
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ message: 'Already subscribed!' });
    }
    console.log(`📧 New subscriber: ${email}`);
    res.status(201).json({ message: 'Subscribed successfully!', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/contact  — save contact message
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    const result = await pool.query(
      'INSERT INTO contact_messages (name, email, phone, message) VALUES ($1,$2,$3,$4) RETURNING *',
      [name || null, email || null, phone || null, message]
    );
    console.log(`💬 New message from: ${name || email || 'Anonymous'}`);
    res.status(201).json({ message: 'Message received!', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/purchase  — log a purchase request
app.post('/api/purchase', async (req, res) => {
  const { product, customer, phone, email } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO purchase_requests (product, customer, phone, email) VALUES ($1,$2,$3,$4) RETURNING *',
      [product || null, customer || null, phone || null, email || null]
    );
    console.log(`🛒 Purchase request: ${product}`);
    res.status(201).json({ message: 'Purchase request logged!', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/subscribers  — view all subscribers (protect in prod!)
app.get('/api/admin/subscribers', async (req, res) => {
  const result = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC');
  res.json(result.rows);
});

// GET /api/admin/messages  — view all contact messages
app.get('/api/admin/messages', async (req, res) => {
  const result = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
  res.json(result.rows);
});

// GET /api/admin/purchases  — view all purchase requests
app.get('/api/admin/purchases', async (req, res) => {
  const result = await pool.query('SELECT * FROM purchase_requests ORDER BY created_at DESC');
  res.json(result.rows);
});

// ─── Start ────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Verox server running on http://localhost:${PORT}`));
});
