document.documentElement.classList.add('js');

const heroVideo = document.querySelector('.hero__video');
const hero = document.querySelector('.hero');

// スマホ(縦長画面)では縦長動画を使う。ファイルが無ければ横長動画に戻し、全体が見えるよう contain 表示にする
const portraitQuery = window.matchMedia('(max-aspect-ratio: 1/1)');
const heroSource = heroVideo?.querySelector('source');
const PC_SRC = 'assets/hero.mp4';
const MOBILE_SRC = 'assets/hero-mobile.mp4';
let usingFallback = false;

function applyHeroSource() {
  if (!heroVideo || !heroSource) return;
  const wantMobile = portraitQuery.matches && !usingFallback;
  const next = wantMobile ? MOBILE_SRC : PC_SRC;
  if (!heroSource.getAttribute('src').endsWith(next)) {
    heroSource.setAttribute('src', next);
    heroVideo.load();
    if (hero?.classList.contains('video-started')) heroVideo.play().catch(() => {});
  }
  hero?.classList.toggle('hero--contain', portraitQuery.matches && next === PC_SRC);
}

if (heroVideo) {
  heroVideo.pause();
  applyHeroSource();
  portraitQuery.addEventListener?.('change', applyHeroSource);

  heroVideo.addEventListener('playing', () => {
    hero?.classList.add('video-playing');
  }, { once: true });

  window.setTimeout(() => {
    hero?.classList.add('video-started');

    // 緑が0.5秒で透明になったあとに動画を開始
    window.setTimeout(() => {
      heroVideo.play().catch(() => {});
    }, 500);
  }, 1000);

  // <source> の読み込み失敗は <video> ではなく <source> 側で発火する
  heroSource?.addEventListener('error', () => {
    if (portraitQuery.matches && !usingFallback) {
      usingFallback = true;
      applyHeroSource();
    } else {
      heroVideo.style.display = 'none';
    }
  });
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
