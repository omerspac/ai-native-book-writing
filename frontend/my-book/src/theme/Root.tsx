import React from 'react';
import Root from '@theme-original/Root';
import { LanguageProvider } from '../context/LanguageContext';
import RAGPopup from '../components/RAGPopup';

export default function RootWrapper(props) {
  return (
    <LanguageProvider>
      <Root {...props} />
      <RAGPopup />
    </LanguageProvider>
  );
}