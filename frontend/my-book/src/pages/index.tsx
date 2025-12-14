import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import RAGPopup from "../components/RAGPopup";

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title} – Physical AI & Humanoid Robotics
        </Heading>
        <p className="hero__subtitle">
          Explore the cutting-edge world of robotics, AI-driven physical systems, and humanoid intelligence. Dive into interactive tutorials, experiments, and insights.
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Start Reading 📖
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="Learn about Physical AI & Humanoid Robotics through interactive content and RAG-powered assistant.">
      
      <HomepageHeader />
      
      <main>
        <HomepageFeatures />
      </main>

      {/* Floating RAG Assistant Popup */}
      <RAGPopup 
        bookTitle="Physical AI & Humanoid Robotics"
        apiEndpoint="http://127.0.0.1:8000/api/v1/chat/" 
        placeholder="Ask me anything about the book..." 
      />
    </Layout>
  );
}
