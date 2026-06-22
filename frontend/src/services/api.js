

const API_BASE_URL =  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export const fetchProducts = async ({ category, cursor }) => {
  let url = `${API_BASE_URL}api/products?limit=20`;
  
  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }
  if (cursor && cursor.timestamp && cursor.id) {
    url += `&nextCursorTimestamp=${encodeURIComponent(cursor.timestamp)}&nextCursorId=${encodeURIComponent(cursor.id)}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response failure');
  }
  return response.json();
};

export const injectConcurrentData = async (category) => {
  const response = await fetch(`${API_BASE_URL}api/simulate-injection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category })
  });
  return response.json();
};