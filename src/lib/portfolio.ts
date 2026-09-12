export type WorkCategory = 'Reels' | 'Films' | 'Motion' | 'AI filmmaking';

export type Project = {
  id: string;
  title: string;
  category: WorkCategory;
  description: string;
  contribution: string;
  poster: string;
  preview?: string;
  film?: string;
  captions?: string;
  aspect: 'landscape' | 'portrait';
  placeholder: boolean;
};

export const profile = {
  name: 'Raden Hanifa',
  role: 'Video editor & multimedia creative',
  email: 'Radenhanif00@gmail.com',
  cv: 'https://cv.radenhanifa.com',
  portrait: '/media/portrait.webp',
  intro: 'I’m Raden. I bring a cinematic eye to the edit.',
  about: 'My work moves between filming, editing and AI-assisted creation. From aviation to food and lifestyle, I’m drawn to the details that give a film its feeling: the rhythm, the color, the sound.',
  tools: ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'AI-assisted workflows'],
};

export const projects: Project[] = [
  {
    id: 'swiftsoft', title: 'SwiftSoft', category: 'AI filmmaking',
    description: 'An idea, brought into motion.',
    contribution: 'End-to-end AI video creation',
    poster: '/media/swiftsoft-poster.webp', preview: '/media/swiftsoft-preview.mp4',
    film: '/media/swiftsoft-film.mp4', aspect: 'landscape', placeholder: false,
  },
  {
    id: 'reels-food', title: 'Food & feeling', category: 'Reels',
    description: 'F&B · Short-form', contribution: 'Portfolio selection in progress',
    poster: '/placeholders/food.webp', aspect: 'portrait', placeholder: true,
  },
  {
    id: 'reels-aviation', title: 'A different altitude', category: 'Reels',
    description: 'Aviation · Short-form', contribution: 'Portfolio selection in progress',
    poster: '/placeholders/aviation.webp', aspect: 'portrait', placeholder: true,
  },
  {
    id: 'films', title: 'The longer story', category: 'Films',
    description: 'Long-form · YouTube', contribution: 'Portfolio selection in progress',
    poster: '/placeholders/film.webp', aspect: 'landscape', placeholder: true,
  },
  {
    id: 'motion', title: 'Made to move', category: 'Motion',
    description: 'Motion graphics · Visual rhythm', contribution: 'Portfolio selection in progress',
    poster: '/placeholders/motion.webp', aspect: 'landscape', placeholder: true,
  },
];

export const categories = ['All work', 'Reels', 'Films', 'Motion', 'AI filmmaking'] as const;
export type WorkFilter = typeof categories[number];
