'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { categories, projects, gradingFilms, getProject, categoryLabel, type WorkFilter } from '@/lib/portfolio';
import { usePortfolio } from './portfolio-runtime';
import { GradingComparison } from './grading-comparison';
import { ProjectCard } from './project-card';

export function Work() {
  const [filter, setFilter] = useState<WorkFilter>('All work');
  const { setPreview } = usePortfolio();
  const filtered = projects.filter(project => project.category === filter);
  const grading = <section className="grading-section" aria-labelledby="grading-heading">
    <div className="grading-heading"><h3 id="grading-heading">Color grading.</h3><p>From the original image to a different feeling.</p></div>
    <GradingComparison />
    <div className="grading-film-grid">{[gradingFilms[0], getProject('interview-grade')].map(project => <ProjectCard key={project.id} project={project} />)}</div>
    <Link className="grading-project-link" href="/color-grading">View color grading <ArrowUpRightIcon size={20} /></Link>
  </section>;
  return <section id="work" className="work-section page-width" aria-labelledby="work-heading">
    <div className="section-heading" data-reveal><h2 id="work-heading">Selected <span>work.</span></h2><p>Different formats.<br />The same eye for detail.</p></div>
    <div className="work-toolbar"><div className="work-filters" role="group" aria-label="Filter work by editing category">
      {categories.map(category => <button key={category} aria-pressed={filter === category} onClick={() => { setPreview(null); setFilter(category); }}>{category === 'All work' ? category : categoryLabel(category)}</button>)}
    </div></div>
    <div className={`work-grid ${filter !== 'All work' ? 'is-filtered' : ''}`}>
      {filter === 'All work' ? <>
        <div className="reels-pair">{projects.filter(project => project.id.startsWith('eltacoria') || project.id.startsWith('jury')).map(project => <ProjectCard key={project.id} project={project} />)}</div>
        <div className="cadillac-feature"><ProjectCard project={getProject('cadillac')} /></div>
        <section className="work-collection"><h3 className="collection-title">YouTube / Long-form</h3><div className="film-pair">{projects.filter(project => project.category === 'Films').map(project => <ProjectCard key={project.id} project={project} />)}</div></section>
        <section className="education-feature work-collection"><ProjectCard project={projects.find(p => p.id === 'hazardous')!} /><div className="education-feature-copy"><h3>Aviation,<br /><span>explained.</span></h3><p>Educational short films. From the first script to the final sound mix.</p><Link className="text-link" href="/work/oxfordsaudia-educational-series">Behind the series <ArrowUpRightIcon size={18} /></Link></div></section>
        <section className="work-collection"><h3 className="collection-title">AI filmmaking</h3><div className="ai-pair">{projects.filter(project => project.category === 'AI filmmaking').map(project => <ProjectCard key={project.id} project={project} />)}</div></section>
        <section className="work-collection"><h3 className="collection-title">Motion graphics</h3><div className="film-pair">{projects.filter(project => project.category === 'Motion').map(project => <ProjectCard key={project.id} project={project} />)}</div></section>
        {grading}
      </> : filter === 'Color grading' ? grading : filtered.map(project => <ProjectCard key={project.id} project={project} />)}
    </div>
    <p className="work-footnote">More films and breakdowns are on the way.</p>
  </section>;
}
