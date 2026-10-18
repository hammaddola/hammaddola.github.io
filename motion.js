// Motion layer: GSAP 3.13 (ScrollTrigger + SplitText).
// Loaded after main.js. If the libraries didn't load, or the visitor prefers
// reduced motion, this file does nothing and main.js's fallback stays in charge.
(() => {
  const { gsap, ScrollTrigger, SplitText } = window;
  if (!gsap || !ScrollTrigger || !document.documentElement.classList.contains('gsap')) return;
  gsap.registerPlugin(ScrollTrigger, ...(SplitText ? [SplitText] : []));

  const mm = gsap.matchMedia();
  mm.add({
    motion: '(prefers-reduced-motion: no-preference)',
    desktop: '(min-width: 1021px)',
  }, (ctx) => {
    const { motion, desktop } = ctx.conditions;
    if (!motion) return;

    // ── Hero: headline words rise in ─────────────────────────────────────
    const hero = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const status = document.querySelector('.hero .status');
    const lines = gsap.utils.toArray('.hero-title .line');
    if (SplitText) {
      const split = new SplitText('.hero-title .split', { type: 'words', mask: 'words' });
      hero.from(split.words, { yPercent: 110, rotationX: -40, opacity: 0, duration: 0.8, stagger: 0.06 }, 0.1);
    } else {
      hero.from(lines, { y: 40, opacity: 0, duration: 0.7, stagger: 0.1 }, 0.1);
    }
    hero
      .from(status, { y: -12, opacity: 0, duration: 0.5 }, 0)
      .from('.hero .lead', { y: 24, opacity: 0, duration: 0.7 }, 0.55)
      .from('.hero .cta-row > *', { y: 20, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.7)
      .from('.hero-meta li', { y: 12, opacity: 0, duration: 0.5, stagger: 0.06 }, 0.85)
      .from('.hero-visual .phone', { y: 80, rotationX: 18, rotationY: -14, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0.3)
      .from('.hero-visual .float-chip', { scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'back.out(2)' }, 0.9);

    // Hero phone drifts with scroll (parallax depth).
    gsap.to('.hero-visual .phone', {
      yPercent: -12, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // ── Section headings: reveal line by line ────────────────────────────
    gsap.utils.toArray('.split-lines').forEach((h) => {
      const targets = SplitText ? new SplitText(h, { type: 'lines', mask: 'lines' }).lines : [h];
      gsap.from(targets, {
        yPercent: 100, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: h, start: 'top 85%' },
      });
    });
    gsap.utils.toArray('.eyebrow, .section-sub, .case-lead, .case-note, .about-copy p:not(.eyebrow)').forEach((el) => {
      gsap.from(el, { y: 18, opacity: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    // ── Cards flip up in 3D, in sequence ─────────────────────────────────
    const cardSets = ['.case-grid', '.trust-grid', '.projects', '.services', '.values', '.contact-grid', '.tags'];
    cardSets.forEach((sel) => {
      const set = document.querySelector(sel);
      if (!set) return;
      gsap.from(set.children, {
        y: 46, rotationX: -22, opacity: 0, transformOrigin: '50% 0%', transformPerspective: 900,
        duration: 0.8, ease: 'power3.out', stagger: 0.09,
        scrollTrigger: { trigger: set, start: 'top 82%' },
      });
    });

    // ── Stats rise in ───────────────────────────────────────────────────
    gsap.from('.stat', { y: 30, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.proof', start: 'top 85%' } });

    // ── Process: the line draws itself as you scroll, steps pop in ───────
    const line = document.querySelector('.process-line');
    if (line) {
      gsap.fromTo(line, { scaleX: desktop ? 0 : 1, scaleY: desktop ? 1 : 0 }, {
        scaleX: 1, scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.process', start: 'top 75%', end: 'bottom 60%', scrub: 0.6 },
      });
    }
    gsap.from('.process > li:not(.process-line)', {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.process', start: 'top 80%' },
    });
    gsap.from('.process .step', {
      scale: 0, duration: 0.6, stagger: 0.12, ease: 'back.out(2.5)',
      scrollTrigger: { trigger: '.process', start: 'top 80%' },
    });

    // ── DermaCare screens slide sideways while you scroll (desktop) ──────
    const pin = document.querySelector('.gallery-pin');
    const track = document.querySelector('.gallery');
    if (desktop && pin && track) {
      track.classList.add('is-pinned');
      const distance = () => Math.max(0, track.scrollWidth - pin.clientWidth);
      gsap.to(track, {
        x: () => -distance(), ease: 'none',
        scrollTrigger: {
          trigger: pin, start: 'center center', end: () => '+=' + distance(),
          pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      gsap.from(track.children, {
        y: 60, opacity: 0, rotationY: -25, transformPerspective: 900, duration: 0.8, stagger: 0.07, ease: 'power3.out',
        scrollTrigger: { trigger: pin, start: 'top 80%' },
      });
    }

    // ── Contact card rises with a soft scale ─────────────────────────────
    gsap.from('.contact-card', {
      y: 60, scale: 0.96, opacity: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.contact', start: 'top 80%' },
    });
  });

  // Images and fonts change layout height; recalc trigger positions after load.
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
