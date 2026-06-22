import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running smoothly' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});