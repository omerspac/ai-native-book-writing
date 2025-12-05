// frontend/my-book/src/pages/login.tsx
import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function Login() {
  const {siteConfig} = useDocusaurusContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    // Basic validation
    if (!username || !password) {
      setMessage('Username and password are required.');
      setMessageType('error');
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${window.location.origin}/api/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        setMessage('Login successful!');
        setMessageType('success');
        // Redirect to a protected page or home
        window.location.href = `${siteConfig.baseUrl}`; // Redirect to home or user dashboard
      } else {
        setMessage(data.detail || 'Login failed. Please check your credentials.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setMessage('An unexpected error occurred. Please try again later.');
      setMessageType('error');
    }
  };

  return (
    <Layout title="Login" description="Log in to the AI-Native Book Platform">
      <header className="hero hero--primary" style={{backgroundColor: 'var(--ifm-color-primary-darkest)'}}>
        <div className="container">
          <h1 className="hero__title">Log In</h1>
          <p className="hero__subtitle">Access your personalized AI-Native Book experience.</p>
        </div>
      </header>
      <main>
        <section className="container margin-vert--xl">
          <div className="row">
            <div className="col col--6 col--offset-3">
              <div className="card">
                <div className="card__header">
                  <h3>Access Your Account</h3>
                </div>
                <div className="card__body">
                  <form onSubmit={handleSubmit}>
                    <div className="margin-bottom--md">
                      <label htmlFor="username" className="form__label">Username</label>
                      <input
                        type="text"
                        id="username"
                        className="form__input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="margin-bottom--md">
                      <label htmlFor="password" className="form__label">Password</label>
                      <input
                        type="password"
                        id="password"
                        className="form__input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    {message && (
                      <div className={`alert alert--${messageType}`} role="alert">
                        {message}
                      </div>
                    )}
                    <button type="submit" className="button button--primary button--block">
                      Log In
                    </button>
                  </form>
                </div>
                <div className="card__footer text--center">
                  <p>Don't have an account? <Link to={`${siteConfig.baseUrl}signup`}>Sign Up</Link></p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Login;
