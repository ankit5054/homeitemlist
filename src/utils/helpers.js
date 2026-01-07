import React from 'react';

export const generatePDF = async (selections, items, language = 'en', setModal, t) => {
  const selectedItems = Object.entries(selections).filter(([itemName, sel]) => {
    const item = items.find(i => i.item.en === itemName);
    return sel.selected && sel.quantity && (sel.unit || item?.unit[0].en);
  });
  
  if (selectedItems.length === 0) {
    setModal({
      isOpen: true,
      title: t.noItemsSelectedTitle,
      message: t.noItemsSelectedMessage,
      type: 'error'
    });
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Create email content
  const emailContent = selectedItems.map(([itemName, sel]) => {
    const item = items.find(i => i.item.en === itemName);
    const effectiveUnit = sel.unit || item?.unit[0].en;
    const itemDisplay = item?.item[language] || itemName;
    const unitDisplay = item?.unit.find(u => u.en === effectiveUnit)?.[language] || effectiveUnit;
    return `${itemDisplay} - ${sel.quantity} ${unitDisplay}`;
  }).join('\n');
  
  // Send email using Web3Forms
  const formData = new FormData();
  formData.append('access_key', process.env.REACT_APP_WEB3FORMS_KEY);
  formData.append('email', 'ankit.mishra9780@gmail.com');
  formData.append('subject', `Shopping List - ${today}`);
  formData.append('message', `${emailContent}`);
  
  return fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      setModal({
        isOpen: true,
        title: t.emailSuccessTitle,
        message: t.emailSuccessMessage,
        type: 'success'
      });
    } else {
      throw new Error('Email failed');
    }
  })
  .catch((error) => {
    console.error('Email error:', error);
    setModal({
      isOpen: true,
      title: t.emailFailedTitle,
      message: t.emailFailedMessage,
      type: 'error'
    });
  });
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