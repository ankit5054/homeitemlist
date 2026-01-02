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
  
  // Create and download HTML file (which can be printed to PDF)
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `list-${today}.html`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Show instruction to user
  setTimeout(() => {
    alert('HTML file downloaded. Open it and use Ctrl+P to print as PDF for Hindi support.');
  }, 100);
};

export const getQuantityOptions = (unit) => {
  const isGrams = unit === 'g';
  const step = isGrams ? 50 : 1;
  const max = isGrams ? 1000 : 20;
  const options = [];
  
  for (let i = step; i <= max; i += step) {
    options.push(<option key={i} value={i}>{i}</option>);
  }
  return options;
};

export const filterItems = (items, searchTerm, language = 'en') => {
  return items.filter(item => 
    item.item[language].toLowerCase().includes(searchTerm.toLowerCase())
  );
};