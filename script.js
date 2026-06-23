/* ═══════════════════════════════════════════════════════════════
   MAHA FASSENNI — script.js
   Handles: Loader · Cursor · Header · Mobile Nav · Video ·
            Scroll Reveal · Testimonials · Contact Form
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─── DOM references ─────────────────────────────────────────────── */
const loader        = document.getElementById('loader');
const loaderFill    = document.getElementById('loader-fill');
const pageShell     = document.querySelector('.page-shell');
const topbar        = document.getElementById('topbar');
const navToggle     = document.getElementById('nav-toggle');
const mobileOverlay = document.getElementById('mobile-overlay');
const cursor        = document.getElementById('cursor');
const cursorTrail   = document.getElementById('cursor-trail');
const contactForm   = document.getElementById('contact-form');
const submitBtn     = document.getElementById('submit-btn');
const formSuccess   = document.getElementById('form-success');

/* ─── 1. Loader ──────────────────────────────────────────────────── */
(function initLoader() {
  // Animate the loader bar to 100% then reveal the page
  requestAnimationFrame(() => {
    loaderFill.style.width = '100%';
  });

  const revealPage = () => {
    loader.classList.add('hidden');
    pageShell.classList.add('visible');
    document.body.style.overflow = '';
  };

  // Hide loader after transition completes (1.4s bar + 0.3s buffer)
  setTimeout(revealPage, 1600);

  // Prevent scroll while loading
  document.body.style.overflow = 'hidden';
})();

/* ─── 2. Custom Cursor ───────────────────────────────────────────── */
(function initCursor() {
  if (!cursor || !cursorTrail) return;
  // Skip on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Lag the trail for a smooth follow effect
  const animateTrail = () => {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top  = trailY + 'px';
    requestAnimationFrame(animateTrail);
  };
  animateTrail();

  // Expand cursor on interactive elements
  const interactives = document.querySelectorAll('a, button, .video-block, .gallery-item, .service-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursorTrail.style.width  = '64px';
      cursorTrail.style.height = '64px';
    });
    el.addEventListener('mouseleave', () => {
      cursorTrail.style.width  = '36px';
      cursorTrail.style.height = '36px';
    });
  });
})();

/* ─── 3. Sticky Header ───────────────────────────────────────────── */
(function initHeader() {
  if (!topbar) return;

  const onScroll = () => {
    topbar.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
})();

/* ─── 4. Mobile Navigation ───────────────────────────────────────── */
(function initMobileNav() {
  if (!navToggle || !mobileOverlay) return;

  const openNav = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeNav = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });

  // Close on any mobile nav link click
  mobileOverlay.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
})();

/* ─── 5. Scroll Reveal ───────────────────────────────────────────── */
(function initReveal() {
  const sections = document.querySelectorAll('.reveal-section');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(section => observer.observe(section));
})();

/* ─── 6. Video Blocks (play / pause on click) ────────────────────── */
(function initVideos() {
  const videoBlocks = document.querySelectorAll('.video-block');

  videoBlocks.forEach(block => {
    const video   = block.querySelector('.video-frame');
    const playBtn = block.querySelector('.video-play-btn');
    if (!video || !playBtn) return;

    const togglePlay = () => {
      if (video.paused) {
        video.play();
        block.classList.add('playing');
      } else {
        video.pause();
        block.classList.remove('playing');
      }
    };

    playBtn.addEventListener('click', togglePlay);
    block.querySelector('.video-overlay').addEventListener('click', togglePlay);

    // Re-show play button when video ends or pauses
    video.addEventListener('pause', () => block.classList.remove('playing'));
    video.addEventListener('ended', () => block.classList.remove('playing'));
  });
})();

/* ─── 7. Testimonial Slider ──────────────────────────────────────── */
(function initTestimonials() {
  const track   = document.getElementById('testimonials-track');
  const dotsEl  = document.getElementById('t-dots');
  const prevBtn = document.getElementById('t-prev');
  const nextBtn = document.getElementById('t-next');
  if (!track || !dotsEl) return;

  const cards = Array.from(track.querySelectorAll('.testimonial-card'));
  const dots  = Array.from(dotsEl.querySelectorAll('.t-dot'));
  const total = cards.length;
  let current = 0;
  let autoTimer;

  const goTo = (index) => {
    // Clamp and wrap
    current = ((index % total) + total) % total;

    // On mobile (single column), slide via transform
    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
      track.style.transform = `translateX(-${current * 100}%)`;
      track.style.gridTemplateColumns = `repeat(${total}, 100%)`;
    } else {
      // On desktop show all three; highlight active with gold border
      track.style.transform = '';
      track.style.gridTemplateColumns = '';
      cards.forEach((card, i) => {
        card.style.borderColor = i === current
          ? 'rgba(201, 168, 76, 0.5)'
          : '';
      });
    }

    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  };

  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  };

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      goTo(delta > 0 ? current + 1 : current - 1);
      startAuto();
    }
  });

  // Init
  goTo(0);
  startAuto();

  // Re-initialise on resize
  window.addEventListener('resize', () => goTo(current), { passive: true });
})();

/* ─── 8. Contact Form ────────────────────────────────────────────── */
(function initContactForm() {
  if (!contactForm || !submitBtn || !formSuccess) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const action   = contactForm.getAttribute('action');

    // Don't submit to default Formspree placeholder
    if (action.includes('your-form-id')) {
      // Simulate success for demo purposes
      submitBtn.classList.add('loading');
      setTimeout(() => {
        submitBtn.classList.remove('loading');
        formSuccess.classList.add('visible');
        contactForm.reset();
      }, 1400);
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      const res = await fetch(action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        formSuccess.classList.add('visible');
        contactForm.reset();
      } else {
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch {
      alert('Problème de connexion. Veuillez réessayer plus tard.');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
})();

/* ─── 9. Smooth Anchor Scroll (offset for fixed header) ─────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const offset = topbar ? topbar.offsetHeight + 16 : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ─── 10. Active nav link on scroll ─────────────────────────────── */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ─── 11. Parallax tilt on service cards (desktop only) ─────────── */
(function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('.service-card, .testimonial-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect  = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
      card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${-y}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();