import React, { type ReactNode, useState, useEffect } from 'react';
import DocItem from '@theme-original/DocItem';
import type DocItemType from '@theme/DocItem';
import type { WrapperProps } from '@docusaurus/types';
import { useAuth } from '../../auth/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
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
        const contentPath = docFilePath.replace(/^@site/, '');
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

    if (user) {
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
  if (authLoading) {
    return <div>Loading authentication...</div>;
  }
  
  if (!user) {
    return (
      <div className="hero hero--primary" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container text--center">
          <h1 className="hero__title">Access Denied</h1>
          <p className="hero__subtitle">You must be logged in to view this content.</p>
          <Link className="button button--secondary button--lg" to="/login">Login to continue</Link>
        </div>
      </div>
    );
  }

  let contentToShow = <DocItem {...props} />;
  if (isTranslated) {
    contentToShow = <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedContent}</ReactMarkdown>;
  } else if (activeView === 'personalized') {
    contentToShow = <ReactMarkdown remarkPlugins={[remarkGfm]}>{personalizedContent}</ReactMarkdown>;
  }

  return (
    <>
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

      {error && <div className="alert alert--danger margin-top--sm">{error}</div>}

      <div className={clsx('markdown', isTranslated && 'rtl-content')}>
        {isLoading.raw || (isTranslated && isLoading.translation) ? (
          <div>Loading content...</div>
        ) : (
          contentToShow
        )}
      </div>
    </>
  );
}