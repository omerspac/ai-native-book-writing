import React from 'react';
import { AuthProvider } from '../auth/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';

function Root({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </LanguageProvider>
  );
}

export default Root;
