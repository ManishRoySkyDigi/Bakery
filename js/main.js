/**
 * Breadly Bakery — Core Interactive Systems
 * Includes Lenis Smooth Scroll, GSAP Parallax Scrub, 3D Card Hover Physics,
 * In-Page Cinematic Video Modal, and Magnetic Cursor.
 */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 899;

  // 1. Lenis Smooth Scroll Engine (Desktop Mouse Precision Only — 100% Native Momentum on Mobile)
  let lenis = null;
  if (!isTouchDevice && !prefersReducedMotion && typeof Lenis !== 'undefined') {
    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    } catch (err) {
      console.warn('Lenis smooth scroll skipped:', err);
    }
  }

  // 2. Navigation Scroll Effect
  const nav = document.querySelector('.nav');
  if (nav) {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 3. Mobile Navigation Drawer & Backdrop System
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    // Ensure backdrop exists in DOM
    let navBackdrop = document.querySelector('.nav-backdrop');
    if (!navBackdrop) {
      navBackdrop = document.createElement('div');
      navBackdrop.className = 'nav-backdrop';
      document.body.appendChild(navBackdrop);
    }

    const openMenu = () => {
      navLinks.classList.add('active');
      navToggle.classList.add('active');
      navBackdrop.classList.add('active');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      navLinks.classList.remove('active');
      navToggle.classList.remove('active');
      navBackdrop.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.contains('active');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Tap backdrop to close
    navBackdrop.addEventListener('click', closeMenu);

    // Auto-close on tapping any nav link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });

    // Auto-close if screen resized to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 900 && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  // 4. Active Nav Link Detection
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // 5. GSAP Entrance & Parallax Motion
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    try {
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Parallax Scrub (Deep cinematic layer)
        const heroMedia = document.querySelector('.hero-video, .hero-img');
        if (heroMedia) {
          gsap.to(heroMedia, {
            yPercent: 18,
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero',
              start: 'top top',
              end: 'bottom top',
              scrub: true
            }
          });
        }

        // Split Section Image Parallax
        const splitImg = document.querySelector('.split-img-wrapper img');
        if (splitImg) {
          gsap.to(splitImg, {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: '.split-img-wrapper',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });
        }

        // Hero Entrance
        gsap.from('.hero-content > *', {
          opacity: 0,
          y: 28,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.15
        });

        // Staggered Scroll Reveals
        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => {
          gsap.from(el, {
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true
            },
            opacity: 0,
            y: 35,
            duration: 0.85,
            ease: 'power2.out'
          });
        });
      }
    } catch (err) {
      console.warn('GSAP animations skipped:', err);
    }
  }

  // 6. Tactile 3D Card Physics & Specular Glare
  const tiltCards = document.querySelectorAll('.card, .testimonial-card, .value-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update spotlight position vars
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      if (!prefersReducedMotion) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px) scale3d(1.015, 1.015, 1.015)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // 7. In-Page Cinematic Video Modal Theater
  const videoTriggers = document.querySelectorAll('.video-play-btn, [data-video-modal], .video-showcase');
  if (videoTriggers.length > 0) {
    // Inject Video Modal DOM if not present
    let videoModal = document.getElementById('videoModal');
    if (!videoModal) {
      videoModal = document.createElement('div');
      videoModal.id = 'videoModal';
      videoModal.className = 'video-modal';
      videoModal.innerHTML = `
        <button class="video-modal-close" aria-label="Close Video">&times;</button>
        <div class="video-modal-content">
          <video class="video-modal-player" src="" controls autoplay playsinline style="width: 100%; height: 100%; display: none; object-fit: contain; background: #000; border-radius: 12px;"></video>
          <iframe class="video-modal-iframe" src="" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="width: 100%; height: 100%; border: none; display: none;"></iframe>
        </div>
      `;
      document.body.appendChild(videoModal);
    }

    const iframe = videoModal.querySelector('.video-modal-iframe');
    const localPlayer = videoModal.querySelector('.video-modal-player');
    const closeBtn = videoModal.querySelector('.video-modal-close');

    function openVideo(videoId = '2_DF4_LkWaY', videoSrc = null) {
      if (videoSrc) {
        iframe.style.display = 'none';
        iframe.src = '';
        localPlayer.style.display = 'block';
        localPlayer.src = videoSrc;
        localPlayer.play().catch(() => {});
      } else {
        localPlayer.style.display = 'none';
        localPlayer.pause();
        localPlayer.src = '';
        iframe.style.display = 'block';
        iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1`;
      }
      videoModal.classList.add('is-active');
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
    }

    function closeVideo() {
      videoModal.classList.remove('is-active');
      if (localPlayer) {
        localPlayer.pause();
        localPlayer.src = '';
        localPlayer.style.display = 'none';
      }
      if (iframe) {
        iframe.src = '';
        iframe.style.display = 'none';
      }
      if (lenis) lenis.start();
      document.body.style.overflow = '';
    }

    videoTriggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // If clicking directly on a playlist tab, let playlist tab handler handle it
        if (e.target.closest('.video-tab-card')) return;
        e.preventDefault();
        const videoSrc = btn.getAttribute('data-video-src');
        const videoId = btn.getAttribute('data-video-id') || '2_DF4_LkWaY';
        openVideo(videoId, videoSrc);
      });
    });

    // Video Playlist Switcher (All 3 episodes consolidated in one place)
    const playlistTabs = document.querySelectorAll('.video-tab-card');
    const theaterMainVideo = document.getElementById('theaterMainVideo');
    const theaterShowcase = document.getElementById('theaterShowcase');
    const theaterPlayBtn = document.getElementById('theaterPlayBtn');

    if (playlistTabs.length > 0 && theaterMainVideo) {
      playlistTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          playlistTabs.forEach(t => t.classList.remove('is-active'));
          tab.classList.add('is-active');

          const newSrc = tab.getAttribute('data-src');
          if (newSrc) {
            theaterMainVideo.src = newSrc;
            theaterMainVideo.load();
            theaterMainVideo.play().catch(() => {});

            if (theaterShowcase) theaterShowcase.setAttribute('data-video-src', newSrc);
            if (theaterPlayBtn) theaterPlayBtn.setAttribute('data-video-src', newSrc);
          }
        });
      });
    }

    closeBtn.addEventListener('click', closeVideo);
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideo();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('is-active')) {
        closeVideo();
      }
    });
  }

  // 8. Magnetic Custom Cursor (Fine pointer only)
  if (window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const cursorDot = document.createElement('div');
    cursorDot.className = 'custom-cursor-dot';
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    let mouseX = -100, mouseY = -100;
    let cursorX = -100, cursorY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    function renderCursor() {
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover Magnification Targets
    const interactiveTargets = document.querySelectorAll('a, button, .card, .gallery-item, .filter-btn');
    interactiveTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-hovering');
        if (el.classList.contains('video-play-btn') || el.closest('.video-showcase')) {
          cursor.classList.add('is-video');
        }
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-hovering');
        cursor.classList.remove('is-video');
      });
    });
  }

  // 9. Interactive Pre-Order Reserve Pill & Toast
  let reservedCount = 0;
  let bagPill = document.querySelector('.bag-pill');
  if (!bagPill) {
    bagPill = document.createElement('a');
    bagPill.href = 'order.html';
    bagPill.className = 'bag-pill';
    bagPill.innerHTML = `
      <span>🧺 Artisanal Reserve</span>
      <span class="bag-pill-badge">0 items</span>
    `;
    document.body.appendChild(bagPill);
  }

  const actionButtons = document.querySelectorAll('.card-action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      const itemTitle = card ? card.querySelector('.card-title')?.textContent : 'Bakehouse Item';
      reservedCount++;
      const badge = bagPill.querySelector('.bag-pill-badge');
      if (badge) badge.textContent = `${reservedCount} ${reservedCount === 1 ? 'item' : 'items'}`;
      bagPill.classList.add('is-visible');

      showToast(`Added ${itemTitle} to your morning reserve basket.`);
    });
  });

  function showToast(message) {
    let toast = document.querySelector('.bakery-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'bakery-toast';
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%) translateY(100px)',
        backgroundColor: '#1a1108',
        color: '#fdfaf6',
        padding: '0.85rem 1.6rem',
        borderRadius: '9999px',
        fontSize: '0.9rem',
        fontWeight: '500',
        boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
        zIndex: '10000',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none',
        border: '1px solid rgba(212, 154, 55, 0.4)'
      });
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, 2800);
  }

  // 10. Stat Counter Animation
  const counters = document.querySelectorAll('.stat-num');
  if ('IntersectionObserver' in window && counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute('data-target'), 10);
          if (!isNaN(target)) {
            let current = 0;
            const step = Math.max(1, Math.ceil(target / 40));
            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                counter.textContent = target + '+';
                clearInterval(timer);
              } else {
                counter.textContent = current + '+';
              }
            }, 30);
          }
          observer.unobserve(counter);
        }
      });
    }, { threshold: 0.25 });

    counters.forEach(c => counterObserver.observe(c));
  }

  // 11. Menu Filter Tabs
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  if (filterBtns.length > 0 && menuItems.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        menuItems.forEach(item => {
          const category = item.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            item.style.display = 'flex';
            setTimeout(() => { item.style.opacity = '1'; item.style.transform = 'translateY(0)'; }, 20);
          } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
            setTimeout(() => { item.style.display = 'none'; }, 250);
          }
        });
      });
    });
  }

  // 12. FAQ Accordion
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const isActive = header.classList.contains('active');

      accordionHeaders.forEach(h => {
        h.classList.remove('active');
        if (h.nextElementSibling) {
          h.nextElementSibling.style.maxHeight = null;
        }
      });

      if (!isActive && content) {
        header.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // 13. General Form Validations
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

      inputs.forEach(input => {
        const errorMsg = input.parentElement.querySelector('.form-error');
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = '#dc2626';
          if (errorMsg) errorMsg.style.display = 'block';
        } else {
          input.style.borderColor = '';
          if (errorMsg) errorMsg.style.display = 'none';
        }
      });

      if (isValid) {
        const successDiv = form.querySelector('.form-success');
        if (successDiv) {
          successDiv.style.display = 'block';
          form.reset();
          setTimeout(() => { successDiv.style.display = 'none'; }, 6000);
        }
      }
    });
  });

  // 14. Interactive Before/After Dough Scoring Slider
  const compareContainer = document.getElementById('scoringCompare');
  if (compareContainer) {
    let isDragging = false;

    const setSliderPos = (clientX) => {
      const rect = compareContainer.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (rawX / rect.width) * 100));
      compareContainer.style.setProperty('--slider-pos', `${percentage.toFixed(2)}%`);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      if (e.cancelable && e.type === 'touchmove') e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setSliderPos(clientX);
    };

    const stopDragging = () => {
      isDragging = false;
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', stopDragging);
      window.removeEventListener('touchend', stopDragging);
    };

    const startDragging = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setSliderPos(clientX);
      window.addEventListener('mousemove', onPointerMove, { passive: false });
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('mouseup', stopDragging);
      window.addEventListener('touchend', stopDragging);
    };

    compareContainer.addEventListener('mousedown', startDragging);
    compareContainer.addEventListener('touchstart', startDragging, { passive: true });
  }

  // 15. Live 24-Hour Hearth Timeline Clock Sync
  const scheduleCards = document.querySelectorAll('.schedule-card');
  if (scheduleCards.length > 0) {
    const updateHearthStage = () => {
      const now = new Date();
      // Decimal hour representation (e.g. 14:30 = 14.5)
      const currentHour = now.getHours() + now.getMinutes() / 60;

      let activeFound = false;

      scheduleCards.forEach(card => {
        const start = parseFloat(card.getAttribute('data-start'));
        let end = parseFloat(card.getAttribute('data-end'));

        // Handle overnight wrapping for Stage 06 (e.g. 19:00 to 03:30 next morning = 19.0 to 27.5)
        let isActive = false;
        if (end > 24) {
          const wrappedEnd = end - 24;
          if (currentHour >= start || currentHour < wrappedEnd) {
            isActive = true;
          }
        } else {
          if (currentHour >= start && currentHour < end) {
            isActive = true;
          }
        }

        const statusBadge = card.querySelector('.schedule-status');
        if (isActive && !activeFound) {
          card.classList.add('is-active');
          if (statusBadge) {
            statusBadge.innerHTML = '● Active Right Now';
          }
          activeFound = true;
        } else {
          card.classList.remove('is-active');
          if (statusBadge && !statusBadge.textContent.includes('Stage')) {
            const index = Array.from(scheduleCards).indexOf(card) + 1;
            statusBadge.textContent = `Stage 0${index}`;
          }
        }
      });

      // Default fallback if boundary edge: highlight first morning pull
      if (!activeFound && scheduleCards.length > 0) {
        scheduleCards[2].classList.add('is-active');
        const badge = scheduleCards[2].querySelector('.schedule-status');
        if (badge) badge.innerHTML = '● Hearth Active';
      }
    };

    updateHearthStage();
    // Re-check every 5 minutes
    setInterval(updateHearthStage, 300000);
  }

  // 16. Organic Flour Dust Canvas Micro-Particles
  const canvas = document.getElementById('flourCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const PARTICLE_COUNT = window.innerWidth < 640 ? 12 : Math.min(45, Math.floor(window.innerWidth / 28));
    const particles = [];

    class FlourMote {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -10;
        this.radius = Math.random() * 1.8 + 0.6;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = Math.random() * 0.5 + 0.25;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.hue = Math.random() > 0.4 ? '40, 25%, 90%' : '38, 65%, 55%'; // Flour cream or golden crust tint
        this.swing = Math.random() * Math.PI * 2;
        this.swingSpeed = Math.random() * 0.02 + 0.008;
      }
      update() {
        this.swing += this.swingSpeed;
        this.x += this.vx + Math.sin(this.swing) * 0.35;
        this.y += this.vy;

        if (this.y > height + 10 || this.x < -10 || this.x > width + 10) {
          this.reset(false);
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new FlourMote());
    }

    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });

    function animateFlour() {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
          particles[i].draw();
        }
      }
      requestAnimationFrame(animateFlour);
    }
    animateFlour();
  }
});
