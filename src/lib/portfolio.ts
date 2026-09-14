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
  projectHref?: string;
  cardLabel?: string;
  aspect: 'landscape' | 'portrait';
  placeholder: boolean;
  immersive?: boolean;
};

export const profile = {
  name: 'Raden Hanifa',
  role: 'Video editor & multimedia creative',
  email: 'raden@radenhanifa.com',
  instagram: 'https://www.instagram.com/radenhanifa/',
  linkedin: 'https://www.linkedin.com/in/radenhanifa',
  cv: 'https://cv.radenhanifa.com',
  portrait: '/media/portrait.webp',
  intro: 'I’m Raden. I bring a cinematic eye to the edit.',
  about: 'My work moves between filming, editing and AI-assisted creation. From aviation to food and lifestyle, I’m drawn to the details that give a film its feeling: the rhythm, the color, the sound.',
  tools: ['Premiere Pro', 'DaVinci Resolve', 'After Effects', 'AI-assisted workflows'],
};

export const projects: Project[] = [
  {
    id: 'spiderman', title: 'Spider-Man — A Cinematic Fan Concept', category: 'AI filmmaking',
    description: 'Personal project · Seedance 2.0', cardLabel: 'AI fan concept',
    contribution: 'Personal AI filmmaking concept · Seedance 2.0',
    poster: '/media/spiderman-poster.webp', preview: '/media/spiderman-preview.mp4', film: '/media/spiderman-film.mp4', duration: '00:47', aspect: 'portrait', placeholder: false,
  },
  {
    id: 'swiftsoft', title: 'SwiftSoft', category: 'AI filmmaking',
    description: 'An AI launch film for SwiftSoft, a SaaS ERP platform.', cardLabel: 'AI launch film',
    contribution: 'AI video production & editing',
    credits: 'AI filmmaking and editing by Raden Hanifa, based on a script from SwiftSoft for their launch.',
    poster: '/media/swiftsoft-poster.webp', preview: '/media/swiftsoft-preview.mp4',
    film: '/media/swiftsoft-film.mp4', duration: '00:55', aspect: 'landscape', placeholder: false,
  },
  {
    id: 'eltacoria-app', title: 'El Tacoria — App', category: 'Reels',
    description: 'A short promo for the El Tacoria app.', cardLabel: 'App promo', contribution: 'Concept, script, production & edit',
    credits: 'Arabic script: Abdullah Alzahrani',
    poster: '/media/eltacoria-app-poster.webp', preview: '/media/eltacoria-app-preview.mp4',
    film: '/media/eltacoria-app-film.mp4', duration: '00:25', aspect: 'portrait', placeholder: false,
  },
  {
    id: 'eltacoria-translation', title: 'El Tacoria — Ramadan Campaign', category: 'Reels',
    description: 'A Ramadan campaign reel for El Tacoria.', cardLabel: 'Ramadan campaign', contribution: 'Concept, production & edit',
    poster: '/media/eltacoria-translation-poster.webp', preview: '/media/eltacoria-translation-preview.mp4',
    film: '/media/eltacoria-translation-film.mp4', duration: '00:14', aspect: 'portrait', placeholder: false,
  },
  {
    id: 'jury-cake', title: 'Jury Chocolate — Eid Showcase', category: 'Reels',
    description: 'An Eid showcase for Jury Chocolate.', cardLabel: 'Eid showcase', contribution: 'Planning, cinematography & edit',
    poster: '/media/jury-cake-poster.webp', preview: '/media/jury-cake-preview.mp4',
    film: '/media/jury-cake-film.mp4', duration: '00:18', aspect: 'portrait', placeholder: false,
  },
  {
    id: 'jury-eid', title: 'Jury Chocolate — Eid Gift', category: 'Reels',
    description: 'An Eid gift reel for Jury Chocolate.', cardLabel: 'Eid gift reel', contribution: 'Planning, cinematography & edit',
    poster: '/media/jury-eid-poster.webp', preview: '/media/jury-eid-preview.mp4',
    film: '/media/jury-eid-film.mp4', duration: '00:22', aspect: 'portrait', placeholder: false,
  },
  {
    id: 'cadillac', title: 'Cadillac Escalade — Showcase', category: 'Reels',
    description: 'A short showcase of the Cadillac Escalade.', cardLabel: 'Showcase reel', contribution: 'Concept, production, cinematography & editing',
    credits: 'Concept, production, cinematography and editing: Raden Hanifa. In collaboration with Cadillac Alghanim Kuwait.',
    poster: '/media/cadillac-escalade-v3-poster.webp', preview: '/media/cadillac-escalade-v2-preview.mp4',
    film: '/media/cadillac-escalade-v2-film.mp4', duration: '00:14', aspect: 'portrait', placeholder: false,
  },
  {
    id: 'cadillac-second', title: 'Cadillac Escalade — Walkthrough', category: 'Reels',
    description: 'A sales-led introduction to the then-new Cadillac Escalade.', cardLabel: 'Walkthrough reel', contribution: 'Concept, production, cinematography & editing',
    credits: 'Concept, production, cinematography and editing: Raden Hanifa. In collaboration with Cadillac Alghanim Kuwait.',
    poster: '/media/cadillac-poster.webp', preview: '/media/cadillac-preview.mp4',
    film: '/media/cadillac-film.mp4', duration: '01:41', aspect: 'portrait', placeholder: false,
  },
  {
    id: 'students', title: 'Get to Know Our Students', category: 'Films',
    description: 'OxfordSaudia — Student interview', cardLabel: 'Student interview',
    contribution: 'Script, direction, cinematography, edit & audio',
    projectHref: '/work/oxfordsaudia-interviews',
    poster: '/media/students-poster.webp', preview: '/media/students-preview.mp4', film: '/media/students-film.mp4', duration: '01:19', aspect: 'landscape', placeholder: false,
  },
  {
    id: 'captains', title: 'Meet Our Captains', category: 'Films',
    description: 'OxfordSaudia — Captain interview', cardLabel: 'Captain interview',
    contribution: 'Script, direction, cinematography, edit & audio',
    projectHref: '/work/oxfordsaudia-interviews',
    poster: '/media/captains-poster.webp', preview: '/media/captains-preview.mp4', film: '/media/captains-film.mp4', duration: '02:01', aspect: 'landscape', placeholder: false,
  },
  {
    id: 'hazardous', title: '5 Hazardous Attitudes', category: 'Reels',
    description: 'OxfordSaudia — Aviation Explained', cardLabel: 'Aviation education',
    contribution: 'Script, direction, filming, edit & audio finishing',
    projectHref: '/work/oxfordsaudia-educational-series',
    poster: '/media/hazardous-v2-poster.webp', preview: '/media/hazardous-preview.mp4', film: '/media/hazardous-film.mp4', duration: '01:47', aspect: 'portrait', placeholder: false,
  },
  { id: 'students-intro', title: 'Get to Know Our Students \u2014 Title Intro', category: 'Motion', description: 'Animated series title', contribution: 'Motion graphics', cardLabel: 'Title sequence', poster: '/media/students-intro-poster.webp', preview: '/media/students-intro-v2-preview.mp4', film: '/media/students-intro-v2-film.mp4', duration: '00:12', projectHref: '/work/oxfordsaudia-interviews', aspect: 'landscape', placeholder: false },
  { id: 'captains-intro', title: 'Meet Our Captains \u2014 Title Intro', category: 'Motion', description: 'Animated series title', contribution: 'Motion graphics', cardLabel: 'Title sequence', poster: '/media/captains-intro-poster.webp', preview: '/media/captains-intro-v2-preview.mp4', film: '/media/captains-intro-v2-film.mp4', duration: '00:08', projectHref: '/work/oxfordsaudia-interviews', aspect: 'landscape', placeholder: false },

];

