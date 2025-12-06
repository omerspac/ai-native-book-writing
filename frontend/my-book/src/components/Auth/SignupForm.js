import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [softwareLevel, setSoftwareLevel] = useState('');
  const [hardwareLevel, setHardwareLevel] = useState('');
  const [interestField, setInterestField] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { siteConfig } = useDocusaurusContext();
  const backendUrl = siteConfig.customFields.backendUrl;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const userData = {
      email,
      password,
      profile: {
        software_level: softwareLevel || null,
        hardware_level: hardwareLevel || null,
        interest_field: interestField || null,
      },
    };

    try {
      const response = await fetch(`${backendUrl}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      window.location.href = '/'; // Redirect to home page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <h2>Signup</h2>
      {error && <div className="alert alert--danger">{error}</div>}
      <div className="margin-bottom--md">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          className="input input--lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="margin-bottom--md">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          className="input input--lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* Background Survey Fields */}
      <fieldset className="margin-bottom--md">
        <legend>Background Survey</legend>
        <div className="margin-bottom--sm">
          <label htmlFor="softwareLevel">Software Background</label>
          <select
            id="softwareLevel"
            name="softwareLevel"
            className="select input--lg"
            value={softwareLevel}
            onChange={(e) => setSoftwareLevel(e.target.value)}
          >
            <option value="">Select an option</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className="margin-bottom--sm">
          <label htmlFor="hardwareLevel">Hardware Background</label>
          <select
            id="hardwareLevel"
            name="hardwareLevel"
            className="select input--lg"
            value={hardwareLevel}
            onChange={(e) => setHardwareLevel(e.target.value)}
          >
            <option value="">Select an option</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label htmlFor="interestField">Field of Interest</label>
          <input
            type="text"
            id="interestField"
            name="interestField"
            className="input input--lg"
            value={interestField}
            onChange={(e) => setInterestField(e.target.value)}
            placeholder="e.g., AI, Robotics, Web, Embedded"
          />
        </div>
      </fieldset>

      <button type="submit" className="button button--primary button--block" disabled={loading}>
        {loading ? 'Signing up...' : 'Signup'}
      </button>
    </form>
  );
}

export default SignupForm;