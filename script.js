document.documentElement.classList.add('js');

const heroVideo = document.querySelector('.hero__video');
const hero = document.querySelector('.hero');

if (heroVideo) {
  const revealVideo = () => hero?.classList.add('video-started');

  heroVideo.addEventListener('playing', revealVideo, { once: true });
  heroVideo.addEventListener('error', () => {
    heroVideo.style.display = 'none';
  });

  // Some browsers wait for a user gesture even when a video is muted.
  heroVideo.play().catch(() => {});
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReducedMotion.matches && heroVideo) {
  heroVideo.pause();
}

const sections = document.querySelectorAll('.section');

if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
  sections.forEach((section) => section.classList.add('is-visible'));
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

  sections.forEach((section) => sectionObserver.observe(section));
}