export const categories = ['All work', 'Reels', 'Films', 'Motion', 'Color grading', 'AI filmmaking'] as const;
export type WorkFilter = typeof categories[number];

export const gradingFilms: Project[] = [
  { id: 'founding-day', immersive: true, title: 'Saudi Founding Day', category: 'Color grading', description: 'Before and after, in motion', contribution: 'Color grading', cardLabel: 'Grading breakdown', poster: '/media/founding-day-poster.webp', preview: '/media/founding-day-preview.mp4', film: '/media/founding-day-film.mp4', duration: '00:12', aspect: 'portrait', placeholder: false },
  { id: 'diriyah', title: 'Diriyah Colors', category: 'Color grading', description: 'A study in color and atmosphere', contribution: 'Color grading', cardLabel: 'Color study', poster: '/media/diriyah-poster.webp', preview: '/media/diriyah-preview.mp4', film: '/media/diriyah-film.mp4', duration: '00:11', aspect: 'landscape', placeholder: false },
];
export const supportingFilms: Project[] = [
  { id: 'archi', title: 'ARCHI \u2014 Food Commercial', category: 'Reels', description: 'From behind the scenes to the finished film', contribution: 'Commercial filmmaking', poster: '/media/archi-poster.webp', film: '/media/archi-film.mp4', duration: '00:20', aspect: 'portrait', placeholder: false },
  { id: 'interview-grade', title: 'Student interview — Grading steps', category: 'Color grading', description: 'The grade, step by step', contribution: 'Color grading', cardLabel: 'Grading breakdown', poster: '/media/interview-grade-poster.webp', preview: '/media/interview-grade-preview.mp4', film: '/media/interview-grade-film.mp4', duration: '00:13', aspect: 'landscape', placeholder: false },
  { id: 'graduation', title: 'OxfordSaudia — Graduation Trailer', category: 'Films', description: 'A graduation film, from airside to the cockpit', contribution: 'Planning, cinematography, editing & color grading', cardLabel: 'Graduation trailer', poster: '/media/graduation-poster.webp', preview: '/media/graduation-preview.mp4', film: '/media/graduation-film.mp4', duration: '01:09', aspect: 'landscape', placeholder: false },
];
export function getProject(id: string): Project {
  const project = [...projects, ...gradingFilms, ...supportingFilms].find(item => item.id === id);
  if (!project) throw new Error(`Unknown portfolio project: ${id}`);
  return project;
}
export const categoryLabel = (category: WorkCategory) => category === 'Films' ? 'YouTube / Long-form' : category;
export const portfolioRequestHref = `mailto:${profile.email}?subject=${encodeURIComponent('Full portfolio request')}`;
