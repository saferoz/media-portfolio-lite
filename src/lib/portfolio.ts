export type WorkCategory = 'Reels' | 'Films' | 'Motion' | 'Color grading' | 'AI filmmaking';

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
  duration?: string;
  credits?: string;
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
    film: '/media/swiftsoft-film.mp4', duration: '00:55', aspect: 'landscape', placeholder: false,
  },
  {
    id: 'eltacoria-translation', title: 'El Tacoria — Translation', category: 'Reels',
    description: 'F&B commercial', contribution: 'Concept, script, production & edit',
    credits: 'Arabic script: Abdullah Alzahrani',
    poster: '/media/eltacoria-translation-poster.webp', preview: '/media/eltacoria-translation-preview.mp4',
    film: '/media/eltacoria-translation-film.mp4', duration: '00:14', aspect: 'portrait', placeholder: false,
  },
  {
    id: 'eltacoria-app', title: 'El Tacoria — App', category: 'Reels',
    description: 'F&B commercial', contribution: 'Concept, script, production & edit',
    credits: 'Arabic script: Abdullah Alzahrani',
    poster: '/media/eltacoria-app-poster.webp', preview: '/media/eltacoria-app-preview.mp4',
    film: '/media/eltacoria-app-film.mp4', duration: '00:25', aspect: 'portrait', placeholder: false,
  },
  {
    id: 'jury-eid', title: 'Jury Chocolate — Eid Gift', category: 'Reels',
    description: 'F&B · Product film', contribution: 'Planning, cinematography & edit',
    poster: '/media/jury-eid-poster.webp', preview: '/media/jury-eid-preview.mp4',
    film: '/media/jury-eid-film.mp4', duration: '00:22', aspect: 'portrait', placeholder: false,
  },
  {
    id: 'jury-cake', title: 'Jury Chocolate — Cake', category: 'Reels',
    description: 'F&B · Product film', contribution: 'Planning, cinematography & edit',
    poster: '/media/jury-cake-poster.webp', preview: '/media/jury-cake-preview.mp4',
    film: '/media/jury-cake-film.mp4', duration: '00:18', aspect: 'portrait', placeholder: false,
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

export const categories = ['All work', 'Reels', 'Films', 'Motion', 'Color grading', 'AI filmmaking'] as const;
export type WorkFilter = typeof categories[number];
