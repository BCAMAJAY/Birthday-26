const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Decorative balloons are generated once so every page shares the same mood.
const balloonSky = document.createElement('div');
balloonSky.className = 'balloon-sky';
balloonSky.setAttribute('aria-hidden', 'true');
const balloonColors = ['#ff85b6', '#c28cff', '#ffb45f', '#ef6f9f', '#8f8cff', '#ffcf6d', '#db79c8', '#ff9ba8'];
balloonSky.innerHTML = balloonColors.map((color, index) => (
  `<i class="balloon" style="--balloon-color:${color}; left:${4 + index * 13}%; --rise-time:${14 + (index % 4) * 3}s; --delay:-${index * 2.7}s"></i>`
)).join('');
document.body.prepend(balloonSky);

const loadScript = (src) => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});

// Smooth scrolling and richer motion; CSS remains the fallback if a CDN is unavailable.
Promise.all([
  loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js'),
  loadScript('https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js')
]).then(() => {
  const isTouchLayout = window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  if (!isTouchLayout) {
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.82,
      touchMultiplier: 1,
      orientation: 'vertical',
      gestureOrientation: 'vertical'
    });
    const smoothScroll = (time) => {
      lenis.raf(time);
      requestAnimationFrame(smoothScroll);
    };
    requestAnimationFrame(smoothScroll);
  }

  gsap.from('.navbar', { y: -70, opacity: 0, duration: 1, ease: 'power3.out' });
  gsap.from('.hero-content > *, .sub-hero > *, .final-page > *', {
    y: 28,
    opacity: 0,
    duration: .85,
    stagger: .1,
    ease: 'power3.out'
  });
  gsap.to('.music-btn', { scale: 1.08, duration: .85, repeat: -1, yoyo: true, ease: 'sine.inOut' });
}).catch(() => {});

