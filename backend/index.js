import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import { pool } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

app.use('/api/simulate-injection',  async (req, res) => {
  const { category } = req.body;
  try {
    const injectQuery = `
      INSERT INTO products (name, category, price, created_at, updated_at)
      SELECT 
        'LIVE INJECTED ITEM #' || i, 
        $1, 
        999.99, 
        NOW() + (i || ' seconds')::interval,
        NOW() + (i || ' seconds')::interval
      FROM generate_series(1, 5) AS i;
    `;
    await pool.query(injectQuery, [category || 'Electronics']);
    res.json({ success: true, message: 'Successfully injected 5 newer products!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running smoothly' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});