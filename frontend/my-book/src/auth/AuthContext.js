import React, { createContext, useState, useEffect, useContext } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const AuthContext = createContext(null);

// This component provides the auth context to its children.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const { siteConfig } = useDocusaurusContext();
  const { backendUrl, baseUrl } = siteConfig.customFields;

  // Load user from localStorage token on initial component mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await fetch(`${backendUrl}/api/v1/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('access_token');
          }
        } catch (error) {
          console.error('Failed to fetch user data on load:', error);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [backendUrl]);

  // Login function
  const login = async (email, password) => {
    // Our custom login endpoint expects 'email' and 'password' as form data
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    
    // Fetch user profile and update state
    const userResponse = await fetch(`${backendUrl}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    if (userResponse.ok) {
      const userData = await userResponse.json();
      setUser(userData);
      window.location.href = siteConfig.baseUrl; // Redirect to homepage
    } else {
      throw new Error('Failed to fetch user profile after login.');
    }
  };

  // Signup function
  const signup = async (email, password, profile) => {
    const response = await fetch(`${backendUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, profile }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Signup failed');
    }

    // After a successful signup, automatically log the user in
    await login(email, password);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = siteConfig.baseUrl; // Redirect to homepage
  };

  const authValue = { user, loading, login, signup, logout };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};