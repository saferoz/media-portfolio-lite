import Image from 'next/image';
import { pageMetadata } from '@/lib/seo';
import { SeoData } from '@/components/seo-data';
import { ArrowUpRightIcon, ArrowUpIcon, InstagramLogoIcon, LinkedinLogoIcon } from '@phosphor-icons/react/dist/ssr';
import { profile, portfolioRequestHref } from '@/lib/portfolio';
import { PortfolioRuntime } from '@/components/portfolio-runtime';
import { Navigation } from '@/components/navigation';
import { Hero } from '@/components/hero';
import { Work } from '@/components/work';
import { StudioLight } from '@/components/studio-light';

export const metadata = pageMetadata('/');

export default function Home() {
  return <PortfolioRuntime>
    <SeoData path="/" />
    <a className="skip-link" href="#work">Skip to selected work</a>
    <Navigation />
    <main>
      <Hero />
      <Work />
      <section className="about-section page-width" id="about" aria-labelledby="about-heading">
        <StudioLight side="right" cinematic />
        <div className="about-image" data-reveal="portrait"><Image src={profile.portrait} alt="Raden Hanifa" fill sizes="(max-width: 640px) 85vw, 36vw" /></div>
        <div className="about-copy"><h2 id="about-heading" data-reveal="lines"><span className="reveal-line"><span>A cinematic eye.</span></span><span className="reveal-line"><span>A curious mind.</span></span></h2><p className="about-intro">{profile.intro}</p><p>{profile.about}</p><div className="tool-list" aria-label="Creative tools">{profile.tools.map(tool => <span key={tool}>{tool}</span>)}</div><a className="text-link" href={profile.cv} target="_blank" rel="noreferrer">The longer story <span>View CV</span><ArrowUpRightIcon size={18} /></a></div>
      </section>
      <section className="contact-section" id="contact" aria-labelledby="contact-heading">
        <StudioLight side="right" cinematic />
        <div className="page-width contact-inner"><div className="contact-title"><h2 id="contact-heading" data-reveal="lines"><span className="reveal-line"><span>Want to</span></span><span className="reveal-line"><span>see more?</span></span></h2><span className="contact-arrow" data-reveal><ArrowUpRightIcon weight="light" /></span></div><p className="contact-intro">I have more work to share across filming, cinematography, editing, color grading and AI filmmaking.</p><p className="contact-region">Saudi Arabia, the UAE and the wider GCC.</p><div className="contact-actions"><a className="grading-project-link" href={portfolioRequestHref}>Request full portfolio <ArrowUpRightIcon size={20} /></a></div><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRightIcon size={19} /></a><div className="contact-socials"><a className="contact-instagram" href={profile.instagram} target="_blank" rel="noreferrer" aria-label="Instagram: @radenhanifa"><InstagramLogoIcon size={20} />@radenhanifa<ArrowUpRightIcon size={17} /></a><a className="contact-instagram" href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn: Raden Hanifa"><LinkedinLogoIcon size={20} />LinkedIn<ArrowUpRightIcon size={17} /></a></div></div>
      </section>
    </main>
    <footer className="site-footer page-width"><a className="wordmark" href="#top">raden<span className="wordmark-dot">.</span><span className="wordmark-surname">hanifa</span></a><p>© {new Date().getFullYear()} Raden Hanifa</p><a className="back-top" href="#top">Back to top <ArrowUpIcon size={15} /></a></footer>
  </PortfolioRuntime>;
}
