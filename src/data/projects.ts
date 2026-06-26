export type ProjectCategory = 'Main Showcase' | 'Large Scale' | 'JEE Prep' | 'Big Tools' | 'Small Tools' | 'Specialized Android';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  isMainShowcase: boolean;
  tags: string[];
}

export const projects: Project[] = [
  {
    id: 'habitquestrn',
    title: 'HabitQuest',
    description: 'A full-on habit tracking app with gamification, AI, and social media features for Android.',
    category: 'Large Scale',
    isMainShowcase: true,
    tags: ['React Native', 'Android', 'Gamification', 'AI', 'Social'],
  },
  {
    id: 'stugenz',
    title: 'Stugenz',
    description: 'A large-scale web application for students.',
    category: 'Large Scale',
    isMainShowcase: true,
    tags: ['Web', 'Platform', 'Large Scale'],
  },
  {
    id: 'listen',
    title: 'Listen',
    description: 'A specialized Android app that navigates safety features to extract audio data even when the phone is turned off.',
    category: 'Specialized Android',
    isMainShowcase: true,
    tags: ['Android', 'Background Service', 'Audio'],
  },
  {
    id: 'projedu',
    title: 'Projedu',
    description: 'A functional duplicate of Stugenz offering a completely different UI and feel.',
    category: 'Large Scale',
    isMainShowcase: false,
    tags: ['Web', 'Platform'],
  },
  {
    id: 'habitsjee',
    title: 'HabitsJEE',
    description: 'A TWA website personalized to help with JEE preparation and habit tracking.',
    category: 'JEE Prep',
    isMainShowcase: false,
    tags: ['TWA', 'Web', 'JEE'],
  },
  {
    id: 'titanos',
    title: 'Titanos',
    description: 'A TWA web app tracking my daily routine for JEE prep.',
    category: 'JEE Prep',
    isMainShowcase: false,
    tags: ['TWA', 'Web', 'Routine'],
  },
  {
    id: 'product-scout',
    title: 'Product Scout',
    description: 'A comprehensive tool for scouting and analyzing products.',
    category: 'Big Tools',
    isMainShowcase: false,
    tags: ['Tool', 'Analysis'],
  },
  {
    id: 'repo-finder',
    title: 'Repo Finder',
    description: 'A copy of GitHub store providing a robust search and exploration experience.',
    category: 'Big Tools',
    isMainShowcase: false,
    tags: ['Tool', 'GitHub API'],
  },
  {
    id: 'timer-tool',
    title: 'Timer Tool',
    description: 'A lightweight and focused small utility for time management.',
    category: 'Small Tools',
    isMainShowcase: false,
    tags: ['Tool', 'Utility'],
  },
  {
    id: 'sprite-slicer',
    title: 'Sprite Slicer',
    description: 'A handy tool to slice sprite sheets easily.',
    category: 'Small Tools',
    isMainShowcase: false,
    tags: ['Tool', 'Game Dev'],
  },
  {
    id: 'errtrack',
    title: 'Errtrack',
    description: 'A small utility for tracking errors and logs.',
    category: 'Small Tools',
    isMainShowcase: false,
    tags: ['Tool', 'Logging'],
  },
  {
    id: 'study-snap',
    title: 'Study Snap',
    description: 'A small tool to quickly capture and organize study materials.',
    category: 'Small Tools',
    isMainShowcase: false,
    tags: ['Tool', 'Study'],
  },
  {
    id: 'war-room',
    title: 'War Room',
    description: 'A large-scale project for managing intensive study or work sessions.',
    category: 'Large Scale',
    isMainShowcase: false,
    tags: ['Productivity', 'Large Scale'],
  },
  {
    id: 'video-editor',
    title: 'Video Editor',
    description: 'An almost complete video editor.',
    category: 'Large Scale',
    isMainShowcase: true,
    tags: ['Video', 'Editor', 'Web'],
  },
  {
    id: 'audiobook-converter',
    title: 'Audiobook App',
    description: 'An app that converts any PDF, TXT, or EPUB document into an audiobook.',
    category: 'Large Scale',
    isMainShowcase: true,
    tags: ['Audiobook', 'TTS', 'Documents'],
  }
];
