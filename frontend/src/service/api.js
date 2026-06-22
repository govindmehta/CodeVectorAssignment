const API_BASE_URL = 'http://localhost:5000/api';

export const fetchProducts = async ({ category, cursor }) => {
  let url = `${API_BASE_URL}/products?limit=20`;
  
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