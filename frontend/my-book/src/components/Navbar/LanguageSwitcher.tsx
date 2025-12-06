import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../auth/AuthContext';
import styles from './styles.module.css';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();

  // Don't render the switcher if the user is not logged in
  if (!user) {
    return null;
  }

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  return (
    <div className="navbar__item dropdown dropdown--hoverable">
      <a
        className="navbar__link"
        href="#"
        onClick={(e) => e.preventDefault()}
      >
        {language === 'en' ? 'Language: English' : 'زبان: اردو'}
      </a>
      <ul className="dropdown__menu">
        <li>
          <a
            href="#"
            className={`dropdown__link ${language === 'en' ? 'dropdown__link--active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleLanguageChange('en');
            }}
          >
            English
          </a>
        </li>
        <li>
          <a
            href="#"
            className={`dropdown__link ${language === 'ur' ? 'dropdown__link--active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleLanguageChange('ur');
            }}
          >
            اردو (Urdu)
          </a>
        </li>
      </ul>
    </div>
  );
}
