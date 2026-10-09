/**
 * Breadly Bakery — Core JavaScript
 * Fully resilient: works with or without external CDN libraries
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation Scroll Effect
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

  // 2. Mobile Menu Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
    // Close menu when clicking outside or clicking a link
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('active');
      }
    });
  }

  // 3. Active Nav Link Detection
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // 4. Progressive Animations (GSAP with Native Fallback)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    // If GSAP & ScrollTrigger are available from CDN
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      try {
        gsap.registerPlugin(ScrollTrigger);

        // Hero Entrance
        gsap.from('.hero-content > *', {
          opacity: 0,
          y: 25,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.1
        });

        // Scroll Reveals via ScrollTrigger
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
            duration: 0.8,
            ease: 'power2.out'
          });
        });
      } catch (err) {
        console.warn('GSAP enhancement skipped:', err);
      }
    }

    // 5. Stat Counter Animation (Works natively or with GSAP)
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
      }, { threshold: 0.2 });

      counters.forEach(c => counterObserver.observe(c));
    }
  }

  // 6. Menu Filter Tabs
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

  // 7. FAQ Accordion
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

  // 8. Order & Bag Toast Interaction
  const actionButtons = document.querySelectorAll('.card-action-btn');
  actionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      const itemTitle = card ? card.querySelector('.card-title')?.textContent : 'Item';
      showToast(`Added ${itemTitle} to your bakery reserve.`);
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
        boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
        zIndex: '10000',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none',
        border: '1px solid rgba(212, 154, 55, 0.3)'
      });
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, 2800);
  }

  // 9. Form Validations
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
});
