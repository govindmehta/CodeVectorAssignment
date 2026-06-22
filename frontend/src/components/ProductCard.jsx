import React from 'react';

export default function ProductCard({ product }) {
  const formattedDate = new Date(product.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '1.25rem',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'transform 0.15s ease',
    }}>
      <div>
        <span style={{
          fontSize: '0.75rem',
          backgroundColor: '#eff6ff',
          color: '#1d4ed8',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontWeight: '600'
        }}>
          {product.category}
        </span>
        <h3 style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '1.1rem', color: '#1e293b' }}>
          {product.name}
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
          ID: {product.id} • Added at {formattedDate}
        </p>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>
          ${parseFloat(product.price).toFixed(2)}
        </span>
      </div>
    </div>
  );
}