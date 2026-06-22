import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seedDatabase() {
  console.log('Starting high-performance database seed...');
  const startTime = Date.now();

  const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty'];
  const names = ['Premium', 'Elite', 'Eco', 'Pro', 'Ultra', 'Essential'];
  const items = ['Gadget', 'Shirt', 'Blender', 'Novel', 'Shoes', 'Cream'];

  // Added explicit type casting (::text[]) to the placeholders so Postgres can read them as arrays
  const seedQuery = `
    INSERT INTO products (name, category, price, created_at, updated_at)
    SELECT 
      ($1::text[])[floor(random() * 6) + 1] || ' ' || ($2::text[])[floor(random() * 6) + 1] || ' #' || i as name,
      ($3::text[])[floor(random() * 6) + 1] as category,
      ROUND((random() * 500 + 5)::numeric, 2) as price,
      NOW() - (i || ' seconds')::interval as created_at,
      NOW() - (i || ' seconds')::interval as updated_at
    FROM generate_series(1, 200000) AS i;
  `;

  try {
    console.log('Clearing existing entries...');
    await pool.query('TRUNCATE TABLE products RESTART IDENTITY;');
    
    console.log('Inserting 200,000 items...');
    await pool.query(seedQuery, [names, items, categories]);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Successfully seeded 200,000 products in ${duration} seconds!`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();