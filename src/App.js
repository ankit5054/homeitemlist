import React, { useState } from 'react';
import items from './items-translated.json';
import SearchBar from './components/SearchBar';
import ItemCard from './components/ItemCard';
import SelectedItems from './components/SelectedItems';
import { generatePDF, getQuantityOptions, filterItems, shareList } from './utils/helpers';
import { translations } from './translations';

function App() {
  const [selections, setSelections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [language, setLanguage] = useState('hi');

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
        quantity: unit === 'g' ? 50 : 1
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

  const handleDownload = () => {
    generatePDF(selections, items, language);
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
                  fontWeight: '600'
                }}
              >
                {language === 'en' ? 'हिंदी' : 'English'}
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
            />
          </div>
        )}
        
        <div className="mobile-navbar">
          <button className="scroll-button" onClick={toggleView}>
            {showSelectedOnly ? t.addMoreItems : t.viewSelectedItems}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;