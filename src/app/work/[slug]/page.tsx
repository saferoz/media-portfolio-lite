import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr';
import { Navigation } from '@/components/navigation';
import { PortfolioRuntime } from '@/components/portfolio-runtime';
import { ProjectCard } from '@/components/project-card';
import { GradingGallery } from '@/components/grading';
import { getProject, portfolioRequestHref } from '@/lib/portfolio';

const slugs = ['oxfordsaudia-interviews', 'oxfordsaudia-educational-series'];
export function generateStaticParams() { return slugs.map(slug => ({ slug })); }
export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const education = slug === slugs[1];
  const title = education ? 'OxfordSaudia — Aviation Explained' : 'OxfordSaudia — The interview series';
  const description = education ? 'Educational short films: scripting, directing, filming, editing and audio finishing by Raden Hanifa.' : 'Student and captain interviews: from scripting and cinematography to the final edit and dialogue polish.';
  return { title, description, openGraph: { title, description, images: [{ url: education ? '/media/hazardous-v2-poster.webp' : '/media/students-poster.webp' }] } };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slugs.includes(slug)) notFound();
  const education = slug === slugs[1];
  return <PortfolioRuntime>
    <a className="skip-link" href="#project-films">Skip to films</a><Navigation innerPage />
    <main className="project-page">
      <header className="grading-intro page-width">
        <Link className="grading-back" href="/#work"><ArrowLeftIcon size={17} /> Selected work</Link>
        <h1>OxfordSaudia.<br /><span>{education ? 'Aviation explained.' : 'Meet the people.'}</span></h1>
        <p>{education ? 'Educational short-film series. Making aviation concepts clear through scripting, cinematic scenes and a considered edit.' : 'The interview series. Students and captains, sharing their stories in their own words.'}</p>
      </header>
      <section className={`project-films page-width ${education ? 'education-project-film' : 'film-pair'}`} id="project-films" aria-label={education ? 'Featured episode' : 'YouTube / Long-form interviews'}>
        {(education ? ['hazardous'] : ['students', 'captains']).map(id => <ProjectCard key={id} project={{ ...getProject(id), projectHref: undefined }} />)}
        {education && <div className="project-film-intro"><h2>5 Hazardous Attitudes</h2><p>The featured episode from the educational series.</p><p>Script, direction, filming, editing and audio finishing by Raden Hanifa.</p></div>}
      </section>
      <section className="production-story page-width" aria-labelledby="production-heading">
        <div className="story-heading"><h2 id="production-heading">From the first idea<br /><span>to the final frame.</span></h2><p>{education ? 'My work on the series connects preparation on the page with direction on set and the finishing details in post.' : 'I handled the script, direction, shooting and edit for both episodes, including the motion-graphics titles and dialogue polishing.'}</p></div>
        <div className="process-columns">
          <div><h3>Before the shoot</h3><p>{education ? 'Researching the topics, writing the scripts and planning the filming with students and crew.' : 'Developing the script and interview structure, then planning the shots and visual presentation.'}</p></div>
          <div><h3>On set</h3><p>{education ? 'Directing the scenes, arranging the set and filming in classroom and simulator environments.' : 'Directing and filming the conversations, with attention to framing, lighting and recorded dialogue.'}</p></div>
          <div><h3>In the edit</h3><p>{education ? 'Shaping the lesson through the edit, then polishing and engineering the voice audio through to the finished film.' : 'Building the story and pacing, creating motion-graphics titles, and polishing the voice audio for the finished episodes.'}</p></div>
        </div>
      </section>
      <section className="project-bts page-width" aria-labelledby="bts-heading">
        <div className="grading-gallery-heading"><h2 id="bts-heading">{education ? 'Behind the series.' : 'On set with the students.'}</h2><p>{education ? 'The planning document, lighting and audio setup, and simulator filming from the educational series.' : 'Behind the scenes of Get to Know Our Students.'}</p></div>
        <GradingGallery compact label={education ? 'Educational series behind the scenes' : 'Student interview behind the scenes'} items={education ? [
          { src: '/media/education-simulator.webp', title: 'Directing in the simulator', description: 'The simulator set during production of the educational series.' },
          { src: '/media/education-lighting.webp', title: 'Light, camera and sound', description: 'The lighting, camera and audio setup for the educational series.' },
          { src: '/media/education-filming.webp', title: 'Filming the scene', description: 'A behind-the-scenes view of the simulator filming setup.' },
          { src: '/media/education-planning.webp', title: 'Planning the series', description: 'The original educational-series planning document: audience, purpose, formats and proposed topics.' },
        ] : [{ src: '/media/students-bts.webp', title: 'The student interview set', description: 'A group photograph from the filming of Get to Know Our Students.' }]} />
        {!education && <Link className="grading-project-link" href="/color-grading#student-interview">Explore the interview grade <ArrowUpRightIcon size={19} /></Link>}
      </section>
      <section className="grading-close page-width"><h2>Want to see more?</h2><a className="text-link" href={portfolioRequestHref}>Request full portfolio <ArrowUpRightIcon size={20} /></a><Link className="grading-back" href="/#work"><ArrowLeftIcon size={17} /> Back to selected work</Link></section>
    </main>
  </PortfolioRuntime>;
}
