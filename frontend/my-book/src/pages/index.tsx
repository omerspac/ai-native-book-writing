import React from 'react';
import Layout from '@theme/Layout';
import ChapterCard from '../components/ChapterCard';
import '../css/homepage.css';

const chapters = [
  {
    title: 'Chapter 1: The Genesis of Physical AI',
    description: 'Explore the foundational concepts and historical evolution that led to the dawn of humanoid robotics.',
    link: '/docs/chapter01',
  },
  {
    title: 'Chapter 2: The Mechanical Anatomy',
    description: 'A deep dive into the mechanical systems, materials, and structural designs that form the skeleton of modern humanoids.',
    link: '/docs/chapter02',
  },
  {
    title: 'Chapter 3: Actuators and Motion',
    description: 'Understanding the "muscles" of robots: a detailed look at the motors, hydraulics, and artificial muscles that enable movement.',
    link: '/docs/chapter03',
  },
  {
    title: 'Chapter 4: The Robotic Nervous System',
    description: 'Delve into the world of sensors and the intricate wiring that allows robots to perceive and interact with their environment.',
    link: '/docs/chapter04',
  },
  {
    title: 'Chapter 5: Powering the Modern Humanoid',
    description: 'A critical examination of the power sources, energy storage, and management systems that keep humanoid robots operational.',
    link: '/docs/chapter05',
  },
  {
    title: 'Chapter 6: The Brains of the Operation',
    description: 'An introduction to the computational cores, from microcontrollers to sophisticated AI processors that govern robotic behavior.',
    link: '/docs/chapter06',
  },
  {
    title: 'Chapter 7: Software and Control Architectures',
    description: 'Learn about the operating systems and software frameworks that orchestrate the complex functions of a humanoid robot.',
    link: '/docs/chapter07',
  },
  {
    title: 'Chapter 8: The Art of Bipedal Locomotion',
    description: 'Uncover the challenges and breakthroughs in achieving stable, human-like walking and movement.',
    link: '/docs/chapter08',
  },
  {
    title: 'Chapter 9: Human-Robot Interaction',
    description: 'Explore the principles of designing intuitive and safe interfaces for communication between humans and robots.',
    link: '/docs/chapter09',
  },
  {
    title: 'Chapter 10: The Future of Humanoid Robotics',
    description: 'A forward-looking perspective on the upcoming advancements and societal impact of physical AI.',
    link: '/docs/chapter10',
  },
];

export default function Home(): JSX.Element {
  return (
    <Layout
      title="Home"
      description="A book about Physical AI & Humanoid Robotics">
      <main className="homepage-container">
        <header className="homepage-header">
          <h1>Physical AI & Humanoid Robotics</h1>
          <p>
            An in-depth exploration into the mechanics, electronics, and software 
            that bring humanoid robots to life.
          </p>
        </header>
        <div className="chapter-grid">
          {chapters.map((chapter, idx) => (
            <ChapterCard key={idx} {...chapter} />
          ))}
        </div>
      </main>
    </Layout>
  );
}