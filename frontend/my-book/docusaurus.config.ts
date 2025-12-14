import type {Config} from '@docusaurus/types';
import {themes as prismThemes} from 'prism-react-renderer';

const config: Config = {
  title: 'AI-Native Book Platform',
  tagline: 'An AI-powered platform for technical book generation and learning',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://omerspac.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/ai-native-book-writing/',

  // GitHub pages deployment config.
  organizationName: 'omerspac',
  projectName: 'ai-native-book-writing',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Production-ready custom fields for backend URL
  customFields: {
    // Use environment variable for production backend URL, fallback to localhost for dev
    backendUrl: process.env.BACKEND_URL || 'http://localhost:8000',
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ur'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/omerspac/ai-native-book-writing/tree/main/frontend/my-book',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/omerspac/ai-native-book-writing/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],

  themeConfig: {
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'AI-Native Book',
      logo: {
        alt: 'AI-Native Book Platform Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Book',
        },
        // The AuthNavbarItem will be injected via a swizzled component,
        // so it does not appear here.
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [{label: 'Book', to: '/docs/intro'}],
        },
        {
          title: 'Community',
          items: [
            {label: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/docusaurus'},
            {label: 'Discord', href: 'https://discordapp.com/invite/docusaurus'},
            {label: 'X', href: 'https://x.com/docusaurus'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'GitHub', href: 'https://github.com/omerspac/ai-native-book-writing'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AI-Native Book Platform. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
