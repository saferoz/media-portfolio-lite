'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon, ArrowUpRightIcon } from '@phosphor-icons/react';

export function Navigation({ innerPage = false }: { innerPage?: boolean }) {
  const [theme, setTheme] = useState('dark');
  const [scrolled, setScrolled] = useState(innerPage);
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme ?? 'dark');
    if (innerPage) return;
    const sentinel = document.querySelector('#nav-sentinel');
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [innerPage]);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch { /* Theme still works without storage. */ }
  }

  return (
    <header className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <a className="wordmark" href={innerPage ? "/#top" : "#top"} aria-label="Raden Hanifa, back to top">raden<span className="wordmark-dot">.</span><span className="wordmark-surname">hanifa</span></a>
      <nav aria-label="Main navigation">
        <a href={innerPage ? "/#work" : "#work"}>Work</a><a href={innerPage ? "/#about" : "#about"}>About</a><a className="nav-contact" href={innerPage ? "/#contact" : "#contact"}>Contact <ArrowUpRightIcon size={14} /></a>
        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          <SunIcon className="theme-sun" size={19} /><MoonIcon className="theme-moon" size={19} />
        </button>
      </nav>
    </header>
  );
}
