document.documentElement.classList.add('js');

const heroVideo = document.querySelector('.hero__video');
const hero = document.querySelector('.hero');

// スマホ(縦長画面)では縦長動画を使う。ファイルが無ければ横長動画に戻す
const portraitQuery = window.matchMedia('(max-aspect-ratio: 1/1)');
const heroSource = heroVideo?.querySelector('source');
const PC_SRC = 'assets/hero.mp4';
const MOBILE_SRC = 'assets/hero-mobile.mp4';
let usingFallback = false;

function applyHeroSource() {
  if (!heroVideo || !heroSource) return;
  const wantMobile = portraitQuery.matches && !usingFallback;
  const next = wantMobile ? MOBILE_SRC : PC_SRC;

  // 動画エリアの縦横比(高さ÷幅)。縦長動画なら 16/9、横長動画なら 9/16
  hero?.style.setProperty('--rh', next === MOBILE_SRC ? '1.7778' : '0.5625');

  if (!heroSource.getAttribute('src').endsWith(next)) {
    heroSource.setAttribute('src', next);
    heroVideo.load();
    if (hero?.classList.contains('video-started')) heroVideo.play().catch(() => {});
  }
}

if (heroVideo) {
  heroVideo.pause();
  applyHeroSource();
  portraitQuery.addEventListener?.('change', applyHeroSource);

  heroVideo.addEventListener('playing', () => { hero?.classList.add('video-playing'); }, { once: true });

  // スマホ: 2秒後にタイトルが下へ → 動きが落ち着いてから動画スタート
  // PC    : 従来どおり 1秒後に動画スタート
  const TITLE_DOWN_AT = 2000;   // タイトルが動き始める時間
  const START_AT_PHONE = 5300;  // 動画スタート(タイトルが3秒で動き終わったあと)
  const START_AT_PC = 1000;

  const startVideo = () => {
    hero?.classList.add('video-started');
    // 緑が0.5秒で透明になったあとに再生
    window.setTimeout(() => { heroVideo.play().catch(() => {}); }, 500);
  };

  if (portraitQuery.matches) {
    window.setTimeout(() => { hero?.classList.add('title-down'); }, TITLE_DOWN_AT);
    window.setTimeout(startVideo, START_AT_PHONE);
  } else {
    window.setTimeout(startVideo, START_AT_PC);
  }

  // 後から縦長になった(端末の回転など)場合もタイトルを下に置く
  portraitQuery.addEventListener?.('change', () => {
    if (portraitQuery.matches && hero?.classList.contains('video-started')) {
      hero.classList.add('title-down');
    }
  });

  // <source> の読み込み失敗は <video> ではなく <source> 側で発火する
  heroSource?.addEventListener('error', () => {
    if (portraitQuery.matches && !usingFallback) { usingFallback = true; applyHeroSource(); }
    else { heroVideo.style.display = 'none'; }
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReducedMotion.matches && heroVideo) { heroVideo.pause(); }

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
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  sections.forEach((section) => sectionObserver.observe(section));
}
