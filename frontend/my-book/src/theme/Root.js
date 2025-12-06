import React from 'react';
import { LanguageProvider } from '../context/LanguageContext';

function Root({ children }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}

export default Root;
