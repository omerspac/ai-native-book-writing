import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';
import { useAuth } from '../auth/AuthContext';
import { Redirect } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function Profile() {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const { siteConfig } = useDocusaurusContext();
  const backendUrl = siteConfig.customFields.backendUrl;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && !loading) { // Only fetch if user is loaded and logged in
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError("No access token found.");
          return;
        }

        try {
          const response = await fetch(`${backendUrl}/api/v1/users/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to fetch user data');
          }

          const data = await response.json();
          setUserData(data);
        } catch (err) {
          setError(err.message);
          console.error("Error fetching user data:", err);
        }
      }
    };

    fetchUserData();
  }, [user, loading, backendUrl]);

  if (loading) {
    return <Layout><p>Loading user data...</p></Layout>;
  }

  if (!user) {
    // Redirect unauthenticated users to the login page
    return <Redirect to="/login" />;
  }

  return (
    <Layout title="Profile" description="User Profile Page">
      <header className="hero hero--primary" style={{backgroundColor: 'var(--ifm-color-primary-darkest)'}}>
        <div className="container">
          <h1 className="hero__title">User Profile</h1>
          <p className="hero__subtitle">Welcome, {user.email}!</p>
        </div>
      </header>
      <main>
        <section className="container margin-vert--xl">
          <div className="row">
            <div className="col col--6 col--offset-3">
              <div className="card">
                <div className="card__header">
                  <h3>Your Information</h3>
                </div>
                <div className="card__body">
                  {error && <div className="alert alert--danger">{error}</div>}
                  {userData ? (
                    <>
                      <p><strong>ID:</strong> {userData.id}</p>
                      <p><strong>Email:</strong> {userData.email}</p>
                      {/* Add more profile details if needed later */}
                    </>
                  ) : (
                    <p>Fetching profile details...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Profile;