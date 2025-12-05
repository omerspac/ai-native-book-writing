// frontend/my-book/src/pages/profile/survey.tsx
import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { Redirect } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function ProfileSurvey() {
  const {siteConfig} = useDocusaurusContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const [experienceLevel, setExperienceLevel] = useState('');
  const [learningGoal, setLearningGoal] = useState('');
  const [softwareLanguages, setSoftwareLanguages] = useState('');
  const [softwareFrameworks, setSoftwareFrameworks] = useState('');
  const [softwareTools, setSoftwareTools] = useState('');
  const [hardwareTypes, setHardwareTypes] = useState('');
  const [hardwareDetails, setHardwareDetails] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${window.location.origin}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setIsAuthenticated(true);
          // Fetch existing profile data to pre-fill the form
          const profileResponse = await fetch(`${window.location.origin}/api/profile/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setExperienceLevel(profileData.experience_level || '');
            setLearningGoal(profileData.learning_goal || '');
            setSoftwareLanguages(profileData.software_experience?.languages?.join(', ') || '');
            setSoftwareFrameworks(profileData.software_experience?.frameworks?.join(', ') || '');
            setSoftwareTools(profileData.software_experience?.tools?.join(', ') || '');
            setHardwareTypes(profileData.hardware_experience?.types?.join(', ') || '');
            setHardwareDetails(profileData.hardware_experience?.details || '');
          }
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('access_token'); // Token might be expired or invalid
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    const token = localStorage.getItem('access_token');
    if (!token) {
      setMessage('You need to be logged in to submit the survey.');
      setMessageType('error');
      return;
    }

    const surveyData = {
      experience_level: experienceLevel,
      learning_goal: learningGoal,
      software_experience: {
        languages: softwareLanguages.split(',').map(s => s.trim()).filter(Boolean),
        frameworks: softwareFrameworks.split(',').map(s => s.trim()).filter(Boolean),
        tools: softwareTools.split(',').map(s => s.trim()).filter(Boolean),
      },
      hardware_experience: {
        types: hardwareTypes.split(',').map(s => s.trim()).filter(Boolean),
        details: hardwareDetails,
      },
    };

    try {
      const response = await fetch(`${window.location.origin}/api/profile/survey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(surveyData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setMessageType('success');
        // Optionally redirect to a dashboard or home
        window.location.href = `${siteConfig.baseUrl}`; 
      } else {
        setMessage(data.detail || 'Failed to update profile. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      setMessage('An unexpected error occurred. Please try again later.');
      setMessageType('error');
    }
  };

  const handleSkip = () => {
    window.location.href = `${siteConfig.baseUrl}`; 
  };

  if (loading) {
    return (
      <Layout title="Loading..." description="Loading profile survey">
        <main style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Loading...</h1>
        </main>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to login page
    return <Redirect to={`${siteConfig.baseUrl}login`} />;
  }

  return (
    <Layout title="Profile Survey" description="Help us personalize your experience">
      <header className="hero hero--primary" style={{backgroundColor: 'var(--ifm-color-primary-darkest)'}}>
        <div className="container">
          <h1 className="hero__title">Tell Us About Yourself</h1>
          <p className="hero__subtitle">Help us personalize your AI-Native Book experience.</p>
        </div>
      </header>
      <main>
        <section className="container margin-vert--xl">
          <div className="row">
            <div className="col col--8 col--offset-2">
              <div className="card">
                <div className="card__header">
                  <h3>User Profile Survey</h3>
                </div>
                <div className="card__body">
                  <form onSubmit={handleSubmit}>
                    <div className="margin-bottom--md">
                      <label htmlFor="experienceLevel" className="form__label">Experience Level</label>
                      <select
                        id="experienceLevel"
                        className="form__input"
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                      >
                        <option value="">Select an option</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <div className="margin-bottom--md">
                      <label htmlFor="learningGoal" className="form__label">Your Primary Learning Goal</label>
                      <input
                        type="text"
                        id="learningGoal"
                        className="form__input"
                        value={learningGoal}
                        onChange={(e) => setLearningGoal(e.target.value)}
                        placeholder="e.g., 'Understand Physical AI concepts', 'Build a humanoid robot'"
                      />
                    </div>
                    
                    <h4>Software Experience</h4>
                    <div className="margin-bottom--md">
                      <label htmlFor="softwareLanguages" className="form__label">Programming Languages (comma-separated)</label>
                      <input
                        type="text"
                        id="softwareLanguages"
                        className="form__input"
                        value={softwareLanguages}
                        onChange={(e) => setSoftwareLanguages(e.target.value)}
                        placeholder="e.g., Python, C++, JavaScript"
                      />
                    </div>
                    <div className="margin-bottom--md">
                      <label htmlFor="softwareFrameworks" className="form__label">Frameworks (comma-separated)</label>
                      <input
                        type="text"
                        id="softwareFrameworks"
                        className="form__input"
                        value={softwareFrameworks}
                        onChange={(e) => setSoftwareFrameworks(e.target.value)}
                        placeholder="e.g., FastAPI, PyTorch, React"
                      />
                    </div>
                    <div className="margin-bottom--md">
                      <label htmlFor="softwareTools" className="form__label">Software Tools (comma-separated)</label>
                      <input
                        type="text"
                        id="softwareTools"
                        className="form__input"
                        value={softwareTools}
                        onChange={(e) => setSoftwareTools(e.target.value)}
                        placeholder="e.g., Docker, Git, VS Code"
                      />
                    </div>

                    <h4>Hardware Experience</h4>
                    <div className="margin-bottom--md">
                      <label htmlFor="hardwareTypes" className="form__label">Hardware Types (comma-separated)</label>
                      <input
                        type="text"
                        id="hardwareTypes"
                        className="form__input"
                        value={hardwareTypes}
                        onChange={(e) => setHardwareTypes(e.target.value)}
                        placeholder="e.g., Robotics kits, GPUs, Raspberry Pi"
                      />
                    </div>
                    <div className="margin-bottom--md">
                      <label htmlFor="hardwareDetails" className="form__label">Hardware Details (free text)</label>
                      <textarea
                        id="hardwareDetails"
                        className="form__input"
                        value={hardwareDetails}
                        onChange={(e) => setHardwareDetails(e.target.value)}
                        rows={3}
                        placeholder="e.g., 'Experience with ROS, Arduino, NVIDIA Jetson devices.'"
                      ></textarea>
                    </div>

                    {message && (
                      <div className={`alert alert--${messageType}`} role="alert">
                        {message}
                      </div>
                    )}
                    <div className="button-group">
                      <button type="submit" className="button button--primary">
                        Save Profile
                      </button>
                      <button type="button" onClick={handleSkip} className="button button--secondary margin-left--sm">
                        Skip for now
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default ProfileSurvey;
