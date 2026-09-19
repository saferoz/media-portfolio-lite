'use client';

import { PortfolioLink as Link } from './portfolio-link';
import { StudioLight } from './studio-light';
import { useRef, useState } from 'react';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { categories, projects, gradingFilms, getProject, categoryLabel, type WorkFilter } from '@/lib/portfolio';
import { usePortfolio } from './portfolio-runtime';
import { GradingComparison } from './grading-comparison';
import { ProjectCard } from './project-card';

export function Work() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<WorkFilter>('All work');
  const { setPreview, reducedMotion, settleScroll } = usePortfolio();
  const filtered = projects.filter(project => project.category === filter);
  const grading = <section className="grading-section" aria-labelledby="grading-heading">
    <div className="grading-heading"><h3 id="grading-heading">Color grading.</h3><p>Compare the camera image with the finished grade.</p></div>
    <GradingComparison />
    <div className="interview-comparison"><div className="grading-heading"><h3>Skin tones, in balance.</h3><p>A frame from Get to Know Our Students.</p></div><GradingComparison before="/media/interview-before.webp" after="/media/interview-after.webp" subject="the OxfordSaudia student interview" label="Reveal original student interview image" /></div>
    <div className="grading-film-grid">{[gradingFilms[0], getProject('interview-grade')].map(project => <ProjectCard key={project.id} project={project} />)}</div>
    <Link className="grading-project-link" href="/color-grading#grading-intro">View color grading <ArrowUpRightIcon size={20} /></Link>
  </section>;
  return <section id="work" className="work-section page-width" aria-labelledby="work-heading">
    <StudioLight />
    <div className="section-heading" data-reveal><h2 id="work-heading">Selected <span>work.</span></h2><p>Commercial reels, interviews,<br />and work made with AI.</p></div>
    <div className="work-toolbar"><div className="work-filters" role="group" aria-label="Filter work by editing category">
      {categories.map(category => <button key={category} aria-pressed={filter === category} onClick={event => { settleScroll(); setPreview(null); setFilter(category); if (!reducedMotion && event.detail !== 0) requestAnimationFrame(() => { const grid = gridRef.current; if (!grid) return; grid.getAnimations().forEach(a => a.cancel()); grid.animate([{ opacity: .85 }, { opacity: 1 }], { duration: 220, easing: 'cubic-bezier(.23,1,.32,1)' }); }); }}>{category === 'All work' ? category : categoryLabel(category)}</button>)}
    </div></div>
    <div ref={gridRef} className={`work-grid ${filter !== 'All work' ? 'is-filtered' : ''}`}>
      {filter === 'All work' ? <>
        <div className="reels-pair">{projects.filter(project => project.id.startsWith('eltacoria') || project.id.startsWith('jury')).map(project => <ProjectCard key={project.id} project={project} />)}</div>
        <div className="reels-pair cadillac-feature">{[getProject('cadillac'), getProject('cadillac-second')].map(project => <ProjectCard key={project.id} project={project} />)}</div>
        <section className="work-collection"><h3 className="collection-title" data-reveal="chapter">YouTube / Long-form</h3><div className="film-pair">{projects.filter(project => project.category === 'Films').map(project => <ProjectCard key={project.id} project={project} />)}</div></section>
        <section className="education-feature work-collection"><ProjectCard project={projects.find(p => p.id === 'hazardous')!} /><div className="education-feature-copy"><h3>Aviation,<br /><span>explained.</span></h3><p>Short lessons for student pilots. Scripted, filmed and edited for OxfordSaudia.</p><Link className="text-link" href="/work/oxfordsaudia-educational-series">Behind the series <ArrowUpRightIcon size={18} /></Link></div></section>
        <section className="work-collection"><h3 className="collection-title" data-reveal="chapter">AI filmmaking</h3><div className="ai-pair">{projects.filter(project => project.category === 'AI filmmaking').map(project => <ProjectCard key={project.id} project={project} />)}</div></section>
        <section className="work-collection"><h3 className="collection-title" data-reveal="chapter">Motion graphics</h3><div className="film-pair">{projects.filter(project => project.category === 'Motion').map(project => <ProjectCard key={project.id} project={project} />)}</div></section>
        {grading}
      </> : filter === 'Color grading' ? grading : filtered.map(project => <ProjectCard key={project.id} project={project} />)}
    </div>
    <p className="work-footnote">Looking for a particular kind of work? Get in touch for more examples.</p>
  </section>;
}
