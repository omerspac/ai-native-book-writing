import React, {type ReactNode, useState, useEffect} from 'react';
import DocItem from '@theme-original/DocItem';
import type DocItemType from '@theme/DocItem';
import type {WrapperProps} from '@docusaurus/types';
import { useAuth } from '../../auth/AuthContext'; // Adjust path as necessary
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import clsx from 'clsx'; // For conditional class names

type Props = WrapperProps<typeof DocItemType>;

export default function DocItemWrapper(props: Props): ReactNode {
  const { user } = useAuth();
  const { siteConfig } = useDocusaurusContext();
  const backendUrl = siteConfig.customFields.backendUrl;

  const [rawContent, setRawContent] = useState('');
  const [translatedContent, setTranslatedContent] = useState('');
  const [isTranslated, setIsTranslated] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  const [personalizedContent, setPersonalizedContent] = useState('');
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [personalizationLoading, setPersonalizationLoading] = useState(false);
  const [personalizationError, setPersonalizationError] = useState(null);

  const { content } = props;
  const docFilePath = content.metadata.source; // e.g., @site/docs/chapter01.md

  useEffect(() => {
    // Fetch the raw Markdown content of the current document
    const fetchRawContent = async () => {
      try {
        // Docusaurus serves static files from the 'static' directory,
        // or directly from the 'docs' folder for markdown files.
        // We need to construct the correct path to fetch the raw .md file.
        // docFilePath looks like @site/docs/chapter01.md
        // We need to get `/docs/chapter01.md` or similar to fetch.
        const contentPath = docFilePath.replace(/^@site/, ''); // Removes @site prefix
        const response = await fetch(`${siteConfig.baseUrl}${contentPath}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch raw content: ${response.statusText}`);
        }
        const markdownText = await response.text();
        setRawContent(markdownText);
      } catch (err) {
        console.error("Error fetching raw content:", err);
        setPersonalizationError("Could not load original content for personalization."); // Also set for personalization
        setTranslationError("Could not load original content for translation.");
      }
    };
    
    // Only fetch raw content once per doc item load
    if (!rawContent && !personalizationError && !translationError) {
      fetchRawContent();
    }

  }, [docFilePath, rawContent, personalizationError, translationError, siteConfig.baseUrl]);

  const handleTranslate = async () => {
    setTranslationLoading(true);
    setTranslationError(null);
    setPersonalizedContent(''); // Clear personalized content if translating
    setIsPersonalized(false); // Reset personalization state

    try {
      if (!rawContent) {
        throw new Error("Original content not loaded yet.");
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = '/login'; // Or show a popup
        throw new Error("You must be logged in to translate content.");
      }

      const response = await fetch(`${backendUrl}/api/v1/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: rawContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Translation failed');
      }

      const data = await response.json();
      setTranslatedContent(data.translated_content);
      setIsTranslated(true);
    } catch (err) {
      setTranslationError(err.message);
      console.error("Translation error:", err);
    } finally {
      setTranslationLoading(false);
    }
  };

  const handleShowOriginal = () => {
    setIsTranslated(false);
    setTranslatedContent('');
    setIsPersonalized(false); // Clear personalized content as well
    setPersonalizedContent(''); // Clear personalized content as well
  };

  const handlePersonalize = async () => {
    setPersonalizationLoading(true);
    setPersonalizationError(null);
    setTranslatedContent(''); // Clear translated content if personalizing
    setIsTranslated(false); // Reset translation state

    try {
      if (!rawContent) {
        throw new Error("Original content not loaded yet.");
      }

      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = '/login'; // Or show a popup
        throw new Error("You must be logged in to personalize content.");
      }

      // Extract chapter_id from docFilePath (e.g., from "@site/docs/chapter01.md" -> "chapter01")
      // This assumes a simple structure like /docs/chapter-name.md
      const chapterIdMatch = docFilePath.match(/\/docs\/(.+?)\.md/);
      let chapterId = null;
      if (chapterIdMatch && chapterIdMatch[1]) {
          chapterId = chapterIdMatch[1];
      } else {
        // Handle nested docs like /docs/tutorial-basics/create-a-document.md
        // We need to extract the full relative path from docs/
        const fullChapterPathMatch = docFilePath.match(/\/docs\/(.+)$/);
        if (fullChapterPathMatch && fullChapterPathMatch[1]) {
          chapterId = fullChapterPathMatch[1].replace(/\.mdx?$/, ''); // Remove .md or .mdx
        }
      }
      

      if (!chapterId) {
          throw new Error("Could not extract chapter ID from document path.");
      }

      const response = await fetch(`${backendUrl}/api/v1/chapters/${chapterId}/personalized`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Personalization failed');
      }

      const data = await response.text(); // Assuming backend returns plain text markdown
      setPersonalizedContent(data);
      setIsPersonalized(true);
    } catch (err) {
      setPersonalizationError(err.message);
      console.error("Personalization error:", err);
    } finally {
      setPersonalizationLoading(false);
    }
  };

  const handleShowOriginalPersonalized = () => {
    setIsPersonalized(false);
    setPersonalizedContent('');
    setIsTranslated(false); // Clear translated content as well
    setTranslatedContent(''); // Clear translated content as well
  };


  return (
    <>
      {user && ( // Show buttons only if user is logged in
        <div className="margin-bottom--md button-group"> {/* Added button-group for styling */}
          {/* Personalization Button */}
          {isPersonalized ? (
            <button
              className="button button--secondary button--sm margin-right--sm"
              onClick={handleShowOriginalPersonalized}
              disabled={personalizationLoading}
            >
              Show Original Content
            </button>
          ) : (
            <button
              className="button button--primary button--sm margin-right--sm"
              onClick={handlePersonalize}
              disabled={personalizationLoading || !rawContent}
            >
              {personalizationLoading ? 'Personalizing...' : 'Personalize Chapter'}
            </button>
          )}

          {/* Translation Button */}
          {isTranslated ? (
            <button
              className="button button--secondary button--sm"
              onClick={handleShowOriginal}
              disabled={translationLoading}
            >
              Show Original English
            </button>
          ) : (
            <button
              className="button button--primary button--sm"
              onClick={handleTranslate}
              disabled={translationLoading || !rawContent}
            >
              {translationLoading ? 'Translating...' : 'Translate to Urdu'}
            </button>
          )}
          {personalizationError && (
            <div className="alert alert--danger margin-top--sm">
              Personalization Error: {personalizationError}
            </div>
          )}
          {translationError && (
            <div className="alert alert--danger margin-top--sm">
              Translation Error: {translationError}
            </div>
          )}
        </div>
      )}
      {isPersonalized && personalizedContent ? (
        <div className="markdown"> {/* Apply markdown class */}
          <div dangerouslySetInnerHTML={{ __html: personalizedContent }} />
        </div>
      ) : isTranslated && translatedContent ? (
        <div className={clsx('markdown', 'rtl-content')}> {/* Apply markdown and RTL classes */}
          <div dangerouslySetInnerHTML={{ __html: translatedContent }} />
        </div>
      ) : (
        <DocItem {...props} />
      )}
    </>
  );
