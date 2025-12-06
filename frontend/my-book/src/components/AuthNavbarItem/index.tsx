import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import Link from '@docusaurus/Link';

export default function AuthNavbarItem() {
  const { user, logout } = useAuth();

  return (
    <div className="navbar__item">
      {user ? (
        <div className="dropdown dropdown--hoverable">
          <a href="#" className="navbar__link" onClick={(e) => e.preventDefault()}>
            {user.email}
          </a>
          <ul className="dropdown__menu dropdown__menu--right">
            <li>
              <Link className="dropdown__link" to="/profile">
                Profile
              </Link>
            </li>
            <li>
              <a href="#" className="dropdown__link" onClick={(e) => {
                e.preventDefault();
                logout();
              }}>
                Logout
              </a>
            </li>
          </ul>
        </div>
      ) : (
        <>
          <Link className="navbar__item navbar__link" to="/login">
            Login
          </Link>
          <Link className="navbar__item navbar__link" to="/signup">
            Signup
          </Link>
        </>
      )}
    </div>
  );
}
