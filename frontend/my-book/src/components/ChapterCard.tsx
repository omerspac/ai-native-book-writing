import React from 'react';
import Link from '@docusaurus/Link';
import './ChapterCard.css';

interface ChapterCardProps {
  title: string;
  description: string;
  link: string;
}

const ChapterCard: React.FC<ChapterCardProps> = ({ title, description, link }) => {
  return (
    <div className="chapter-card">
      <div className="chapter-card-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <Link className="chapter-card-button" to={link}>
          Read
        </Link>
      </div>
    </div>
  );
};

export default ChapterCard;
