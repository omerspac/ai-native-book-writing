import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import LoginForm from '../components/Auth/LoginForm';
import '../css/auth.css';

export default function Login() {
  return (
    <Layout title="Login" description="Log in to the AI-Native Book Platform">
      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-form-header">
            <h1>Welcome Back</h1>
            <p>Access your personalized AI-Native Book experience.</p>
          </div>
          <LoginForm />
          <div className="auth-footer">
            <p>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}