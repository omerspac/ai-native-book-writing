import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import LoginForm from '../components/Auth/LoginForm';
import '../css/auth.css'; // Import the new CSS

function Login() {
  return (
    <Layout title="Login" description="Log in to the AI-Native Book Platform">
      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-form-header">
            <h1>Access Your Account</h1>
          </div>
          <LoginForm />
          <div className="text--center margin-top--lg">
            <p>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Login;
