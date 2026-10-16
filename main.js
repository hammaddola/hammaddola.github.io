// Portfolio interactions: theme, reveal-on-scroll, counters, tilt, magnetic
// buttons, card spotlight, scroll progress, aurora background.
// Everything degrades gracefully and honours prefers-reduced-motion.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;

  // ── Theme (remembered per visitor; storage can be unavailable) ──────────
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };
  const saved = store.get('theme');
  if (saved) root.dataset.theme = saved;
  else if (matchMedia('(prefers-color-scheme: light)').matches) root.dataset.theme = 'light';
  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    store.set('theme', next);
  });

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

  // ── Aurora background (canvas, paused when the tab is hidden) ───────────
  const canvas = document.getElementById('aurora');
  if (!canvas || reduce) return;
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  const blobs = [
    { x: 0.15, y: 0.15, r: 0.55, c: [79, 209, 193], a: 0.16, s: 0.00011 },
    { x: 0.85, y: 0.25, r: 0.5, c: [29, 111, 216], a: 0.16, s: 0.00008 },
    { x: 0.6, y: 0.85, r: 0.6, c: [91, 71, 176], a: 0.11, s: 0.00006 },
  ];
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
  };
  resize();
  addEventListener('resize', resize);
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(draw);
  });
  function draw(t) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    const light = root.dataset.theme === 'light';
    for (const b of blobs) {
      const x = (b.x + Math.sin(t * b.s * 6.3) * 0.08) * w;
      const y = (b.y + Math.cos(t * b.s * 5.1) * 0.08) * h;
      const r = b.r * Math.max(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const a = light ? b.a * 0.6 : b.a;
      g.addColorStop(0, `rgba(${b.c.join(',')},${a})`);
      g.addColorStop(1, `rgba(${b.c.join(',')},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
