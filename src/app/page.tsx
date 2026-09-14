import Image from 'next/image';
import { ArrowUpRightIcon, ArrowUpIcon, InstagramLogoIcon, LinkedinLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { profile, portfolioRequestHref } from '@/lib/portfolio';
import { PortfolioRuntime } from '@/components/portfolio-runtime';
import { Navigation } from '@/components/navigation';
import { Hero } from '@/components/hero';
import { Work } from '@/components/work';

export default function Home() {
  return <PortfolioRuntime>
    <a className="skip-link" href="#work">Skip to selected work</a>
    <Navigation />
    <main>
      <Hero />
      <Work />
      <section className="about-section page-width" id="about" aria-labelledby="about-heading">
        <div className="about-image" data-reveal="image"><Image src={profile.portrait} alt="Raden Hanifa" fill sizes="(max-width: 640px) 85vw, 36vw" /></div>
        <div className="about-copy"><h2 id="about-heading">A cinematic eye.<br /><span>A curious mind.</span></h2><p className="about-intro">{profile.intro}</p><p>{profile.about}</p><div className="tool-list" aria-label="Creative tools">{profile.tools.map(tool => <span key={tool}>{tool}</span>)}</div><a className="text-link" href={profile.cv} target="_blank" rel="noreferrer">The longer story <span>View CV</span><ArrowUpRightIcon size={18} /></a></div>
      </section>
      <section className="contact-section" id="contact" aria-labelledby="contact-heading">
        <div className="page-width contact-inner"><div className="contact-title"><h2 id="contact-heading">Want to<br /><span>see more?</span></h2><ArrowUpRightIcon weight="light" /></div><p className="contact-intro">Request my full portfolio, or tell me about your project or role.</p><a className="grading-project-link" href={portfolioRequestHref}>Request full portfolio <ArrowUpRightIcon size={20} /></a><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRightIcon size={19} /></a><div className="contact-socials"><a className="contact-instagram" href={profile.instagram} target="_blank" rel="noreferrer" aria-label="Instagram: @radenhanifa"><InstagramLogoIcon size={20} />@radenhanifa<ArrowUpRightIcon size={17} /></a><a className="contact-instagram" href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn: Raden Hanifa"><LinkedinLogoIcon size={20} />LinkedIn<ArrowUpRightIcon size={17} /></a></div></div>
      </section>
    </main>
    <footer className="site-footer page-width"><a className="wordmark" href="#top">raden<span className="wordmark-dot">.</span><span className="wordmark-surname">hanifa</span></a><p>© {new Date().getFullYear()} Raden Hanifa</p><a className="back-top" href="#top">Back to top <ArrowUpIcon size={15} /></a></footer>
  </PortfolioRuntime>;
}
