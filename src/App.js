import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ItemCard from './components/ItemCard';
import SelectedItems from './components/SelectedItems';
import Modal from './components/Modal';
import { generatePDF, getQuantityOptions, filterItems, shareList } from './utils/helpers';
import { translations } from './translations';

function App() {
  const [items, setItems] = useState([]);
  const [selections, setSelections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [language, setLanguage] = useState('hi');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  // Load items from Google Sheets
  useEffect(() => {
    const SHEET_ID = process.env.REACT_APP_SHEET_ID;
    
    // Use CSV export URL (no API key needed)
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    
    fetch(url)
      .then(response => response.text())
      .then(csvText => {
        const rows = csvText.split('\n').slice(1); // Skip header
        const sheetItems = rows.filter(row => row.trim()).map(row => {
          const [en, hi, unit] = row.split(',').map(cell => cell.replace(/"/g, '').trim());
          
          // Better unit translation mapping
          const getHindiUnit = (englishUnit) => {
            const unitMap = {
              'kg': 'किलो',
              'Kg': 'किलो', 
              'g': 'ग्राम',
              'L': 'लीटर',
              'pkt': 'पैकेट',
              'Pc': 'पीस',
              'pc': 'पीस',
              'set': 'सेट'
            };
            return unitMap[englishUnit] || 'पीस';
          };
          
          return {
            item: { en: en || '', hi: hi || en || '' },
            unit: [{
              en: unit || 'pc',
              hi: getHindiUnit(unit || 'pc')
            }]
          };
        });
        if (sheetItems.length > 0) setItems(sheetItems);
      })
      .catch(error => {
        console.log('Failed to load from Google Sheets:', error);
        // Show message to user if no data loads
        setItems([{
          item: { en: 'No items available', hi: 'कोई आइटम उपलब्ध नहीं' },
          unit: [{ en: 'pc', hi: 'पीस' }]
        }]);
      });
  }, []);

  const handleItemSelect = (itemName, isSelected) => {
    if (isSelected) {
      setSelections(prev => ({
        ...prev,
        [itemName]: { selected: true }
      }));
    } else {
      setSelections(prev => {
        const newSelections = { ...prev };
        delete newSelections[itemName];
        return newSelections;
      });
    }
  };

  const handleUnitChange = (itemName, unit) => {
    setSelections(prev => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        selected: true,
        unit,
        quantity: prev[itemName]?.quantity || (unit === 'g' ? 50 : unit === 'kg' || unit === 'Kg' ? 0.5 : 1)
      }
    }));
  };

  const handleQuantityChange = (itemName, quantity) => {
    setSelections(prev => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        selected: true,
        quantity
      }
    }));
  };

  const handleDownload = async () => {
    setIsEmailLoading(true);
    try {
      await generatePDF(selections, items, language, setModal, t);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleShare = () => {
    shareList(selections, items, language);
  };

  const handleClearAll = () => {
    setSelections({});
  };

  const scrollToSelectedItems = () => {
    const selectedItemsElement = document.getElementById('selected-items');
    if (selectedItemsElement) {
      selectedItemsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleView = () => {
    setShowSelectedOnly(!showSelectedOnly);
    // Scroll to top when toggling views
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredItems = filterItems(items, searchTerm, language);
  const t = translations[language];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div className={`app-container ${showSelectedOnly ? 'selected-only-view' : ''}`}>
        {isEmailLoading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            color: '#f7fafc',
            fontSize: window.innerWidth <= 1024 ? '48px' : '18px',
            fontWeight: '600'
          }}>
            <div style={{
              width: window.innerWidth <= 1024 ? '80px' : '40px',
              height: window.innerWidth <= 1024 ? '80px' : '40px',
              border: `${window.innerWidth <= 1024 ? '8px' : '4px'} solid #4a5568`,
              borderTop: `${window.innerWidth <= 1024 ? '8px' : '4px'} solid #f7fafc`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: window.innerWidth <= 1024 ? '40px' : '20px'
            }} />
            {t.sending}
          </div>
        )}
        {!showSelectedOnly && (
          <div className="main-panel">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '30px' 
            }}>
              <h2 style={{ 
                margin: 0, 
                color: '#f7fafc', 
                fontSize: '28px', 
                fontWeight: '700'
              }}>{t.itemSelector}</h2>
              <button 
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#4a5568',
                  color: '#f7fafc',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  minWidth: '80px',
                  fontWeight: '600',
                  marginRight: '10px'
                }}
              >
                {language === 'en' ? 'हिंदी' : 'English'}
              </button>
              <button 
                onClick={() => setModal({
                  isOpen: true,
                  title: t.emailSuccessTitle,
                  message: t.emailSuccessMessage,
                  type: 'success'
                })}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#38a169',
                  color: '#f7fafc',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Test Modal
              </button>
            </div>
            
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder={t.searchPlaceholder} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredItems.map(item => (
                <ItemCard
                  key={item.item.en}
                  item={item}
                  selection={selections[item.item.en] || {}}
                  onItemSelect={handleItemSelect}
                  onUnitChange={handleUnitChange}
                  onQuantityChange={handleQuantityChange}
                  getQuantityOptions={getQuantityOptions}
                  translations={t}
                  language={language}
                />
              ))}
            </div>
          </div>
        )}

        {!showSelectedOnly && (
          <SelectedItems 
            selections={selections}
            items={items}
            onDownload={handleDownload}
            onClearAll={handleClearAll}
            onToggleView={toggleView}
            showToggleButton={true}
            translations={t}
            language={language}
            isEmailLoading={isEmailLoading}
          />
        )}
        
        {showSelectedOnly && (
          <div style={{ width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px',
              padding: '0 30px'
            }}>
              <button 
                onClick={toggleView}
                className="add-more-button"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {t.addMoreItems}
              </button>
            </div>
            <SelectedItems 
              selections={selections}
              items={items}
              onDownload={handleDownload}
              onClearAll={handleClearAll}
              onToggleView={toggleView}
              showToggleButton={false}
              translations={t}
              language={language}
              isEmailLoading={isEmailLoading}
            />
          </div>
        )}
        
        <div className="mobile-navbar">
          <button className="scroll-button" onClick={toggleView}>
            {showSelectedOnly ? t.addMoreItems : t.viewSelectedItems}
          </button>
        </div>
      </div>
      
      <Modal 
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        translations={t}
      />
    </div>
  );
}

export default App;