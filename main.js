// Portfolio interactions: mobile menu, reveal-on-scroll, hero phone tilt,
// card spotlight and scroll progress.
// Everything degrades gracefully and honours prefers-reduced-motion.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  // GSAP (motion.js) drives reveals when it loaded and motion is
  // allowed; this file keeps a lightweight fallback for everything else.
  const gsapOn = !!(window.gsap && window.ScrollTrigger) && !reduce;
  if (gsapOn) root.classList.add('gsap');

  // ── Reveal on scroll, staggered within each section ─────────────────────
  const reveals = gsapOn ? [] : [...document.querySelectorAll('.reveal')];
  reveals.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
  });
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  // ── Mobile menu ─────────────────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.menu-toggle');
  const setMenu = (open) => {
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle?.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
  nav.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // ── Scroll progress + active nav link ───────────────────────────────────
  const bar = document.querySelector('.progress');
  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  const onScroll = () => {
    const h = document.documentElement;
    bar.style.transform = `scaleX(${h.scrollTop / (h.scrollHeight - h.clientHeight || 1)})`;
    let current = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = i; });
    links.forEach((a, i) => a.classList.toggle('active', i === current));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Pointer effects (desktop only, motion allowed) ──────────────────────
  if (fine && !reduce) {
    // 3D tilt of the hero phone
    const phone = document.querySelector('.tilt');
    const visual = document.querySelector('.hero-visual');
    visual?.addEventListener('pointermove', (e) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 14}deg) translateZ(10px)`;
    });
    visual?.addEventListener('pointerleave', () => { phone.style.transform = ''; });

    // Spotlight that follows the cursor across cards
    document.querySelectorAll('.spotlight').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  // ── Copy email ──────────────────────────────────────────────────────────
  document.querySelector('.copy-email')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget, label = btn.querySelector('span');
    try {
      await navigator.clipboard.writeText(btn.dataset.email);
      label.textContent = 'Copied!';
    } catch {
      label.textContent = btn.dataset.email;
    }
    btn.classList.add('copied');
    setTimeout(() => { label.textContent = 'Copy email'; btn.classList.remove('copied'); }, 2200);
  });

  // ── Project-plan form: composes a WhatsApp or email message ─────────────
  // No backend: answers go straight into the visitor's own WhatsApp/email.
  const plan = document.getElementById('plan');
  plan?.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(plan);
    const msg = [
      "Hi Hammad, I'd like a fixed-price project plan.",
      `What I want to build: ${f.get('idea').trim()}`,
      `Target launch: ${f.get('when') || 'Not sure yet'}`,
      `Budget: ${f.get('budget') || 'Not sure yet'}`,
    ].join('\n');
    if (e.submitter?.dataset.via === 'email') {
      location.href = `mailto:buildwithhammad@gmail.com?subject=${encodeURIComponent('Project plan request')}&body=${encodeURIComponent(msg)}`;
    } else {
      window.open(`https://wa.me/923157679143?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    }
  });

})();
