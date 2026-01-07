import React, { useEffect, useState } from 'react';

const Modal = ({ isOpen, onClose, title, message, type = 'info', translations }) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!isOpen) return;
    
    setCountdown(10);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  const getColor = () => {
    switch (type) {
      case 'success': return '#38a169';
      case 'error': return '#e53e3e';
      default: return '#4299e1';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1a202c',
        padding: window.innerWidth <= 1024 ? '60px 30px' : '40px',
        borderRadius: '16px',
        maxWidth: window.innerWidth <= 1024 ? '95%' : '500px',
        width: '90%',
        border: `3px solid ${getColor()}`,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <h3 style={{
          margin: '0 0 24px 0',
          color: '#f7fafc',
          fontSize: window.innerWidth <= 1024 ? '60px' : '36px',
          fontWeight: '700',
          textAlign: 'center'
        }}>{title}</h3>
        <p style={{
          margin: '0 0 32px 0',
          color: '#cbd5e0',
          fontSize: window.innerWidth <= 1024 ? '48px' : '28px',
          lineHeight: '1.6',
          textAlign: 'center'
        }}>{message}</p>
        <button
          onClick={onClose}
          style={{
            padding: window.innerWidth <= 1024 ? '24px 28px' : '12px 24px',
            backgroundColor: getColor(),
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: window.innerWidth <= 1024 ? '60px' : '28px',
            fontWeight: '600',
            width: '100%'
          }}
        >
          {translations?.ok || 'OK'} ({countdown})
        </button>
      </div>
    </div>
  );
};

export default Modal;