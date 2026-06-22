import React from 'react';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty'];

export default function FilterBar({ selectedCategory, onCategoryChange, executionTime, totalLoaded }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
      padding: '1rem',
      background: '#f8fafc',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      border: '1px solid #e2e8f0'
    }}>
      <div>
        <label htmlFor="category-select" style={{ marginRight: '0.5rem', fontWeight: '600', color: '#334155' }}>
          Filter by Category:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#fff',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
        <div>DB Query Speed: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{executionTime || '0ms'}</span></div>
        <div>Items Rendered: <span style={{ color: '#4f46e5', fontWeight: 'bold' }}>{totalLoaded}</span></div>
      </div>
    </div>
  );
}