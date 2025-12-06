import React, { createContext, useState, useEffect, useContext } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { siteConfig } = useDocusaurusContext();
  const backendUrl = siteConfig.customFields.backendUrl;

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await fetch(`${backendUrl}/api/v1/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('access_token');
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [backendUrl]);

  const login = async (email, password) => {
    const response = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    // Fetch user data after successful login
    const userResponse = await fetch(`${backendUrl}/api/v1/users/me`, {
        headers: {
            'Authorization': `Bearer ${data.access_token}`,
        },
    });
    if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
    } else {
        throw new Error('Failed to fetch user after login');
    }
  };

  const signup = async (email, password, profile) => {
    const response = await fetch(`${backendUrl}/api/v1/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, profile }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Signup failed');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    // Fetch user data after successful signup
    const userResponse = await fetch(`${backendUrl}/api/v1/users/me`, {
        headers: {
            'Authorization': `Bearer ${data.access_token}`,
        },
    });
    if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
    } else {
        throw new Error('Failed to fetch user after signup');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/'; // Redirect to home page
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
