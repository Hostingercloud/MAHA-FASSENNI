/**
 * ═══════════════════════════════════════════════════════════════
 * MAHA FASSENNI — Portfolio 2026
 * script.js
 * JavaScript: Brendan Eich principles — clean, modular, idiomatic ES2022
 * Security: Bruce Schneier & Mikko Hyppönen — defensive, minimal surface
 * ═══════════════════════════════════════════════════════════════
 *
 * MODULES
 * ────────
 * 01. Constants & State
 * 02. Utility Functions
 * 03. Navigation (scroll-aware header, hamburger menu)
 * 04. Scroll Reveal (IntersectionObserver)
 * 05. Counter Animation (hero stats)
 * 06. Video Controls (play/pause on click)
 * 07. Gallery (drag-to-scroll)
 * 08. Contact Form (validation + submission)
 * 09. Date Input (set min to today)
 * 10. Init
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ─────────────────────────────────────────────
   01. CONSTANTS & STATE
───────────────────────────────────────────── */
const NAV_SCROLL_THRESHOLD = 40; // px before nav gets scrolled style

const state = {
  menuOpen: false,
  countersAnimated: false,
};

/* ─────────────────────────────────────────────
   02. UTILITY FUNCTIONS
───────────────────────────────────────────── */

/**
 * Safe querySelector — returns null without throwing if element missing.
 * @param {string} selector
 * @param {Document|Element} [root=document]
 * @returns {Element|null}
 */
const qs = (selector, root = document) => root.querySelector(selector);

/**
 * Safe querySelectorAll — always returns an array.
 * @param {string} selector
 * @param {Document|Element} [root=document]
 * @returns {Element[]}
 */
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

/**
 * Easing function — ease out quart for counter animation.
 * @param {number} t — progress 0..1
 * @returns {number}
 */
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

/**
 * Sanitize a string for safe text insertion (defense in depth).
 * We use textContent, not innerHTML, everywhere.
 * This is here as documentation of intent.
 * @param {string} str
 * @returns {string}
 */
const sanitizeText = (str) => String(str).trim();

/**
 * Clamp a value between min and max.
 */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* ─────────────────────────────────────────────
   03. NAVIGATION
   ─ Scroll-aware header background
   ─ Hamburger toggle with a11y
   ─ Close menu on link click or outside click
───────────────────────────────────────────── */
const initNavigation = () => {
  const nav       = qs('.nav');
  const hamburger = qs('.nav__hamburger');
  const mobileMenu = qs('.nav__mobile');
  const mobileLinks = qsa('.nav__mobile-link');

  if (!nav) return;

  // ── Scroll-aware header ──────────────────────────
  const handleNavScroll = () => {
    const scrolled = window.scrollY > NAV_SCROLL_THRESHOLD;
    nav.classList.toggle('nav--scrolled', scrolled);
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Run once on load

  // ── Hamburger menu toggle ─────────────────────────
  if (!hamburger || !mobileMenu) return;

  const openMenu = () => {
    state.menuOpen = true;
    nav.classList.add('nav--menu-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Fermer le menu');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    // Focus first link for keyboard users
    const firstLink = qs('.nav__mobile-link', mobileMenu);
    if (firstLink) firstLink.focus();
  };

  const closeMenu = () => {
    state.menuOpen = false;
    nav.classList.remove('nav--menu-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', () => {
    state.menuOpen ? closeMenu() : openMenu();
  });

  // Close on mobile link click
  mobileLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.menuOpen) closeMenu();
  });

  // Trap focus within mobile menu when open (basic implementation)
  mobileMenu.addEventListener('keydown', (e) => {
    if (!state.menuOpen) return;
    if (e.key !== 'Tab') return;

    const focusable = qsa(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      mobileMenu
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
};

/* ─────────────────────────────────────────────
   04. SCROLL REVEAL
   ─ Uses IntersectionObserver for performance.
   ─ Each element with class .reveal animates
     in when it enters the viewport.
───────────────────────────────────────────── */
const initReveal = () => {
  const elements = qsa('.reveal');
  if (!elements.length) return;

  // Respect prefers-reduced-motion at the JS level too
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Once revealed, stop watching
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
};

/* ─────────────────────────────────────────────
   05. COUNTER ANIMATION
   ─ Animates hero stat numbers from 0 to target.
   ─ Triggered once when hero stats enter view.
───────────────────────────────────────────── */
const initCounters = () => {
  const counters = qsa('[data-target]');
  if (!counters.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Show final values immediately
    counters.forEach((el) => {
      el.textContent = sanitizeText(el.dataset.target);
    });
    return;
  }

  /**
   * Animate a single counter element.
   * @param {Element} el
   */
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const duration = 1800; // ms
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const eased = easeOutQuart(progress);
      const current = Math.round(eased * target);
      el.textContent = sanitizeText(current);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  // Observe the stats container — animate once in view
  const statsEl = qs('.hero__stats');
  if (!statsEl) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !state.countersAnimated) {
        state.countersAnimated = true;
        counters.forEach((el) => animateCounter(el));
        observer.disconnect();
      }
    },
    { threshold: 0.5 }
  );

  observer.observe(statsEl);
};

