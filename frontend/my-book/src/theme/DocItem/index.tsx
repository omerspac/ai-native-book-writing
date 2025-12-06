import React, { type ReactNode, useState, useEffect } from 'react';
import DocItem from '@theme-original/DocItem';
import type DocItemType from '@theme/DocItem';
import type { WrapperProps } from '@docusaurus/types';
import { useAuth } from '@site/src/auth/AuthContext';
import { useLanguage } from '@site/src/context/LanguageContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = WrapperProps<typeof DocItemType>;

export default function DocItemWrapper(props: Props): ReactNode {
  const { user, loading: authLoading } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { siteConfig } = useDocusaurusContext();
  const backendUrl = siteConfig.customFields.backendUrl as string;

  // Content states
  const [rawContent, setRawContent] = useState('');
  const [personalizedContent, setPersonalizedContent] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  
  // View states
  const [activeView, setActiveView] = useState<'original' | 'personalized'>('original');
  const [isTranslated, setIsTranslated] = useState(false);

  // Loading and error states
  const [isLoading, setIsLoading] = useState({
    raw: true,
    personalization: false,
    translation: false,
  });
  const [error, setError] = useState<string | null>(null);

  const { content } = props;
  const docFilePath = content.metadata.source;

  // 1. Fetch raw content on mount
  useEffect(() => {
    const fetchRawContent = async () => {
      setIsLoading(prev => ({ ...prev, raw: true }));
      try {
        // Docusaurus serves static files from the 'static' directory.
        // We construct the path to fetch the raw .md file.
        // docFilePath looks like @site/docs/chapter01.md, we need /docs/chapter01.md relative to base URL
        const contentPath = docFilePath.replace(/^@site/, ''); 
        // Ensure no double slashes if baseUrl ends with a slash
        const fetchUrl = `${siteConfig.baseUrl.replace(/\/$/, '')}${contentPath}`;
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error(`Failed to fetch raw content: ${response.statusText}`);
        const markdownText = await response.text();
        setRawContent(markdownText);
      } catch (err) {
        setError(`Could not load chapter content: ${err.message}`);
      } finally {
        setIsLoading(prev => ({ ...prev, raw: false }));
      }
    };

    if (user) { // Only fetch raw content if user is logged in
      fetchRawContent();
    }
  }, [docFilePath, user, siteConfig.baseUrl]);

  // 2. Handle translation when language context changes
  useEffect(() => {
    if (language === 'ur') {
      handleTranslate();
      setIsTranslated(true);
    } else {
      setIsTranslated(false);
    }
  }, [language, activeView, personalizedContent, rawContent]);

  const getChapterId = () => {
    const match = docFilePath.match(/\/docs\/(.+?)\.(md|mdx)$/);
    if (!match) throw new Error("Could not extract chapter ID.");
    return match[1];
  }

  // 3. Personalization handler
  const handlePersonalize = async () => {
    if (personalizedContent) {
      setActiveView('personalized');
      return;
    }

    setIsLoading(prev => ({ ...prev, personalization: true }));
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("You must be logged in.");

      const chapterId = getChapterId();
      const response = await fetch(`${backendUrl}/api/v1/chapters/${chapterId}/personalized`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error((await response.json()).detail || 'Personalization failed');
      
      const data = await response.json();
      setPersonalizedContent(data.personalized_content);
      setActiveView('personalized');
    } catch (err) {
      setError(`Personalization failed: ${err.message}`);
      alert(`Personalization failed: ${err.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, personalization: false }));
    }
  };

  // 4. Translation handler
  const handleTranslate = async () => {
    const contentToTranslate = activeView === 'personalized' ? personalizedContent : rawContent;
    if (!contentToTranslate) return;

    setIsLoading(prev => ({ ...prev, translation: true }));
    setError(null);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error("You must be logged in.");

      const response = await fetch(`${backendUrl}/api/v1/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: contentToTranslate }),
      });

      if (!response.ok) throw new Error((await response.json()).detail || 'Translation failed');

      const data = await response.json();
      setTranslatedContent(data.translated_content);
    } catch (err) {
      setError(`Translation failed: ${err.message}`);
      alert(`Translation failed: ${err.message}`);
    } finally {
      setIsLoading(prev => ({ ...prev, translation: false }));
    }
  };

  const handleShowOriginal = () => {
    setActiveView('original');
    setLanguage('en'); // Also switch language back to English
  };

  // --- Render Logic ---
  // If not authenticated, always render DocItem, but cover it with an access denied message.
  // This allows Docusaurus to build the site without broken link errors.
  const renderAccessDeniedOverlay = !user && !authLoading;

  let contentToDisplay = null;
  if (isTranslated) {
    contentToDisplay = <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedContent}</ReactMarkdown>;
  } else if (activeView === 'personalized') {
    contentToDisplay = <ReactMarkdown remarkPlugins={[remarkGfm]}>{personalizedContent}</ReactMarkdown>;
  } else {
    contentToDisplay = <DocItem {...props} />;
  }

  return (
    <>
      {/* Buttons for personalization and translation */}
      {user && ( // Only show buttons if user is logged in
        <div className="margin-bottom--md button-group">
          {activeView !== 'original' && (
            <button className="button button--secondary button--sm" onClick={handleShowOriginal} disabled={isLoading.personalization || isLoading.translation}>
              Show Original
            </button>
          )}
          {activeView === 'original' && (
            <button className="button button--primary button--sm" onClick={handlePersonalize} disabled={isLoading.personalization || isLoading.raw}>
              {isLoading.personalization ? 'Personalizing...' : 'Personalize Chapter'}
            </button>
          )}
        </div>
      )}

      {error && <div className="alert alert--danger margin-top--sm">{error}</div>}

      {/* Main content area */}
      <div style={{ position: 'relative' }}>
        <div className={clsx('markdown', isTranslated && 'rtl-content')}>
          {isLoading.raw || (isTranslated && isLoading.translation) ? (
            <div>Loading content...</div>
          ) : (
            contentToDisplay
          )}
        </div>

        {renderAccessDeniedOverlay && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent white overlay
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10, // Ensure it's on top
            textAlign: 'center',
            flexDirection: 'column',
            padding: '2rem',
          }}>
            <h1 className="hero__title">Access Denied</h1>
            <p className="hero__subtitle">You must be logged in to view this content.</p>
            <Link className="button button--secondary button--lg" to="/login">
              Login to continue
            </Link>
          </div>
        )}
      </div>
    </>
  );
}