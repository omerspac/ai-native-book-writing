import React, { useState } from 'react';
import { useAuth } from '@site/src/auth/AuthContext';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [softwareLevel, setSoftwareLevel] = useState('Beginner');
  const [hardwareLevel, setHardwareLevel] = useState('Beginner');
  const [interestField, setInterestField] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const profile = {
      software_level: softwareLevel,
      hardware_level: hardwareLevel,
      interest_field: interestField || 'AI', // Default interest
    };

    try {
      await signup(email, password, profile);
      // Redirect is now handled by AuthContext on successful signup/login
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert--danger" role="alert">
          {error}
        </div>
      )}
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      <fieldset>
        <legend>Personalize Your Experience</legend>
        <div className="form-field">
          <label htmlFor="softwareLevel">Software Background</label>
          <select
            id="softwareLevel"
            className="select"
            value={softwareLevel}
            onChange={(e) => setSoftwareLevel(e.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="hardwareLevel">Hardware Background</label>
          <select
            id="hardwareLevel"
            className="select"
            value={hardwareLevel}
            onChange={(e) => setHardwareLevel(e.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="interestField">Field of Interest</label>
          <input
            type="text"
            id="interestField"
            className="input"
            value={interestField}
            onChange={(e) => setInterestField(e.target.value)}
            placeholder="e.g., Robotics, Web Dev, Data Science"
          />
        </div>
      </fieldset>

      <button
        type="submit"
        className="button button--primary button--block auth-submit-button"
        disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
}
