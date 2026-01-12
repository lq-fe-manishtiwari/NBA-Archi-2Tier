import React, { createContext, useContext, useState, useEffect } from 'react';

const ViewModeContext = createContext();

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};

export const ViewModeProvider = ({ children }) => {
  const [globalViewMode, setGlobalViewMode] = useState(() => {
    // Check if device is mobile
    const isMobile = window.innerWidth <= 768;
    // Get saved preference from localStorage or default based on device
    const saved = localStorage.getItem('globalViewMode');
    return saved || (isMobile ? 'card' : 'table');
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('globalViewMode', globalViewMode);
  }, [globalViewMode]);

  const toggleGlobalViewMode = () => {
    setGlobalViewMode(prev => prev === 'table' ? 'card' : 'table');
  };

  const setViewMode = (mode) => {
    setGlobalViewMode(mode);
  };

  return (
    <ViewModeContext.Provider value={{
      globalViewMode,
      setGlobalViewMode: setViewMode,
      toggleGlobalViewMode
    }}>
      {children}
    </ViewModeContext.Provider>
  );
};