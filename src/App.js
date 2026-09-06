import React, { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar';
import ItemCard from './components/ItemCard';
import SelectedItems from './components/SelectedItems';
import Modal from './components/Modal';
import AdminDashboard from './components/AdminDashboard';
import { generatePDF, getQuantityOptions, filterItems } from './utils/helpers';
import { translations } from './translations';
import { applySheetMutation, connectGoogleSheets, disconnectGoogleSheets, isGoogleSheetsConfigured, readItemsFromSheet } from './utils/googleSheetsClient';

const unitNames = { kg: 'किलो', g: 'ग्राम', L: 'लीटर', pkt: 'पैकेट', pc: 'पीस' };
const fallbackItems = [
  ['Rice', 'चावल', 'kg'], ['Wheat flour', 'गेहूं का आटा', 'kg'], ['Lentils', 'दाल', 'kg'],
  ['Sugar', 'चीनी', 'kg'], ['Salt', 'नमक', 'kg'], ['Cooking oil', 'खाना पकाने का तेल', 'L'],
  ['Milk', 'दूध', 'L'], ['Tea', 'चाय', 'g'], ['Coffee', 'कॉफी', 'g'],
  ['Potatoes', 'आलू', 'kg'], ['Onions', 'प्याज', 'kg'], ['Tomatoes', 'टमाटर', 'kg'],
  ['Eggs', 'अंडे', 'pc'], ['Bread', 'ब्रेड', 'pkt'], ['Soap', 'साबुन', 'pc']
].map(([en, hi, unit]) => ({ item: { en, hi }, unit: [{ en: unit, hi: unitNames[unit] }] }));

const initialRoute = () => {
  const redirected = sessionStorage.getItem('homelist-route');
  if (redirected) { sessionStorage.removeItem('homelist-route'); window.history.replaceState({}, '', redirected); }
  return window.location.pathname === '/admin' ? 'admin' : 'shop';
};

function App() {
  const [items, setItems] = useState(fallbackItems);
  const [selections, setSelections] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [language, setLanguage] = useState('hi');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [view, setView] = useState(initialRoute);
  const [sheetConnected, setSheetConnected] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const id = process.env.REACT_APP_SHEET_ID;
    if (!id) return;
    fetch(`https://docs.google.com/spreadsheets/d/${id}/export?format=csv`)
      .then(response => response.text())
      .then(text => {
        const rows = text.split('\n').slice(1).filter(row => row.trim()).map(row => {
          const [en, hi, unit = 'pc'] = row.split(',').map(cell => cell.replace(/"/g, '').trim());
          return { item: { en, hi: hi || en }, unit: [{ en: unit, hi: unitNames[unit] || 'पीस' }] };
        });
        if (rows.length) setItems(rows);
      }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleRoute = () => setView(window.location.pathname === '/admin' ? 'admin' : 'shop');
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, []);

  const select = (name, selected) => setSelections(current => {
    if (!selected) { const next = { ...current }; delete next[name]; return next; }
    const item = items.find(entry => entry.item.en === name);
    const unit = item?.unit[0]?.en || 'pc';
    const quantity = unit === 'g' ? 50 : unit.toLowerCase() === 'kg' ? 0.5 : 1;
    return { ...current, [name]: { ...current[name], selected: true, unit, quantity } };
  });
  const changeUnit = (name, unit) => setSelections(current => ({ ...current, [name]: { ...current[name], selected: true, unit, quantity: current[name]?.quantity || (unit === 'g' ? 50 : unit.toLowerCase() === 'kg' ? 0.5 : 1) } }));
  const changeQuantity = (name, quantity) => setSelections(current => ({ ...current, [name]: { ...current[name], selected: true, quantity } }));
  const remove = name => setSelections(current => { const next = { ...current }; delete next[name]; return next; });
  const closeModal = () => setModal(current => ({ ...current, isOpen: false }));
  const download = () => setModal({ isOpen: true, title: t.emailConfirmTitle, message: t.emailConfirmMessage, type: 'confirm', onConfirm: async () => { closeModal(); setIsEmailLoading(true); try { await generatePDF(selections, items, language, setModal, t); } finally { setIsEmailLoading(false); } } });
  const clear = () => setModal({ isOpen: true, title: t.clearAllConfirmTitle, message: t.clearAllConfirmMessage, type: 'confirm', onConfirm: () => { setSelections({}); setShowSelectedOnly(false); closeModal(); } });
  const toggle = () => { setShowSelectedOnly(value => !value); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const filtered = filterItems(items, searchTerm, language);
  const selectedCount = Object.values(selections).filter(item => item.selected).length;
  const updateItems = async (nextItems, mutation) => {
    await applySheetMutation(mutation);
    setItems(nextItems);
    setSelections(current => Object.fromEntries(Object.entries(current).filter(([name]) => nextItems.some(entry => entry.item.en === name))));
  };
  const goTo = path => { window.history.pushState({}, '', path); setView(path === '/admin' ? 'admin' : 'shop'); window.scrollTo({ top: 0 }); };
  const connectSheet = async () => {
    await connectGoogleSheets();
    const sheetItems = await readItemsFromSheet();
    setItems(sheetItems.map(entry => ({ ...entry, unit: [{ ...entry.unit[0], hi: unitNames[entry.unit[0].en] || 'पीस' }] })));
    setSheetConnected(true);
  };
  const disconnectSheet = async () => { await disconnectGoogleSheets(); setSheetConnected(false); };

  if (view === 'admin') return <div className="app-shell admin-shell"><AdminDashboard items={items} onItemsChange={updateItems} onBack={() => goTo('/')} sheetConnected={sheetConnected} sheetConfigured={isGoogleSheetsConfigured} onConnectSheet={connectSheet} onDisconnectSheet={disconnectSheet} /></div>;

  return <div className={`app-shell ${showSelectedOnly ? 'selected-only-view' : ''}`}>
    {isEmailLoading && <div className="loading-overlay"><div><div className="spinner" />{t.sending}</div></div>}
    <nav className="top-navigation"><div className="top-brand"><span className="brand-mark" aria-hidden="true">⌂</span><strong>HomeList</strong></div><div className="top-actions"><span className="today-label">Your everyday shopping companion</span><button className="language-toggle" onClick={() => setLanguage(value => value === 'en' ? 'hi' : 'en')}>{language === 'en' ? 'हिंदी' : 'English'}</button></div></nav>
    <div className="app-container">
      <main className="main-panel">
        <header className="app-header"><div className="header-copy"><p className="eyebrow">Everyday essentials</p><h1>{language === 'hi' ? 'आज आपको क्या चाहिए?' : 'What do you need today?'}</h1><p className="subtitle">{language === 'hi' ? 'अपनी सूची बनाने के लिए कोई आइटम चुनें।' : 'Choose an item to build your shopping list.'}</p></div><div className="selection-stat"><strong>{selectedCount}</strong><span>selected</span></div></header>
        <section className="list-toolbar"><SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder={t.searchPlaceholder} /><p className="results-label"><strong>{filtered.length}</strong> items</p></section>
        <div className="item-list">{filtered.map(item => <ItemCard key={item.item.en} item={item} selection={selections[item.item.en] || {}} onItemSelect={select} onUnitChange={changeUnit} onQuantityChange={changeQuantity} getQuantityOptions={getQuantityOptions} translations={t} language={language} />)}</div>
      </main>
      {showSelectedOnly && <div className="selected-view-header"><button onClick={toggle}>← {t.addMoreItems.replace(/^←\s*/, '')}</button></div>}
      <SelectedItems selections={selections} items={items} onDownload={download} onClearAll={clear} onDeleteItem={remove} translations={t} language={language} isEmailLoading={isEmailLoading} onQuantityChange={changeQuantity} getQuantityOptions={getQuantityOptions} />
    </div>
    {!showSelectedOnly && <div className="mobile-navbar"><button className="scroll-button" aria-label={`${language === 'hi' ? 'कार्ट खोलें' : 'Open cart'}, ${selectedCount} items`} onClick={toggle}><span aria-hidden="true">🛒</span> {language === 'hi' ? 'कार्ट' : 'Cart'} <strong>{selectedCount}</strong></button></div>}
    <Modal isOpen={modal.isOpen} onClose={closeModal} title={modal.title} message={modal.message} type={modal.type} translations={t} onConfirm={modal.onConfirm} />
  </div>;
}
export default App;
