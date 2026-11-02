// ---- メニュー ----
const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');

function setMenu(open) {
  body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
}

menuToggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

// ---- 写真(data-photo が無ければ仮の写真 data-temp、それも無ければ枠だけ) ----
document.querySelectorAll('.photo').forEach((box) => {
  const sources = [box.dataset.photo, box.dataset.temp].filter(Boolean);
  const tryNext = () => {
    const src = sources.shift();
    if (!src) return;
    const probe = new Image();
    probe.onload = () => {
      box.style.backgroundImage = `url("${src}")`;
      box.classList.add('has-img');
    };
    probe.onerror = tryNext;
    probe.src = src;
  };
  tryNext();
});

// ---- カウントダウン ----
const countdown = document.querySelector('[data-countdown]');
if (countdown) {
  const target = new Date(countdown.dataset.countdown).getTime();
  const put = (key, value) => { countdown.querySelector(`[data-cd="${key}"]`).textContent = value; };
  const tick = () => {
    const left = Math.max(0, target - Date.now());
    put('d', Math.floor(left / 86400000));
    put('h', Math.floor(left / 3600000) % 24);
    put('m', Math.floor(left / 60000) % 60);
    put('s', Math.floor(left / 1000) % 60);
  };
  tick();
  setInterval(tick, 1000);
}

// ---- 写真のスライド ----
document.querySelectorAll('[data-gallery]').forEach((gallery) => {
  const track = gallery.querySelector('.gallery__track');
  const slides = [...track.children];
  const dots = gallery.querySelector('.gallery__dots');
  slides.forEach(() => dots.appendChild(document.createElement('i')));

  const current = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
  const refresh = () => {
    const now = current();
    [...dots.children].forEach((dot, i) => dot.classList.toggle('is-on', i === now));
  };
  const go = (step) => {
    const next = (current() + step + slides.length) % slides.length;
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
  };

  gallery.querySelector('.gallery__nav--prev').addEventListener('click', () => go(-1));
  gallery.querySelector('.gallery__nav--next').addEventListener('click', () => go(1));
  track.addEventListener('scroll', refresh, { passive: true });
  refresh();
});

// ---- 文字がふわっと出る ----
const reveals = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-in'));
}

// iPhoneの省電力モードなどで自動再生されないときは、最初の画像のまま見せる
document.querySelector('.hero__video video')?.play().catch(() => {});
