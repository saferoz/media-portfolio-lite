import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr';
import { Navigation } from '@/components/navigation';
import { PortfolioRuntime } from '@/components/portfolio-runtime';
import { GradingGallery } from '@/components/grading';
import { GradingComparison } from '@/components/grading-comparison';
import { profile } from '@/lib/portfolio';

export const metadata: Metadata = {
  title: 'Color grading — Raden Hanifa',
  description: 'Explore Raden Hanifa’s aviation color work, from the original image to the final grade, with selected stills.',
  openGraph: { title: 'Color grading — Raden Hanifa', description: 'From original to final frame.', images: [{ url: '/media/grading-after.webp', width: 1920, height: 1080 }] },
};

export default function ColorGradingPage() {
  return <PortfolioRuntime>
    <a className="skip-link" href="#comparison">Skip to color comparison</a>
    <Navigation innerPage />
    <main className="grading-page">
      <header className="grading-intro page-width">
        <Link className="grading-back" href="/#work"><ArrowLeftIcon size={17} /> Selected work</Link>
        <h1>Color changes<br /><span>the feeling.</span></h1>
        <p>Color grading by Raden Hanifa. A closer look at the light, skin tones and atmosphere of an aviation film.</p>
      </header>
      <section className="comparison-section page-width" id="comparison" aria-label="Original and final color grade">
        <GradingComparison priority />
      </section>
      <section className="grading-gallery-section page-width" aria-labelledby="stills-heading">
        <div className="grading-gallery-heading"><h2 id="stills-heading">The look, across frames.</h2><p>Twilight on the apron. Warm light in the cockpit.<br />Explore the selected stills and grading stages.</p></div>
        <GradingGallery />
      </section>
      <section className="grading-close page-width">
        <h2>Have a film in mind?</h2>
        <a className="text-link" href={`mailto:${profile.email}`}>Let’s talk <ArrowUpRightIcon size={20} /></a>
        <Link className="grading-back" href="/#work"><ArrowLeftIcon size={17} /> Back to selected work</Link>
      </section>
    </main>
  </PortfolioRuntime>;
}