const vantaLayer = document.createElement('div');
vantaLayer.className = 'vanta-layer';
document.body.prepend(vantaLayer);
loadScript('https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js')
  .then(() => loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.fog.min.js'))
  .then(() => {
    if (window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches || !window.VANTA?.FOG) return;
    VANTA.FOG({
      el: vantaLayer,
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      highlightColor: 0xffb7d5,
      midtoneColor: 0xd8b8ff,
      lowlightColor: 0xffe5bd,
      baseColor: 0xfff8fc,
      blurFactor: .55,
      speed: .7,
      zoom: .65
    });
  }).catch(() => {});

const glow = $('.cursor-glow');
let glowFrame = null;
document.addEventListener('mousemove', (event) => {
  if (!glow) return;
  if (glowFrame) cancelAnimationFrame(glowFrame);
  glowFrame = requestAnimationFrame(() => {
    glow.style.transform = `translate3d(${event.clientX - 140}px, ${event.clientY - 140}px, 0)`;
  });
});

// Replace this file with your own MP3 later; keep the same name and location.
const MUSIC_FILE = 'assets/birthday-music.mp3';
const backgroundMusic = new Audio(MUSIC_FILE);
backgroundMusic.loop = true;
backgroundMusic.preload = 'auto';

let musicBtn = $('#musicBtn');
if (!musicBtn) {
  musicBtn = document.createElement('button');
  musicBtn.id = 'musicBtn';
  musicBtn.className = 'music-btn';
  musicBtn.type = 'button';
  musicBtn.textContent = '♪';
  musicBtn.setAttribute('aria-label', 'Play background music');
  musicBtn.title = 'Play background music';
  document.body.appendChild(musicBtn);
}

const updateMusicButton = (isPlaying) => {
  musicBtn.classList.toggle('playing', isPlaying);
  musicBtn.textContent = isPlaying ? '♫' : '♪';
  musicBtn.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
  musicBtn.title = isPlaying ? 'Pause background music' : 'Play background music';
};

const startMusic = async () => {
  try {
    const savedTime = Number(sessionStorage.getItem('birthdayMusicTime'));
    if (Number.isFinite(savedTime) && savedTime > 0) backgroundMusic.currentTime = savedTime;
    await backgroundMusic.play();
    sessionStorage.setItem('birthdayMusicEnabled', 'true');
    updateMusicButton(true);
  } catch (_) {
    updateMusicButton(false);
  }
};

musicBtn.addEventListener('click', () => {
  if (backgroundMusic.paused) startMusic();
  else {
    backgroundMusic.pause();
    sessionStorage.setItem('birthdayMusicEnabled', 'false');
    updateMusicButton(false);
  }
});

setInterval(() => {
  if (!backgroundMusic.paused) sessionStorage.setItem('birthdayMusicTime', String(backgroundMusic.currentTime));
}, 1000);

// Autoplay when allowed. If blocked, the first tap/click starts it.
if (sessionStorage.getItem('birthdayMusicEnabled') !== 'false') startMusic();
document.addEventListener('pointerdown', () => {
  if (backgroundMusic.paused && sessionStorage.getItem('birthdayMusicEnabled') !== 'false') startMusic();
}, { once: true });

const now = new Date();
let birthdayYear = now.getFullYear();
let birthdayDate = new Date(birthdayYear, 7, 23, 0, 0, 0, 0);
if (now >= birthdayDate) birthdayDate = new Date(++birthdayYear, 7, 23, 0, 0, 0, 0);
birthdayDate = birthdayDate.getTime();
function updateCountdown() {
  const countdown = $('#countdown');
  if (!countdown) return;

  const difference = Math.max(birthdayDate - Date.now(), 0);
  const days = Math.floor(difference / 86400000);
  const hours = Math.floor((difference % 86400000) / 3600000);
  const minutes = Math.floor((difference % 3600000) / 60000);
  const seconds = Math.floor((difference % 60000) / 1000);

  $('#days').textContent = String(days).padStart(2, '0');
  $('#hours').textContent = String(hours).padStart(2, '0');
  $('#mins').textContent = String(minutes).padStart(2, '0');
  $('#secs').textContent = String(seconds).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

const reasons = [
  'Your smile feels like sunshine.',
  'You make people feel safe.',
  'Your laugh is unforgettable.',
  'You turn simple days into stories.',
  'You care deeply.',
  'Your vibe is soft and magical.',
  'You are beautifully genuine.',
  'You make memories feel golden.',
  'Your heart is rare.',
  'You are my favorite person to annoy.',
  'You glow without trying.',
  'You make everything better.',
  'You listen like home.',
  'You are effortlessly classy.',
  'You deserve the prettiest life.',
  'You are a whole comfort place.',
  'Your presence feels peaceful.',
  'You are pure main character energy.',
  'You make friendship feel precious.',
  'You are loved more than words.',
  'You bring calm into chaos.',
  'You make every photo feel special.',
  'You have the cutest little habits.',
  'You make boring days memorable.',
  'You are gentle but strong.',
  'Your friendship feels like a blessing.',
  'You understand things without words.',
  'You make silence feel comfortable.',
  'You are a walking soft glow.',
  'You make people believe in kindness.',
  'You are so easy to love.',
  'You make celebrations feel brighter.',
  'You carry warmth wherever you go.',
  'You make tiny moments feel cinematic.',
  'You have a beautiful soul.',
  'You make me laugh at random times.',
  'You are honest in the sweetest way.',
  'You are my comfort notification.',
  'You make the world less heavy.',
  'You deserve flowers every day.',
  'You make love feel simple.',
  'You are soft, rare, and precious.',
  'You make every plan more exciting.',
  'You are naturally elegant.',
  'You care even when nobody notices.',
  'You are full of pretty energy.',
  'You make friendship feel magical.',
  'You are the reason behind many smiles.',
  'You make ordinary chats memorable.',
  'You are a safe place.',
  'You look beautiful being yourself.',
  'You make every goodbye feel hard.',
  'You are thoughtful in little ways.',
  'You make life feel warmer.',
  'You are my favorite kind of person.',
  'You make memories worth saving.',
  'You are sunshine with a little drama.',
  'You make birthdays feel meaningful.',
  'You are a beautiful chapter.',
  'You make every corner feel like home.',
  'You are cute without even trying.',
  'You have the prettiest heart.',
  'You make people feel noticed.',
  'You bring sparkle into simple things.',
  'You are love in human form.',
  'You make every story better.',
  'You are someone I am grateful for.',
  'You make emotions feel safe.',
  'You have a rare kind of grace.',
  'You make the day softer.',
  'You are a forever kind of friend.',
  'You make everyone around you happier.',
  'You are pure golden-hour energy.',
  'You make small surprises feel huge.',
  'You are beautifully dramatic sometimes.',
  'You make life feel like a cute vlog.',
  'You are my favorite memory keeper.',
  'You make even chaos look pretty.',
  'You are special in every season.',
  'You make me proud to know you.',
  'You carry love in your details.',
  'You make every laugh feel louder.',
  'You are a little universe of warmth.',
  'You make everything feel less lonely.',
  'You are rare, real, and radiant.',
  'You make wishes feel possible.',
  'You are the prettiest comfort zone.',
  'You make every message feel sweet.',
  'You turn moments into keepsakes.',
  'You are always worth celebrating.',
  'You make kindness look beautiful.',
  'You are a blessing in soft colors.',
  'You make every page of life prettier.',
  'You are deeply loved.',
  'You make my heart smile.',
  'You deserve all the magic.',
  'You make today feel golden.',
  'You are unforgettable.',
  'You are my favorite birthday girl.',
  'You are more loved than 100 reasons can say.'
];

const reasonGrid = $('#reasonGrid');
if (reasonGrid) {
  const imageFolder = reasonGrid.dataset.imageFolder || 'assets';
  const reasonImages = Array.from({ length: 100 }, (_, index) => `${imageFolder}/${index + 1}.jpg`);

  reasonGrid.innerHTML = reasons
    .map((reason, index) => {
      const image = reasonImages[index % reasonImages.length];
      return `
      <article class="reason-card reveal" tabindex="0">
        <div class="reason-inner">
          <div class="reason-front">
            <h3>${index + 1}</h3>
            <p>tap love note</p>
          </div>
          <div class="reason-back" style="background-image: linear-gradient(to bottom, rgba(62,50,50,.08), rgba(62,50,50,.18) 45%, rgba(62,50,50,.78)), url('${image}');">
            <p>${reason}</p>
          </div>
        </div>
      </article>`;
    })
    .join('');
}

$('#randomReasonBtn')?.addEventListener('click', () => {
  $('#randomReason').textContent = reasons[Math.floor(Math.random() * reasons.length)];
});

const envelope = $('#envelope');
const letterText = `Sakku, you are one of those rare people who make the world feel gentler just by being in it. Your presence brings a kind of warmth, peace, and beauty that words can never fully explain.
On your birthday, I just want you to know how deeply you are loved, not just today, but every single day. You deserve happiness that feels real, dreams that slowly turn into reality, and moments so beautiful that your heart wants to keep them forever.
I hope this year gives you soft mornings, peaceful nights, unexpected smiles, and every little thing your soul has been waiting for.
Happy Birthday, my love. You are special in ways you may never fully realize, and you deserve magic, love, and endless happiness in every chapter of your life. I love you 🫶`;
let hasTypedLetter = false;

envelope?.addEventListener('click', () => {
  envelope.classList.add('open');
  if (hasTypedLetter) return;

  hasTypedLetter = true;
  let index = 0;
  const typedLetter = $('#typedLetter');
  const typing = setInterval(() => {
    typedLetter.textContent += letterText[index] || '';
    index += 1;
    if (index > letterText.length) clearInterval(typing);
  }, 35);
});

const cake = $('#birthdayCake') || $('.cake');
const cutCakeBtn = $('.cut-cake-btn');
const cakeStageText = $('#cakeStageText');
let cakeAnimationStarted = false;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

cutCakeBtn?.addEventListener('click', async () => {
  if (!cake || cakeAnimationStarted) return;

  cakeAnimationStarted = true;
  cutCakeBtn.disabled = true;

  cakeStageText.textContent = 'blowing the candles... 🌬️';
  cutCakeBtn.textContent = 'Blowing Candles...';
  cake.classList.add('blow');
  await wait(1500);

  cakeStageText.textContent = ' cake is cutting 🔪';
  cutCakeBtn.textContent = '';
  cake.classList.add('knife-in');
  await wait(1200);

  cakeStageText.textContent = ' into a slice... 🍰';
  cutCakeBtn.textContent = 'Cutting Slice...';
  cake.classList.add('sliced');
  await wait(900);

  cakeStageText.textContent = 'first slice for Sakku 🎉';
  cutCakeBtn.textContent = 'Cake Cut 🎉';

  if (typeof confetti === 'function') {
    confetti({ particleCount: 280, spread: 115, origin: { y: 0.62 } });
  }
});
