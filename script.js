const heroVideo = document.querySelector('.hero__video');

if (heroVideo) {
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
