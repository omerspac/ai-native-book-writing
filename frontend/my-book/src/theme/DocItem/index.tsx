import React, { type ReactNode, useState, useEffect } from 'react';
import DocItem from '@theme-original/DocItem';
import type DocItemType from '@theme/DocItem';
import type { WrapperProps } from '@docusaurus/types';
// import { useAuth } from '@site/src/auth/AuthContext'; // REMOVED
import { useLanguage } from '@site/src/context/LanguageContext';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx';
import Link from '@docusaurus/Link'; // Keep Link for general purpose or remove if unused
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = WrapperProps<typeof DocItemType>;

export default function DocItemWrapper(props: Props): ReactNode {
  // const { user, loading: authLoading } = useAuth(); // REMOVED
  const { language, setLanguage } = useLanguage();
  const { siteConfig } = useDocusaurusContext();
  const backendUrl = siteConfig.customFields.backendUrl as string;

  // Content states
  const [rawContent, setRawContent] = useState('');
  // const [personalizedContent, setPersonalizedContent] = useState(''); // REMOVED
  const [translatedContent, setTranslatedContent] = useState('');
  
  // View states
  const [activeView, setActiveView] = useState<'original' | 'translated'>('original'); // Adjusted activeView options
  const [isTranslated, setIsTranslated] = useState(false);

  // Loading and error states
  const [isLoading, setIsLoading] = useState({
    raw: true,
    // personalization: false, // REMOVED
    translation: false,
  });
  const [error, setError] = useState<string | null>(null);

  const { content } = props;
  const docFilePath = content.metadata.source;

  // 1. Fetch raw content on mount (always fetch now, no user check)
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

    fetchRawContent(); // Always fetch
  }, [docFilePath, siteConfig.baseUrl]); // Removed 'user' from dependencies

  // 2. Handle translation when language context changes
  useEffect(() => {
    if (language === 'ur') {
      handleTranslate();
      setIsTranslated(true);
    } else {
      setIsTranslated(false);
      setTranslatedContent(''); // Clear translated content when switching back
    }
  }, [language, rawContent]); // Removed activeView and personalizedContent

  const getChapterId = () => {
    const match = docFilePath.match(/\/docs\/(.+?)\.(md|mdx)$/);
    if (!match) throw new Error("Could not extract chapter ID.");
    return match[1];
  }

  // 3. Personalization handler (REMOVED ENTIRELY)
  // const handlePersonalize = async () => { ... };


  // 4. Translation handler (removed token requirement)
  const handleTranslate = async () => {
    const contentToTranslate = rawContent; // Always translate raw content
    if (!contentToTranslate) return;

    setIsLoading(prev => ({ ...prev, translation: true }));
    setError(null);
    try {
      // No token required for translation
      const response = await fetch(`${backendUrl}/api/v1/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // REMOVED
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
  // Access denied overlay removed entirely. Content is always public.

  let contentToDisplay = null;
  if (isTranslated) {
    contentToDisplay = <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedContent}</ReactMarkdown>;
  } else { // Always display raw content if not translated
    contentToDisplay = <DocItem {...props} />;
  }

  return (
    <>
      {/* Buttons for personalization and translation (Only show translation-related buttons now) */}
      <div className="margin-bottom--md button-group">
          {isTranslated && (
            <button className="button button--secondary button--sm" onClick={handleShowOriginal} disabled={isLoading.translation}>
              Show Original
            </button>
          )}
          {!isTranslated && language === 'en' && ( // Only show "Translate" if not already translated and language is English
            <button className="button button--primary button--sm" onClick={() => setLanguage('ur')} disabled={isLoading.translation || isLoading.raw}>
              {isLoading.translation ? 'Translating...' : 'Translate to Urdu'}
            </button>
          )}
        </div>

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
      </div>
    </>
  );
}