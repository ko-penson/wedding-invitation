document.documentElement.classList.add('js');

const heroVideo = document.querySelector('.hero__video');

if (heroVideo) {
  heroVideo.addEventListener('error', () => {
    heroVideo.style.display = 'none';
  });

  heroVideo.play().catch(() => {});
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches && heroVideo) {
  heroVideo.pause();
}

const sections = document.querySelectorAll('.section');

if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
  sections.forEach((section) => {
    section.classList.add('is-visible');
  });
} else {
  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.08,
  });

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}
