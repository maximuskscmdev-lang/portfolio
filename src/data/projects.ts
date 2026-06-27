export type ProjectCategory = 'Main Showcase' | 'Large Scale' | 'JEE Prep' | 'Big Tools' | 'Small Tools' | 'Specialized Android';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  isMainShowcase: boolean;
  tags: string[];
  githubUrl?: string;
}

export const projects: Project[] = [
  {
    id: 'Habit-Quest',
    title: 'HabitQuest',
    description: 'A full-on habit tracking app with gamification, AI, and social media features for Android.',
    category: 'Large Scale',
    isMainShowcase: true,
    tags: ['React Native', 'Android', 'Gamification', 'AI', 'Social'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/Habit-Quest'
  },
  {
    id: 'stugenz-final',
    title: 'Stugenz',
    description: 'A large-scale web application for students.',
    category: 'Large Scale',
    isMainShowcase: true,
    tags: ['Web', 'Platform', 'Large Scale'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/stugenz-final'
  },
  {
    id: 'Listen',
    title: 'Listen',
    description: 'A specialized Android app that navigates safety features to extract audio data even when the phone is turned off.',
    category: 'Specialized Android',
    isMainShowcase: true,
    tags: ['Android', 'Background Service', 'Audio'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/Listen'
  },
  {
    id: 'video-editor',
    title: 'Video Editor',
    description: 'An almost complete video editor on the web.',
    category: 'Large Scale',
    isMainShowcase: true,
    tags: ['Video', 'Editor', 'Web'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/video-editor'
  },
  {
    id: 'audiobook',
    title: 'Audiobook App',
    description: 'An app that converts any PDF, TXT, or EPUB document into an audiobook.',
    category: 'Large Scale',
    isMainShowcase: true,
    tags: ['Audiobook', 'TTS', 'Documents'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/audiobook'
  },
  {
    id: 'projedu',
    title: 'Projedu',
    description: 'A functional duplicate of Stugenz offering a completely different UI and feel.',
    category: 'Large Scale',
    isMainShowcase: false,
    tags: ['Web', 'Platform'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/projedu'
  },
  {
    id: 'Habits-jee',
    title: 'HabitsJEE',
    description: 'A TWA website personalized to help with JEE preparation and habit tracking.',
    category: 'JEE Prep',
    isMainShowcase: false,
    tags: ['TWA', 'Web', 'JEE'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/Habits-jee'
  },
  {
    id: 'Titan-OS1',
    title: 'Titanos',
    description: 'A TWA web app tracking my daily routine for JEE prep.',
    category: 'JEE Prep',
    isMainShowcase: false,
    tags: ['TWA', 'Web', 'Routine'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/Titan-OS1'
  },
  {
    id: 'War_room',
    title: 'War Room',
    description: 'A large-scale project for managing intensive study or work sessions.',
    category: 'Large Scale',
    isMainShowcase: false,
    tags: ['Productivity', 'Large Scale'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/War_room'
  },
  {
    id: 'NET_prep',
    title: 'NET Prep',
    description: 'A tool built for NET preparation.',
    category: 'JEE Prep',
    isMainShowcase: false,
    tags: ['Web', 'Preparation'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/NET_prep'
  },
  {
    id: 'proj-jee',
    title: 'Proj JEE',
    description: 'A dedicated project focused on JEE exam preparation tools.',
    category: 'JEE Prep',
    isMainShowcase: false,
    tags: ['Web', 'JEE', 'Tool'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/proj-jee'
  },
  {
    id: 'Produc-scout',
    title: 'Product Scout',
    description: 'A comprehensive tool for scouting and analyzing products.',
    category: 'Big Tools',
    isMainShowcase: false,
    tags: ['Tool', 'Analysis'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/Produc-scout'
  },
  {
    id: 'RepoFinder',
    title: 'Repo Finder',
    description: 'A copy of GitHub store providing a robust search and exploration experience.',
    category: 'Big Tools',
    isMainShowcase: false,
    tags: ['Tool', 'GitHub API'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/RepoFinder'
  },
  {
    id: 'Timer-tool',
    title: 'Timer Tool',
    description: 'A lightweight and focused small utility for time management.',
    category: 'Small Tools',
    isMainShowcase: false,
    tags: ['Tool', 'Utility'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/Timer-tool'
  },
  {
    id: 'errtrack',
    title: 'Errtrack',
    description: 'A small utility for tracking errors and logs.',
    category: 'Small Tools',
    isMainShowcase: false,
    tags: ['Tool', 'Logging'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/errtrack'
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    description: 'The personal portfolio website you are currently viewing, built with React, Vite, and Framer Motion.',
    category: 'Small Tools',
    isMainShowcase: false,
    tags: ['React', 'Framer Motion', 'Web'],
    githubUrl: 'https://github.com/maximuskscmdev-lang/portfolio'
  }
];