/* ─────────────────────────────────────────────
   06. VIDEO CONTROLS
   ─ Clickable video cards with play/pause toggle.
   ─ Uses the video element's native API.
   ─ No custom video.js or vendor needed.
───────────────────────────────────────────── */
const initVideoControls = () => {
  const videoCards = qsa('.video-card');
  if (!videoCards.length) return;

  videoCards.forEach((card) => {
    const video   = qs('.video-card__video', card);
    const playBtn = qs('.video-card__play-btn', card);

    if (!video || !playBtn) return;

    const togglePlay = async () => {
      try {
        if (video.paused) {
          // Pause all other videos first
          qsa('.video-card__video').forEach((v) => {
            if (v !== video && !v.paused) {
              v.pause();
              // Reset other play buttons
              const otherBtn = v.closest('.video-card')?.querySelector('.video-card__play-btn');
              otherBtn?.classList.remove('is-playing');
            }
          });

          await video.play();
          playBtn.classList.add('is-playing');
          playBtn.setAttribute('aria-label', playBtn.getAttribute('aria-label')?.replace('Lire', 'Pause') ?? 'Pause');
        } else {
          video.pause();
          playBtn.classList.remove('is-playing');
          playBtn.setAttribute('aria-label', playBtn.getAttribute('aria-label')?.replace('Pause', 'Lire') ?? 'Lire la vidéo');
        }
      } catch (err) {
        // Autoplay may be blocked — fail silently, the poster image shows
        console.warn('Video play error:', err.message);
      }
    };

    playBtn.addEventListener('click', togglePlay);

    // When video ends naturally, reset button state
    video.addEventListener('ended', () => {
      playBtn.classList.remove('is-playing');
    });
  });

  // Pause videos when they leave the viewport (performance + UX)
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          const video = qs('.video-card__video', entry.target);
          const playBtn = qs('.video-card__play-btn', entry.target);
          if (video && !video.paused) {
            video.pause();
            playBtn?.classList.remove('is-playing');
          }
        }
      });
    },
    { threshold: 0.2 }
  );

  videoCards.forEach((card) => videoObserver.observe(card));
};

/* ─────────────────────────────────────────────
   07. GALLERY DRAG-TO-SCROLL
   ─ Enables click-drag horizontal scrolling
     on the gallery track for desktop users.
   ─ Touch devices get native scroll for free.
───────────────────────────────────────────── */
const initGalleryDrag = () => {
  const track = qs('.gallery__track-wrap');
  if (!track) return;

  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;

  const onMouseDown = (e) => {
    isDragging = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    track.style.userSelect = 'none';
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const delta = (x - startX) * 1.2; // Multiply for a snappier feel
    track.scrollLeft = scrollLeft - delta;
  };

  const stopDrag = () => {
    isDragging = false;
    track.style.userSelect = '';
  };

  track.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', stopDrag);
};

