/* ============================================================
   ShreyFPV Productions — shared behaviour (index + equipment)
   Vanilla JS, no dependencies. Loaded with `defer`.
   Every feature is guarded so the file runs safely on any page.
   ============================================================ */
(function () {
  'use strict';

  const $  = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const supportsIO = 'IntersectionObserver' in window;

  /* ── Hamburger / mobile menu ─────────────────────────────── */
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobile-menu');

  function setBars(open) {
    if (!hamburger) return;
    hamburger.classList.toggle('is-open', open); // CSS drives the spring morph
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
      setBars(open);
    });
    $$('a', mobileMenu).forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        setBars(false);
      });
    });
    // Close on Escape for keyboard users
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        setBars(false);
      }
    });
  }

  /* ── Navbar shadow on scroll ─────────────────────────────── */
  const navbar = $('#navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.boxShadow = window.scrollY > 30 ? '0 4px 30px rgba(0,0,0,0.6)' : 'none';
    }, { passive: true });
  }

  /* ── Active nav link (scroll spy) ────────────────────────── */
  const sections = $$('section[id]');
  const navLinks = $$('a.nav-link');
  if (sections.length && navLinks.length && supportsIO) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) =>
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`)
        );
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((sec) => spy.observe(sec));
  }

  /* ── Scroll reveal ───────────────────────────────────────── */
  const revealEls = $$('.reveal');
  if (revealEls.length) {
    if (supportsIO) {
      const revealObs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          entry.target.style.transitionDelay = `${i * 0.06}s`;
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        });
      }, { threshold: 0.12 });
      revealEls.forEach((el) => revealObs.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('visible'));
    }
  }

  /* ── Toast helper ────────────────────────────────────────── */
  function toast(message, ok) {
    const el = document.createElement('div');
    el.setAttribute('role', 'status');
    el.textContent = message;
    el.style.cssText =
      'position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);' +
      (ok ? 'background:linear-gradient(135deg,#0072ff,#00c6ff);' : 'background:#7f1d1d;') +
      'color:#fff;padding:12px 28px;border-radius:40px;font-size:0.875rem;font-weight:600;' +
      'box-shadow:0 8px 32px rgba(0,198,255,0.35);z-index:9999;opacity:0;' +
      'transition:opacity .4s ease,transform .4s ease;pointer-events:none;max-width:90vw;text-align:center;';
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => el.remove(), 400);
    }, 3600);
  }

  /* ── Contact form → Web3Forms (no backend needed) ────────── */
  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const key = form.dataset.accessKey;
      const data = Object.fromEntries(new FormData(form).entries());

      if (!data.name || !data.email) {
        toast('Please add your name and email.', false);
        return;
      }
      // If the access key hasn't been configured yet, fail gracefully.
      if (!key || key.indexOf('YOUR_') === 0) {
        toast('Form not configured yet — email hello@shreyfpvproductions.com', false);
        return;
      }

      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Sending…';
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: key,
            subject: 'New enquiry — ShreyFPV Productions',
            from_name: 'ShreyFPV website',
            ...data
          })
        });
        const json = await res.json();
        if (json.success) {
          form.reset();
          toast("✓ Message sent! We'll be in touch soon.", true);
        } else {
          throw new Error(json.message || 'Request failed');
        }
      } catch (err) {
        toast('Something went wrong. Email hello@shreyfpvproductions.com', false);
      } finally {
        btn.disabled = false;
        btn.innerHTML = original;
      }
    });
  }

  /* ── Portfolio thumbnails: hover-to-play (desktop) / tap (mobile) ── */
  $$('.thumb-wrap').forEach((card) => {
    const video   = card.querySelector('video');
    const img     = card.querySelector('img');
    const overlay = card.querySelector('.thumb-overlay');
    if (!video) return;

    const reset = () => {
      video.pause();
      video.currentTime = 0;
      video.removeAttribute('controls');
      video.style.opacity = '0';
      if (img) img.style.opacity = '1';
      if (overlay) overlay.style.opacity = '1';
      video.loop = true;
    };

    // Desktop: hover to preview
    card.addEventListener('mouseenter', () => {
      if (window.innerWidth >= 768) { video.loop = true; video.play().catch(() => {}); }
    });
    card.addEventListener('mouseleave', () => {
      if (window.innerWidth >= 768) { video.pause(); video.currentTime = 0; }
    });

    // Mobile: tap to play once, tap again to stop
    card.addEventListener('click', () => {
      if (window.innerWidth >= 768) return;
      if (!video.paused) { reset(); return; }
      video.loop = false;
      video.style.opacity = '1';
      if (img) img.style.opacity = '0';
      if (overlay) overlay.style.opacity = '0';
      video.setAttribute('controls', 'true');
      video.currentTime = 0;
      video.play().catch(() => {});
      video.onended = reset;
    });
  });

  /* ── Sliders (testimonials / featured reels): arrows + dots + snap ── */
  $$('[data-slider]').forEach((root) => {
    const track    = $('[data-slider-track]', root);
    const controls = $('[data-slider-controls]', root);
    if (!track) return;
    const items = $$('.slider-item', track);
    if (!items.length) return;
    const prev = $('[data-slider-prev]', root);
    const next = $('[data-slider-next]', root);
    const dotsWrap = $('[data-slider-dots]', root);
    let dots = [];

    const base = () => items[0].offsetLeft;
    const overflowing = () => track.scrollWidth > track.clientWidth + 8;
    const activeIndex = () => {
      let best = 0, dist = Infinity;
      items.forEach((it, i) => {
        const d = Math.abs((it.offsetLeft - base()) - track.scrollLeft);
        if (d < dist) { dist = d; best = i; }
      });
      return best;
    };
    const atEnd = () => track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    const goTo = (i) => {
      const it = items[Math.max(0, Math.min(i, items.length - 1))];
      track.scrollTo({ left: it.offsetLeft - base(), behavior: 'smooth' });
    };

    if (dotsWrap) {
      dots = items.map((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'slider-dot';
        b.setAttribute('aria-label', `Go to slide ${i + 1}`);
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
        return b;
      });
    }

    const update = () => {
      if (controls) controls.style.display = overflowing() ? '' : 'none';
      const a = activeIndex();
      dots.forEach((d, i) => d.classList.toggle('active', i === a));
      if (prev) prev.disabled = a === 0;
      if (next) next.disabled = atEnd();
    };

    prev && prev.addEventListener('click', () => goTo(activeIndex() - 1));
    next && next.addEventListener('click', () => goTo(activeIndex() + 1));
    track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ── Blog: search + category filtering ── */
  const blogGrid = $('#blog-grid');
  if (blogGrid) {
    const cards  = $$('.post-card[data-category]'); // includes the featured card
    const chips  = $$('.blog-chip');
    const search = $('#blog-search');
    const empty  = $('#blog-empty');
    let category = 'all';
    const apply = () => {
      const q = (search && search.value || '').toLowerCase().trim();
      let visible = 0;
      cards.forEach((card) => {
        const okCat = category === 'all' || card.dataset.category === category;
        const okQ = !q || card.textContent.toLowerCase().includes(q);
        const show = okCat && okQ;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (empty) empty.classList.toggle('hidden', visible > 0);
    };
    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      category = chip.dataset.category;
      apply();
    }));
    search && search.addEventListener('input', apply);
  }
})();
