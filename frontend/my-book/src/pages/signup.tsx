import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import SignupForm from '../components/Auth/SignupForm';
import '../css/auth.css'; // Import the new CSS

function Signup() {
  return (
    <Layout title="Signup" description="Sign up for the AI-Native Book Platform">
      <main className="auth-container">
        <div className="auth-card">
          <div className="auth-form-header">
            <h1>Create Your Account</h1>
          </div>
          <SignupForm />
          <div className="text--center margin-top--lg">
            <p>
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Signup;
