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

  // スマホ: 2秒後にタイトルが3秒かけて下へ → 動き終わってから動画スタート
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


/* ==========================================================
   ここから下: ヒーロー以外の動き
   ========================================================== */

// ---- フォントが揃ってから表示(最初から正しいフォントで見せる) ----
const showPage = () => document.documentElement.classList.remove('fonts-loading');
if (document.fonts?.load) {
  Promise.all([
    document.fonts.load('1em Ampersand', 'KOTA CHIHARU 2027.01.30'),
    document.fonts.load('1em Yomogi', '南皓太船澤千春あいうえおアイウエオ'),
    document.fonts.load('700 1em DynaPuff', 'OUR WEDDING KOTA CHIHARU'),
  ]).then(() => document.fonts.ready).then(showPage, showPage);
} else {
  showPage();
}

const reduceMotion = prefersReducedMotion.matches;
const body = document.body;

// ---- 文字を1文字ずつ分解(data-split) ----
document.querySelectorAll('[data-split]').forEach((el) => {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  let index = 0;
  text.split(/(\s+)/).forEach((part) => {
    if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
    const word = document.createElement('span');
    word.className = 'w';
    word.setAttribute('aria-hidden', 'true');
    [...part].forEach((char) => {
      const ch = document.createElement('span');
      ch.className = 'ch';
      ch.style.setProperty('--i', index++);
      ch.textContent = char;
      word.appendChild(ch);
    });
    el.appendChild(word);
  });
});

// ---- 画面に入ったらふわっと表示 ----
const revealTargets = document.querySelectorAll('[data-reveal], [data-split]');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealTargets.forEach((el) => el.classList.add('is-in'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  revealTargets.forEach((el) => revealObserver.observe(el));
}

// ---- 写真の読み込み(無いときは仮表示のまま) ----
document.querySelectorAll('.parallax[data-photo]').forEach((box) => {
  const img = box.querySelector('.parallax__img');
  const probe = new Image();
  probe.onload = () => {
    img.style.backgroundImage = `url("${box.dataset.photo}")`;
    box.classList.add('has-img');
  };
  probe.src = box.dataset.photo;
});

// ---- メッセージ動画(ファイルが無いときは COMING SOON) ----
document.querySelectorAll('.msg-video[data-video]').forEach((box) => {
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.addEventListener('error', () => { video.remove(); box.classList.add('is-empty'); }, { once: true });
  video.src = box.dataset.video;
  box.appendChild(video);
});

// ---- ヘッダー / 進行バー ----
const progressBar = document.querySelector('.progress i');
function onScrollUi() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar?.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 0;
  body.classList.toggle('past-hero', window.scrollY > heroBottom - 80);
}

// ---- メニュー ----
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
function setMenu(open) {
  body.classList.toggle('menu-open', open);
  menuToggle?.setAttribute('aria-expanded', String(open));
  menu?.setAttribute('aria-hidden', String(!open));
}
menuToggle?.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// ---- スクロールで写真/文字が「遅れて」流れる ----
const parallaxItems = [...document.querySelectorAll('.parallax')].map((box) => ({
  box, img: box.querySelector('.parallax__img'), current: 0, target: 0,
}));
const slideItems = [...document.querySelectorAll('[data-slide]')].map((el) => ({
  el, speed: parseFloat(el.dataset.slide) || -0.3, current: 0, target: 0,
}));

let ticking = false;

function measure() {
  const vh = window.innerHeight;
  parallaxItems.forEach((item) => {
    const r = item.box.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const progress = (r.top + r.height / 2 - vh / 2) / vh;        // 画面中央で 0
    const limit = r.height * 0.17;
    item.target = Math.max(-limit, Math.min(limit, -progress * r.height * 0.28));
  });
  slideItems.forEach((item) => {
    const r = item.el.parentElement.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const progress = (r.top + r.height / 2 - vh / 2) / vh;
    item.target = progress * item.speed * window.innerWidth;
  });
}

function frame() {
  let moving = false;
  parallaxItems.forEach((item) => {
    item.current += (item.target - item.current) * 0.09;          // 0.09 = 遅れ具合(小さいほどゆっくり追いかける)
    if (Math.abs(item.target - item.current) > 0.1) moving = true;
    item.img.style.transform = `translate3d(0, ${item.current.toFixed(2)}px, 0)`;
  });
  slideItems.forEach((item) => {
    item.current += (item.target - item.current) * 0.09;
    if (Math.abs(item.target - item.current) > 0.1) moving = true;
    const base = item.el.classList.contains('concept__bg') ? 'translateY(-50%) ' : '';
    item.el.style.transform = `${base}translate3d(${item.current.toFixed(2)}px, 0, 0)`;
  });
  if (moving) requestAnimationFrame(frame); else ticking = false;
}

function onScroll() {
  onScrollUi();
  if (reduceMotion) return;
  measure();
  if (!ticking) { ticking = true; requestAnimationFrame(frame); }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
window.addEventListener('load', onScroll);
onScroll();


// タイトルを「動画エリアのど真ん中」に置くための移動量を測る(スマホのみ)
function setTitleShift() {
  const media = document.querySelector('.hero__media');
  const content = document.querySelector('.hero__content');
  if (!media || !content) return;
  if (!portraitQuery.matches) { content.style.removeProperty('--shift'); return; }
  const gap = parseFloat(getComputedStyle(content).marginTop) || 0;
  const shift = media.offsetHeight / 2 + gap + content.offsetHeight / 2;
  content.style.setProperty('--shift', Math.round(shift) + 'px');
}
setTitleShift();
window.addEventListener('resize', setTitleShift);
window.addEventListener('load', setTitleShift);
portraitQuery.addEventListener?.('change', setTitleShift);
document.fonts?.ready.then(setTitleShift);
// 文字や画像の読み込みで大きさが変わったら測り直す
if ('ResizeObserver' in window) {
  const ro = new ResizeObserver(setTitleShift);
  document.querySelectorAll('.hero__media, .hero__content').forEach((el) => ro.observe(el));
}
