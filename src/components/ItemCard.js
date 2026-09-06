import React from 'react';

const initials = value => value.trim().slice(0, 1).toUpperCase();

const ItemCard = ({ item, selection, onItemSelect, onUnitChange, onQuantityChange, getQuantityOptions, translations, language = 'en' }) => {
  const selected = Boolean(selection.selected);
  const unit = selection.unit || item.unit[0].en;
  const displayName = item.item[language] || item.item.en;

  return <article className={`item-card ${selected ? 'selected' : ''}`}>
    <div className="item-identity">
      <span className="item-avatar" aria-hidden="true">{initials(displayName)}</span>
      <div className="item-copy"><h3>{displayName}</h3><p>{item.unit[0][language]}</p></div>
    </div>
    <button className={`add-button ${selected ? 'added' : ''}`} onClick={() => onItemSelect(item.item.en, !selected)} aria-pressed={selected}>{selected ? '✓ Added' : '+ Add'}</button>
    {selected && <div className="item-options">
      {item.unit.length > 1 && <label><span>{translations.unit}</span><select value={unit} onChange={event => onUnitChange(item.item.en, event.target.value)}>{item.unit.map(option => <option key={option.en} value={option.en}>{option[language]}</option>)}</select></label>}
      <label><span>{translations.quantity}</span><select aria-label={`${translations.quantity} ${displayName}`} value={selection.quantity || ''} onChange={event => onQuantityChange(item.item.en, event.target.value)}>{getQuantityOptions(unit)}</select></label>
    </div>}
  </article>;
};

export default ItemCard;
