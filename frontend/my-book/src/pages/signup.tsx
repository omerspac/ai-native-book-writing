// frontend/my-book/src/pages/signup.tsx
import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function Signup() {
  const {siteConfig} = useDocusaurusContext();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    // Basic validation
    if (!username || !email || !password) {
      setMessage('All fields are required.');
      setMessageType('error');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setMessageType('error');
      return;
    }

    try {
      const response = await fetch(`${window.location.origin}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Signup successful! Please proceed to complete your profile.');
        setMessageType('success');
        // Redirect to survey or login page after successful signup
        window.location.href = `${siteConfig.baseUrl}profile/survey`; 
      } else {
        setMessage(data.detail || 'Signup failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setMessage('An unexpected error occurred. Please try again later.');
      setMessageType('error');
    }
  };

  return (
    <Layout title="Signup" description="Sign up for the AI-Native Book Platform">
      <header className="hero hero--primary" style={{backgroundColor: 'var(--ifm-color-primary-darkest)'}}>
        <div className="container">
          <h1 className="hero__title">Sign Up</h1>
          <p className="hero__subtitle">Join our platform to personalize your AI-Native Book experience.</p>
        </div>
      </header>
      <main>
        <section className="container margin-vert--xl">
          <div className="row">
            <div className="col col--6 col--offset-3">
              <div className="card">
                <div className="card__header">
                  <h3>Create Your Account</h3>
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
                      <label htmlFor="email" className="form__label">Email</label>
                      <input
                        type="email"
                        id="email"
                        className="form__input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                      Sign Up
                    </button>
                  </form>
                </div>
                <div className="card__footer text--center">
                  <p>Already have an account? <Link to={`${siteConfig.baseUrl}login`}>Log In</Link></p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Signup;
