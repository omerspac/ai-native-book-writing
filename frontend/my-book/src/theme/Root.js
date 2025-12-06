import React from 'react';
import { AuthProvider } from '../auth/AuthContext';

function Root({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

export default Root;
