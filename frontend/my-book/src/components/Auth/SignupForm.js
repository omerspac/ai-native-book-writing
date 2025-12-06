import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [softwareLevel, setSoftwareLevel] = useState('');
  const [hardwareLevel, setHardwareLevel] = useState('');
  const [interestField, setInterestField] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const profile = {
      software_level: softwareLevel || 'Beginner',
      hardware_level: hardwareLevel || 'Beginner',
      interest_field: interestField || 'AI',
    };

    try {
      await signup(email, password, profile);
      // Redirect is handled by AuthContext
    } catch (err) {
      setError(err.message);
      alert(`Signup Failed: ${err.message}`); // Show alert on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert--danger">{error}</div>}
      <div className="margin-bottom--md">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          className="input"
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
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <fieldset className="margin-bottom--md">
        <legend>Background Survey (Optional)</legend>
        <div className="margin-bottom--sm">
          <label htmlFor="softwareLevel">Software Background</label>
          <select
            id="softwareLevel"
            className="select"
            value={softwareLevel}
            onChange={(e) => setSoftwareLevel(e.target.value)}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className="margin-bottom--sm">
          <label htmlFor="hardwareLevel">Hardware Background</label>
          <select
            id="hardwareLevel"
            className="select"
            value={hardwareLevel}
            onChange={(e) => setHardwareLevel(e.target.value)}
          >
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
            className="input"
            value={interestField}
            onChange={(e) => setInterestField(e.target.value)}
            placeholder="e.g., AI, Robotics, Web"
          />
        </div>
      </fieldset>

      <button type="submit" className="button button--primary button--block" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
}

export default SignupForm;