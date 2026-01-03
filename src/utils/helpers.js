import React from 'react';
import jsPDF from 'jspdf';

export const generatePDF = (selections, items, language = 'en') => {
  const selectedItems = Object.entries(selections).filter(([itemName, sel]) => {
    const item = items.find(i => i.item.en === itemName);
    return sel.selected && sel.quantity && (sel.unit || item?.unit[0].en);
  });
  
  if (selectedItems.length === 0) {
    alert('No items selected to download');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Create HTML content
  const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .date { font-size: 12px; margin-bottom: 20px; }
          .item { margin-bottom: 8px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="date">Date: ${today}</div>
        ${selectedItems.map(([itemName, sel]) => {
          const item = items.find(i => i.item.en === itemName);
          const effectiveUnit = sel.unit || item?.unit[0].en;
          const itemDisplay = item?.item[language] || itemName;
          const unitDisplay = item?.unit.find(u => u.en === effectiveUnit)?.[language] || effectiveUnit;
          return `<div class="item">${itemDisplay} - ${sel.quantity} ${unitDisplay}</div>`;
        }).join('')}
      </body>
    </html>
  `;
  
  // Create and download HTML file
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `list-${today}.html`;
  a.click();
  URL.revokeObjectURL(url);
};

export const getQuantityOptions = (unit) => {
  const isGrams = unit === 'g';
  const isKg = unit === 'kg' || unit === 'Kg';
  
  let step, max;
  
  if (isGrams) {
    step = 50;
    max = 1000;
  } else if (isKg) {
    step = 0.5;
    max = 10;
  } else {
    step = 1;
    max = 20;
  }
  
  const options = [];
  
  for (let i = step; i <= max; i += step) {
    options.push(<option key={i} value={i}>{i}</option>);
  }
  return options;
};

export const shareList = (selections, items, language = 'en') => {
  const selectedItems = Object.entries(selections).filter(([itemName, sel]) => {
    const item = items.find(i => i.item.en === itemName);
    return sel.selected && sel.quantity && (sel.unit || item?.unit[0].en);
  });
  
  if (selectedItems.length === 0) {
    alert('No items selected to share');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const listText = selectedItems.map(([itemName, sel]) => {
    const item = items.find(i => i.item.en === itemName);
    const effectiveUnit = sel.unit || item?.unit[0].en;
    const itemDisplay = item?.item[language] || itemName;
    const unitDisplay = item?.unit.find(u => u.en === effectiveUnit)?.[language] || effectiveUnit;
    return `${itemDisplay} - ${sel.quantity} ${unitDisplay}`;
  }).join('\n');
  
  const shareText = `Shopping List (${today}):\n\n${listText}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Shopping List',
      text: shareText
    }).catch((error) => {
      console.log('Error sharing:', error);
      alert('Unable to share. Please copy manually:\n\n' + shareText);
    });
  } else {
    alert('Please copy your shopping list:\n\n' + shareText);
  }
};

export const filterItems = (items, searchTerm, language = 'en') => {
  return items.filter(item => 
    item.item[language].toLowerCase().includes(searchTerm.toLowerCase())
  );
};