/* ─────────────────────────────────────────────
   08. CONTACT FORM
   ─ Client-side validation with accessible
     error messages.
   ─ Submits to Formspree via fetch (no page reload).
   ─ Security note: Server-side validation is
     authoritative. Client-side UX only.
   ─ Rate limiting and spam protection are
     handled by Formspree's server.
───────────────────────────────────────────── */
const initContactForm = () => {
  const form    = qs('#contact-form');
  const submitBtn = qs('#submit-btn');
  const successMsg = qs('#form-success');
  const errorMsg  = qs('#form-error-msg');

  if (!form) return;

  // ── Validation rules ──────────────────────────────
  const validators = {
    name: {
      errorId: 'name-error',
      validate: (val) => {
        if (!val.trim()) return 'Veuillez entrer votre nom.';
        if (val.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères.';
        if (val.trim().length > 100) return 'Le nom est trop long.';
        return '';
      },
    },
    email: {
      errorId: 'email-error',
      validate: (val) => {
        if (!val.trim()) return 'Veuillez entrer votre email.';
        // RFC-compliant enough regex for UX; server validates authoritatively
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(val.trim())) return 'Adresse email invalide.';
        if (val.length > 254) return 'Email trop long.';
        return '';
      },
    },
    service: {
      errorId: 'service-error',
      validate: (val) => {
        if (!val) return 'Veuillez sélectionner une prestation.';
        return '';
      },
    },
    message: {
      errorId: 'message-error',
      validate: (val) => {
        if (!val.trim()) return 'Veuillez entrer votre message.';
        if (val.trim().length < 10) return 'Le message doit contenir au moins 10 caractères.';
        if (val.length > 2000) return 'Message trop long (max 2000 caractères).';
        return '';
      },
    },
  };

  /**
   * Show an error message for a specific field.
   * @param {string} errorId
   * @param {string} message
   * @param {Element} inputEl
   */
  const showError = (errorId, message, inputEl) => {
    const errorEl = qs(`#${errorId}`);
    if (errorEl) errorEl.textContent = sanitizeText(message);
    if (inputEl) inputEl.classList.toggle('is-invalid', !!message);
  };

  /**
   * Validate a single field.
   * @param {string} fieldName
   * @returns {boolean} isValid
   */
  const validateField = (fieldName) => {
    const rule = validators[fieldName];
    if (!rule) return true;

    const input = form.elements[fieldName];
    if (!input) return true;

    const error = rule.validate(input.value);
    showError(rule.errorId, error, input);
    return !error;
  };

  /**
   * Validate all fields.
   * @returns {boolean}
   */
  const validateAll = () => {
    return Object.keys(validators).every(validateField);
  };

  // ── Real-time validation on blur ──────────────────
  Object.keys(validators).forEach((fieldName) => {
    const input = form.elements[fieldName];
    if (!input) return;

    input.addEventListener('blur', () => validateField(fieldName));
    input.addEventListener('input', () => {
      // Clear error on user input (optimistic UX)
      const rule = validators[fieldName];
      if (input.classList.contains('is-invalid')) {
        validateField(fieldName);
      }
    });
  });

  // ── Form submission ───────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Re-validate all fields
    if (!validateAll()) {
      // Focus first invalid field for accessibility
      const firstInvalid = qs('.form-input.is-invalid', form);
      firstInvalid?.focus();
      return;
    }

    // Check honeypot — if filled, silently pretend success (anti-spam)
    const honeypot = form.elements['_gotcha'];
    if (honeypot && honeypot.value) {
      // Show fake success to bots
      showFormSuccess();
      return;
    }

    // Update UI state
    setSubmitting(true);

    try {
      const formData = new FormData(form);

      // Security: Don't log formData contents in production
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        showFormSuccess();
        form.reset();
      } else {
        // Formspree returns error details in JSON
        const data = await response.json().catch(() => ({}));
        console.warn('Form submission error:', data);
        showFormError();
      }
    } catch (err) {
      // Network error
      console.warn('Network error during form submission:', err.message);
      showFormError();
    } finally {
      setSubmitting(false);
    }
  });

  // ── UI helpers ────────────────────────────────────
  const setSubmitting = (isLoading) => {
    if (!submitBtn) return;
    const textEl = qs('.btn__text', submitBtn);
    const loadEl = qs('.btn__loading', submitBtn);

    submitBtn.disabled = isLoading;
    submitBtn.style.opacity = isLoading ? '0.7' : '';
    if (textEl) textEl.hidden = isLoading;
    if (loadEl) loadEl.hidden = !isLoading;
  };

  const showFormSuccess = () => {
    if (successMsg) {
      successMsg.hidden = false;
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (errorMsg) errorMsg.hidden = true;

    // Auto-hide success message after 8 seconds
    setTimeout(() => {
      if (successMsg) successMsg.hidden = true;
    }, 8000);
  };

  const showFormError = () => {
    if (errorMsg) {
      errorMsg.hidden = false;
      errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (successMsg) successMsg.hidden = true;
  };
};

/* ─────────────────────────────────────────────
   09. DATE INPUT — Set minimum to today
   ─ Prevents booking dates in the past.
   ─ Computed at runtime, not hardcoded.
───────────────────────────────────────────── */
const initDateInput = () => {
  const dateInput = qs('#contact-date');
  if (!dateInput) return;

  const today = new Date();
  // Format as YYYY-MM-DD for the input's min attribute
  const yyyy = today.getFullYear();
  const mm   = String(today.getMonth() + 1).padStart(2, '0');
  const dd   = String(today.getDate()).padStart(2, '0');

  dateInput.min = `${yyyy}-${mm}-${dd}`;
};

/* ─────────────────────────────────────────────
   10. HERO VIDEO PERFORMANCE
   ─ On slow connections (Save-Data header or
     Network API), skip autoplay.
───────────────────────────────────────────── */
const initHeroVideo = () => {
  const video = qs('.hero__video');
  if (!video) return;

  // Respect Save-Data mode or slow connections
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = navigator.connection?.saveData;
  const slowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';

  if (saveData || slowConnection) {
    video.removeAttribute('autoplay');
    video.pause();
  }
};

/* ─────────────────────────────────────────────
   10. INIT
   ─ Entry point. Deferred via HTML attribute.
   ─ DOMContentLoaded fires after HTML parsed;
     since script is deferred, DOM is ready.
───────────────────────────────────────────── */
const init = () => {
  initNavigation();
  initReveal();
  initCounters();
  initVideoControls();
  initGalleryDrag();
  initContactForm();
  initDateInput();
  initHeroVideo();
};

// Script is loaded with `defer`, so DOM is ready.
// Using DOMContentLoaded as a secondary safety net.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/*
  ══════════════════════════════════════════════════════════════
  SECURITY NOTES (Schneier & Hyppönen)
  ──────────────────────────────────────────────────────────────
  • No eval() or Function() calls anywhere.
  • All DOM text set via textContent, not innerHTML — XSS-safe.
  • External URLs (Instagram) use rel="noopener noreferrer" in HTML.
  • Form submission uses Formspree endpoint — no credentials in JS.
  • Honeypot field provides basic bot defense; rate limiting is
    server-side via Formspree.
  • navigator.connection read only — no data transmitted.
  • No localStorage / sessionStorage / cookies used — zero tracking.
  • No third-party scripts loaded at runtime.
  • console.warn used (not log) for submissions — no PII leakage.
  ══════════════════════════════════════════════════════════════
*/
