import React from 'react';
import Link from '@docusaurus/Link';
import { useAuth } from '@site/src/auth/AuthContext';
import styles from './styles.module.css';

export default function AuthNavbarItem() {
  // useAuth() will be undefined on static build, so we need a browser check.
  const context = useAuth();

  // On server-side render, context is null. Show a placeholder or nothing.
  if (!context) {
    return null;
  }

  const { user, logout, loading } = context;

  // While loading user state, don't show anything to prevent flicker
  if (loading) {
    return <div className={styles.authNavItem} />;
  }

  return (
    <div className={styles.authNavItem}>
      {user ? (
        <div className="navbar__item dropdown dropdown--hoverable">
          <a
            href="#"
            className="navbar__link"
            onClick={(e) => e.preventDefault()}
            style={{ cursor: 'default' }}>
            {user.email}
          </a>
          <ul className="dropdown__menu dropdown__menu--right">
            <li>
              <Link className="dropdown__link" to="/profile">
                Profile
              </Link>
            </li>
            <li>
              <a
                href="#"
                className="dropdown__link"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                }}>
                Logout
              </a>
            </li>
          </ul>
        </div>
      ) : (
        <div className={styles.authButtons}>
          <Link to="/login" className="button button--secondary button--sm margin-right--sm">
            Login
          </Link>
          <Link to="/signup" className="button button--primary button--sm">
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
