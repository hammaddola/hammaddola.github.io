// Portfolio interactions: theme, reveal-on-scroll, counters, tilt, magnetic
// buttons, card spotlight, scroll progress, aurora background.
// Everything degrades gracefully and honours prefers-reduced-motion.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  // ── Reveal on scroll, staggered within each section ─────────────────────
  const reveals = [...document.querySelectorAll('.reveal')];
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

  // ── Count-up numbers ────────────────────────────────────────────────────
  const counters = document.querySelectorAll('[data-count]');
  const runCount = (el) => {
    const target = +el.dataset.count;
    if (reduce) { el.textContent = target; return; }
    const start = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); }
    }), { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  } else counters.forEach(runCount);

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

    // Magnetic buttons
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });

    // 3D tilt for the service cards
    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

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

})();
