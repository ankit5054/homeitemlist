import React, { useState } from 'react';

const ItemCard = ({ item, selection, onItemSelect, onUnitChange, onQuantityChange, getQuantityOptions, translations, language = 'en' }) => {
  const isSelected = !!selection.selected;
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    if (!isSelected) {
      setIsPressed(true);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  const getCardStyle = () => ({
    border: isSelected ? '2px solid #63b3ed' : '1px solid #4a5568', 
    padding: '25px', 
    borderRadius: '12px', 
    backgroundColor: isSelected ? '#2a4365' : (isPressed ? '#2d3748' : '#1a202c'),
    transition: 'all 0.2s ease',
    boxShadow: isSelected 
      ? '0 4px 12px rgba(99, 179, 237, 0.25)' 
      : (isPressed ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)'),
    transform: isPressed && !isSelected ? 'translateY(-1px)' : 'translateY(0)',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent'
  });

  return (
    <div 
      style={getCardStyle()}
      onMouseEnter={(e) => {
        if (!isSelected && !('ontouchstart' in window)) {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.backgroundColor = '#2d3748';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !('ontouchstart' in window)) {
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.backgroundColor = '#1a202c';
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="item-card">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          minWidth: '200px'
        }}>
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={(e) => onItemSelect(item.item.en, e.target.checked)}
            style={{ 
              marginRight: '12px',
              width: '18px',
              height: '18px',
              accentColor: '#63b3ed'
            }}
          />
          <h4 style={{ 
            margin: 0, 
            color: '#f7fafc', 
            fontSize: '18px',
            fontWeight: '600'
          }}>{item.item[language]}</h4>
        </div>
        
        <div className="item-controls">
          <label style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#cbd5e0',
            minWidth: '35px'
          }}>{translations.unit}</label>
          {item.unit.length === 1 ? (
            <span style={{
              padding: '8px 12px',
              backgroundColor: '#4a5568',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#f7fafc'
            }}>{item.unit[0][language]}</span>
          ) : (
            <select 
              value={selection.unit || item.unit[0].en} 
              onChange={(e) => onUnitChange(item.item.en, e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #4a5568',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: '#1a202c',
                color: '#f7fafc',
                cursor: 'pointer',
                outline: 'none',
                minHeight: '48px'
              }}
            >
              {item.unit.map(unit => (
                <option key={unit.en} value={unit.en}>{unit[language]}</option>
              ))}
            </select>
          )}
        </div>

        <div className="item-controls">
          <label style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#cbd5e0',
            minWidth: '60px'
          }}>{translations.quantity}</label>
          <select 
            value={selection.quantity || ''} 
            onChange={(e) => onQuantityChange(item.item.en, e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #4a5568',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: '#1a202c',
              color: '#f7fafc',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '120px',
              minHeight: '48px',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none'
            }}
          >
            <option value="">{translations.selectQuantity}</option>
            {getQuantityOptions(selection.unit || item.unit[0].en)}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;