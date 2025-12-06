import React, { type ReactNode, useState, useEffect } from 'react';
import DocItem from '@theme-original/DocItem';
import type DocItemType from '@theme/DocItem';
import type { WrapperProps } from '@docusaurus/types';
import { useAuth } from '../../auth/AuthContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = WrapperProps<typeof DocItemType>;

// Define the type for the active view
type ActiveView = 'original' | 'personalized' | 'translated';

export default function DocItemWrapper(props: Props): ReactNode {
  const { user, loading } = useAuth();
  const { siteConfig } = useDocusaurusContext();
  const backendUrl = siteConfig.customFields.backendUrl as string;

  const [rawContent, setRawContent] = useState('');
  const [personalizedContent, setPersonalizedContent] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  
  const [isLoading, setIsLoading] = useState({
    personalization: false,
    translation: false,
  });
  const [error, setError] = useState({
    personalization: null,
    translation: null,
  });

  const [activeView, setActiveView] = useState<ActiveView>('original');

  const { content } = props;
  const docFilePath = content.metadata.source;

  useEffect(() => {
    const fetchRawContent = async () => {
      try {
        const contentPath = docFilePath.replace(/^@site/, ''); // Removes @site prefix
        // Construct a clean path, removing potential double slashes
        const fetchUrl = `${siteConfig.baseUrl.replace(/\/$/, '')}${contentPath}`;
        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch raw content from ${fetchUrl}: ${response.statusText}`);
        }
        const markdownText = await response.text();
        setRawContent(markdownText);
      } catch (err) {
        console.error("Error fetching raw content:", err);
        setError(prev => ({
          ...prev,
          personalization: "Could not load original content for personalization.",
          translation: "Could not load original content for translation."
        }));
      }
    };

    if (user && !rawContent && !error.personalization && !error.translation) {
      fetchRawContent();
    }
  }, [docFilePath, user, siteConfig.baseUrl, rawContent, error.personalization, error.translation]);

  const handleAction = async (type: 'personalize' | 'translate') => {
    const isPersonalize = type === 'personalize';
    const endpoint = isPersonalize 
      ? `/api/v1/chapters/${getChapterId()}/personalized` 
      : '/api/v1/translate';
    
    setIsLoading(prev => ({ ...prev, [isPersonalize ? 'personalization' : 'translation']: true }));
    setError(prev => ({ ...prev, [isPersonalize ? 'personalization' : 'translation']: null }));

    try {
      if (!rawContent) throw new Error("Original content not loaded yet.");
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: isPersonalize ? 'GET' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: isPersonalize ? undefined : JSON.stringify({ content: rawContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `${type} failed`);
      }

      const data = await response.json();
      if (isPersonalize) {
        setPersonalizedContent(data.personalized_content);
        setActiveView('personalized');
      } else {
        setTranslatedContent(data.translated_content);
        setActiveView('translated');
      }
    } catch (err) {
      console.error(`${type} error:`, err);
      setError(prev => ({ ...prev, [isPersonalize ? 'personalization' : 'translation']: err.message }));
    } finally {
      setIsLoading(prev => ({ ...prev, [isPersonalize ? 'personalization' : 'translation']: false }));
    }
  };
  
  const getChapterId = () => {
    const match = docFilePath.match(/\/docs\/(.+?)\.(md|mdx)$/);
    if (!match) throw new Error("Could not extract chapter ID from document path.");
    return match[1];
  }

  const handleShowOriginal = () => setActiveView('original');

  // Protection guard
  if (!loading && !user) {
    return (
      <div className="hero hero--primary" style={{ backgroundColor: 'var(--ifm-color-primary-darkest)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container text--center">
          <h1 className="hero__title">Access Denied</h1>
          <p className="hero__subtitle">You must be logged in to view this content.</p>
          <div className="margin-top--md">
            <Link className="button button--secondary button--lg" to="/login">
              Login to continue
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {user && (
        <div className="margin-bottom--md button-group">
          {activeView !== 'original' && (
            <button
              className="button button--secondary button--sm margin-right--sm"
              onClick={handleShowOriginal}
            >
              Show Original
            </button>
          )}

          {activeView !== 'personalized' && (
            <button
              className="button button--primary button--sm margin-right--sm"
              onClick={() => handleAction('personalize')}
              disabled={isLoading.personalization || !rawContent}
            >
              {isLoading.personalization ? 'Personalizing...' : 'Personalize Chapter'}
            </button>
          )}

          {activeView !== 'translated' && (
             <button
              className="button button--primary button--sm"
              onClick={() => handleAction('translate')}
              disabled={isLoading.translation || !rawContent}
            >
              {isLoading.translation ? 'Translating...' : 'Translate to Urdu'}
            </button>
          )}

          {error.personalization && <div className="alert alert--danger margin-top--sm">Personalization Error: {error.personalization}</div>}
          {error.translation && <div className="alert alert--danger margin-top--sm">Translation Error: {error.translation}</div>}
        </div>
      )}

      {activeView === 'original' && <DocItem {...props} />}
      
      {activeView === 'personalized' && personalizedContent && (
        <div className="markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{personalizedContent}</ReactMarkdown>
        </div>
      )}

      {activeView === 'translated' && translatedContent && (
        <div className={clsx('markdown', 'rtl-content')}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedContent}</ReactMarkdown>
        </div>
      )}
    </>
  );
}