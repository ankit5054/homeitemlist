import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange, placeholder }) => {
  return (
    <div style={{ marginBottom: '25px' }}>
      <input
        type="text"
        placeholder={`🔍 ${placeholder}`}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '16px',
          border: '1px solid #4a5568',
          borderRadius: '8px',
          backgroundColor: '#1a202c',
          color: '#f7fafc',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
};

export default SearchBar;