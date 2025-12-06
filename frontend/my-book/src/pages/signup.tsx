import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SignupForm from '../components/Auth/SignupForm'; // Import the SignupForm component

function Signup() {
  const {siteConfig} = useDocusaurusContext();

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
                  <SignupForm /> {/* Use the SignupForm component */}
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
