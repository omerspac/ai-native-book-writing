import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import NavbarItem from '@theme/NavbarItem';
import { useLocation } from '@docusaurus/router';

export default function AuthNavbarItem() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (user) {
    // User is logged in
    return (
      <>
        <NavbarItem
          type="dropdown"
          position="right"
          label={user.email} // Display user's email or a generic "Profile"
        >
          <NavbarItem
            to="/profile"
            label="Profile"
            className={location.pathname === '/profile' ? 'dropdown__link--active' : ''}
            isDropdownLink
          />
          <NavbarItem
            label="Logout"
            onClick={logout}
            isDropdownLink
          />
        </NavbarItem>
      </>
    );
  } else {
    // User is not logged in
    return (
      <>
        <NavbarItem
          to="/login"
          label="Login"
          position="right"
          className={location.pathname === '/login' ? 'navbar__link--active' : ''}
        />
        <NavbarItem
          to="/signup"
          label="Signup"
          position="right"
          className={location.pathname === '/signup' ? 'navbar__link--active' : ''}
        />
      </>
    );
  }
}