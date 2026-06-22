import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Neon Postgres Connection Pool
const { Pool } = pg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Neon
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running smoothly' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});