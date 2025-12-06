import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import SignupForm from '../components/Auth/SignupForm';
import '../css/auth.css';

export default function Signup() {
  return (
    <Layout title="Sign Up" description="Sign up for the AI-Native Book Platform">
      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-form-header">
            <h1>Create Your Account</h1>
            <p>Join our platform to personalize your learning experience.</p>
          </div>
          <SignupForm />
          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}