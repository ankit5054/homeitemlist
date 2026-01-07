import React from 'react';

// Add CSS for spinner animation
const spinnerStyle = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject CSS into document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinnerStyle;
  document.head.appendChild(style);
}

const SelectedItems = ({ selections, items, onDownload, onClearAll, onToggleView, showToggleButton, translations, language = 'en', isEmailLoading = false }) => {
  const selectedItems = Object.entries(selections).filter(([itemName, sel]) => {
    const item = items.find(i => i.item.en === itemName);
    return sel.selected && sel.quantity && (sel.unit || item?.unit[0].en);
  });

  return (
    <div className="side-panel" id="selected-items">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px',
        paddingBottom: '20px',
        borderBottom: '2px solid #4a5568'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#f7fafc', 
          fontSize: '20px', 
          fontWeight: '700'
        }}>{translations?.selectedItems || '📋 Selected Items'}</h3>
        <button 
          onClick={onDownload}
          disabled={isEmailLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: isEmailLoading ? '#718096' : '#38a169',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isEmailLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(56, 161, 105, 0.4)',
            transition: 'all 0.2s ease',
            marginRight: '10px',
            WebkitTapHighlightColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            if (!('ontouchstart' in window) && !isEmailLoading) {
              e.target.style.backgroundColor = '#2f855a';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(56, 161, 105, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!('ontouchstart' in window) && !isEmailLoading) {
              e.target.style.backgroundColor = '#38a169';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(56, 161, 105, 0.4)';
            }
          }}
          onTouchStart={(e) => {
            if (!isEmailLoading) {
              e.target.style.backgroundColor = '#2f855a';
              e.target.style.transform = 'scale(0.98)';
            }
          }}
          onTouchEnd={(e) => {
            if (!isEmailLoading) {
              setTimeout(() => {
                e.target.style.backgroundColor = '#38a169';
                e.target.style.transform = 'scale(1)';
              }, 100);
            }
          }}
        >
          {isEmailLoading && (
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #ffffff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          {isEmailLoading ? 'Sending...' : (translations?.download || '📥 Download')}
        </button>
        <button 
          onClick={onClearAll}
          style={{
            padding: '10px 20px',
            backgroundColor: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(229, 62, 62, 0.4)',
            transition: 'all 0.2s ease',
            WebkitTapHighlightColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            if (!('ontouchstart' in window)) {
              e.target.style.backgroundColor = '#c53030';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(229, 62, 62, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!('ontouchstart' in window)) {
              e.target.style.backgroundColor = '#e53e3e';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(229, 62, 62, 0.4)';
            }
          }}
          onTouchStart={(e) => {
            e.target.style.backgroundColor = '#c53030';
            e.target.style.transform = 'scale(0.98)';
          }}
          onTouchEnd={(e) => {
            setTimeout(() => {
              e.target.style.backgroundColor = '#e53e3e';
              e.target.style.transform = 'scale(1)';
            }, 100);
          }}
        >
          {translations?.clearAll || '🗑️ Clear All'}
        </button>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {selectedItems.map(([itemName, sel]) => {
          const item = items.find(i => i.item.en === itemName);
          const effectiveUnit = sel.unit || item?.unit[0].en;
          const unitDisplay = item?.unit.find(u => u.en === effectiveUnit)?.[language] || effectiveUnit;
          return (
            <div 
              key={itemName} 
              style={{ 
                padding: '16px', 
                border: '1px solid #4a5568', 
                borderRadius: '8px', 
                marginBottom: '12px',
                backgroundColor: '#1a202c',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!('ontouchstart' in window)) {
                  e.currentTarget.style.backgroundColor = '#2d3748';
                  e.currentTarget.style.borderColor = '#718096';
                }
              }}
              onMouseLeave={(e) => {
                if (!('ontouchstart' in window)) {
                  e.currentTarget.style.backgroundColor = '#1a202c';
                  e.currentTarget.style.borderColor = '#4a5568';
                }
              }}
            >
              <div style={{ 
                fontWeight: '600', 
                color: '#f7fafc', 
                marginBottom: '4px',
                fontSize: '15px'
              }}>{item?.item[language] || itemName}</div>
              <div style={{ 
                color: '#cbd5e0', 
                fontSize: '14px',
                fontWeight: '500'
              }}>{sel.quantity} {unitDisplay}</div>
            </div>
          );
        })}
        {selectedItems.length === 0 && (
          <div style={{ 
            color: '#718096', 
            fontStyle: 'italic', 
            textAlign: 'center',
            padding: '40px 20px',
            fontSize: '16px'
          }}>
            {translations?.noItemsSelected || '🛍️ No items selected yet'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedItems;