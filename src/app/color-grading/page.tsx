import { pageMetadata } from '@/lib/seo';
import { SeoData } from '@/components/seo-data';
import { PortfolioLink as Link } from '@/components/portfolio-link';
import { StudioLight } from '@/components/studio-light';
import { ArrowLeftIcon, ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr';
import { Navigation } from '@/components/navigation';
import { PortfolioRuntime } from '@/components/portfolio-runtime';
import { GradingGallery } from '@/components/grading';
import { GradingComparison } from '@/components/grading-comparison';
import { gradingFilms, getProject, portfolioRequestHref } from '@/lib/portfolio';
import { ProjectCard } from '@/components/project-card';

export const metadata = pageMetadata('/color-grading');

export default function ColorGradingPage() {
  return <PortfolioRuntime>
    <SeoData path="/color-grading" />
    <a className="skip-link" href="#comparison">Skip to color comparison</a>
    <Navigation innerPage />
    <main className="grading-page">
      <header className="grading-intro page-width" id="grading-intro">
        <StudioLight />
        <Link className="grading-back" href="/#work"><ArrowLeftIcon size={17} /> Selected work</Link>
        <h1>Color grading.<br /><span>Before and after.</span></h1>
        <p>Compare original footage with my finished grades, then watch the breakdowns and full films.</p>
        <nav className="grading-jumps" aria-label="Color grading projects"><a href="#comparison">Graduation trailer</a><a href="#student-interview">Student interview</a><a href="#color-films">Color in motion</a></nav>
      </header>
      <section className="comparison-section page-width" id="comparison" aria-label="Original and final color grade">
        <div className="grading-gallery-heading" data-reveal><h2>Graduation trailer</h2><p>OxfordSaudia — Graduation Trailer. From 8-bit log to the final look.</p></div>
        <GradingComparison priority />
      </section>
      <section className="grading-gallery-section page-width" aria-labelledby="stills-heading">
        <div className="grading-gallery-heading" data-reveal><h2 id="stills-heading">Stills and grading stages</h2><p>Twilight on the apron. Warm light in the cockpit.<br />Explore the selected stills and grading stages.</p></div>
        <GradingGallery />
      </section>
      <section className="graduation-story page-width" aria-labelledby="graduation-heading">
        <div className="grading-gallery-heading" data-reveal><h2 id="graduation-heading">Watch the graduation trailer</h2><p>Planning, cinematography, editing and color grading by Raden Hanifa.</p></div>
        <div className="supporting-film"><ProjectCard project={getProject('graduation')} /></div>
        <details className="bts-disclosure"><summary>Behind the shoot <span>Planning, equipment &amp; camera positions</span></summary><div className="disclosure-content"><p>I planned the camera angles and positions ahead of the shoot, working with the airside-approved Sony A7R IV. Low light and 8-bit footage shaped the approach to the final grade. I also served as a safety pilot on the shoot.</p>
          <GradingGallery compact label="Graduation trailer behind the scenes" items={[
            { src: '/media/graduation-bts.webp', title: 'From the cockpit', description: 'Behind the scenes of the graduation trailer shoot.' },
            { src: '/media/graduation-camera.webp', title: 'A camera position, planned ahead', description: 'The camera and tripod position visible behind Raden in the aircraft cabin.' },
          ]} />
        </div></details>
      </section>
      <section className="grading-chapter page-width" id="student-interview" aria-labelledby="interview-heading">
        <div className="grading-gallery-heading" data-reveal><h2 id="interview-heading">Student interview</h2><p>Get to Know Our Students. Compare the original interview frame with the finished grade.</p></div>
        <GradingComparison before="/media/interview-before.webp" after="/media/interview-after.webp" subject="the OxfordSaudia student interview" label="Reveal original student interview image" />
        <div className="supporting-film"><ProjectCard project={getProject('interview-grade')} /></div>
        <Link className="text-link" href="/work/oxfordsaudia-interviews">View interview project <ArrowUpRightIcon size={18} /></Link>
      </section>
      <section className="grading-chapter page-width" id="color-films" aria-labelledby="color-films-heading"><div className="grading-gallery-heading" data-reveal><h2 id="color-films-heading">Color, in motion.</h2><p>Saudi Founding Day and Diriyah. More examples of my color grading.</p></div><div className="grading-film-grid">{gradingFilms.map(project => <ProjectCard key={project.id} project={project} />)}</div></section>
      <section className="grading-close page-width">
        <h2 data-reveal>Want to see more?</h2>
        <a className="text-link" href={portfolioRequestHref}>Request full portfolio <ArrowUpRightIcon size={20} /></a>
        <Link className="grading-back" href="/#work"><ArrowLeftIcon size={17} /> Back to selected work</Link>
      </section>
    </main>
  </PortfolioRuntime>;
}
