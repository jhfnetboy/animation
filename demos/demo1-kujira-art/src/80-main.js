// ---- main: build the 5-act Lanna River of Mind film, post pipeline, overlay metaphors, sound & teaching HUD
const P = new URLSearchParams(location.search);
let isLow = P.get('q') === 'low';
let W = isLow ? 1280 : 1920, H = isLow ? 720 : 1080;

const canvas = document.getElementById('c');
canvas.width = W; canvas.height = H;

const post = new Post(canvas, W, H);
const scene = new THREE.Scene();
const overlay = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.5, 9000);

const env = buildEnv(scene);
const whale = buildWhale(scene);
const boat = buildBoat(scene);
const lighthouse = buildLighthouse(scene);
const tokens = buildTokensAndBeams(scene, overlay, post);
const fx = buildFx(scene, whale, RAIN_DROPS);
const gulls = buildGulls(scene);
const _v = new THREE.Vector3();

function renderFrame(n) {
  const st = stateFor(clamp(n, 0, FRAMES - 1));
  U.uTime.value = st.t;
  U.uDraw.value = onTwos(st.t);

  const c = st.cam;
  camera.position.set(...c.pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(_v.set(...c.look));
  camera.fov = c.fov;
  camera.aspect = W / H;
  camera.near = 0.5;
  camera.far = 9000;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  whale.pose(st.pose, st.whaleVisible, st.whaleEmergence);

  const rv = env.seaU.uRing.value;
  boat.update(st, { x: rv.x, y: rv.y, z: rv.z, w: rv.w });
  lighthouse.update(st);
  scene.updateMatrixWorld(true);

  const lampWorld = boat.getLampWorldPos();
  const tokRes = tokens.update(st, camera, lampWorld);
  env.update(st, camera, tokRes.activeRipples);
  env.seaU.uBoat.value.set(st.boat.pos.x, st.boat.pos.y, st.boat.heading, 1);
  env.seaU.uWake.value.set(st.boat.pos.x, st.boat.pos.y, st.boat.heading, st.boat.speed);

  fx.update(st);
  gulls.update(st);
  scene.updateMatrixWorld(true);
  overlay.updateMatrixWorld(true);

  post.render(scene, overlay, camera, {
    frame: st.frame,
    fade: st.fade,
    flash: st.flash,
    inkSeed: Math.floor(st.t * 12) % 5,
  });
  return st;
}

// ---- interactive player & teaching HUD
const ui = {
  play: document.getElementById('play'),
  big: document.getElementById('big'),
  bigHint: document.querySelector('.big-hint'),
  brandTag: document.getElementById('brand-tag'),
  scrub: document.getElementById('scrub'),
  lbl: document.getElementById('lbl'),
  loop: document.getElementById('loop'),
  loopText: document.getElementById('loop-text'),
  mute: document.getElementById('mute'),
  capBtn: document.getElementById('cap-toggle'),
  qualBtn: document.getElementById('qual-toggle'),
  captionCard: document.getElementById('caption-card'),
  capBadge: document.getElementById('cap-badge'),
  capTitle: document.getElementById('cap-title'),
  capEn: document.getElementById('cap-en'),
  capDesc: document.getElementById('cap-desc'),
  actBar: document.getElementById('acts'),
  langBtns: Array.from(document.querySelectorAll('.lang-btn')),
};

ui.scrub.max = FRAMES - 1;

// Language initialization: ?lang=en|zh|th > localStorage('ai_course_lang') > 'en'
const VALID_LANGS = ['en', 'zh', 'th'];
function normLang(l) {
  if (!l || typeof l !== 'string') return null;
  const v = l.toLowerCase().trim().slice(0, 2);
  return VALID_LANGS.includes(v) ? v : null;
}
function readSavedLang() {
  try { return normLang(localStorage.getItem('ai_course_lang')); } catch (e) { return null; }
}
let currentLang = normLang(P.get('lang')) || readSavedLang() || 'en';

// Build 5-act jump capsule buttons
const actBtns = ACTS.map((act) => {
  const b = document.createElement('button');
  b.className = 'act-pill';
  b.dataset.act = act.id;
  b.style.setProperty('--accent', act.accent);
  b.innerHTML = `<span class="act-num">${act.num}</span><span class="act-name"></span><span class="act-prog"><i></i></span>`;
  b.onclick = () => jumpToAct(act);
  ui.actBar.appendChild(b);
  return { act, el: b, name: b.querySelector('.act-name'), bar: b.querySelector('.act-prog i') };
});

let audioBuf = null, actx = null, gainNode = null, src = null;
let playing = false, muted = false, userStarted = false, t0 = 0, shown = -1;
const soundReady = renderSoundtrack().then((b) => (audioBuf = b)).catch((e) => console.warn('sound', e));

function syncCaption(cur) {
  const lt = cur[currentLang] || cur.en;
  ui.capBadge.dataset.act = cur.id;
  ui.capBadge.textContent = `ACT 0${cur.num} / 05 · ${lt.lesson}`;
  ui.capTitle.textContent = lt.title;
  ui.capEn.textContent = lt.sub;
  ui.capDesc.textContent = lt.desc;
  ui.captionCard.style.setProperty('--accent', cur.accent);
}

function setLang(lang, persist = true) {
  const next = normLang(lang);
  if (!next) return;
  currentLang = next;
  if (persist) {
    try { localStorage.setItem('ai_course_lang', next); } catch (e) {}
  }
  document.documentElement.lang = next;

  const t = I18N_D1[next] || I18N_D1.en;
  document.title = t.pageTitle;
  ui.brandTag.textContent = t.brandTag;
  ui.big.title = t.bigTitle;
  ui.bigHint.textContent = t.bigHint;
  ui.capBtn.textContent = t.capBtn;
  ui.capBtn.title = t.capTitle;
  ui.mute.title = t.muteTitle;
  ui.qualBtn.textContent = isLow ? t.qualLow : t.qualHigh;
  ui.qualBtn.title = t.qualTitle;
  ui.qualBtn.classList.toggle('low', isLow);
  ui.play.title = t.playTitle;
  ui.scrub.title = t.scrubTitle;
  ui.loopText.textContent = t.loopLabel;

  ui.langBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === next);
  });

  actBtns.forEach(({ act, el, name }) => {
    const at = act[next] || act.en;
    name.textContent = at.title;
    el.title = t.actTip(act.num, at.title, act.start, act.end);
  });

  if (shown >= 0) syncCaption(stateFor(clamp(shown, 0, FRAMES - 1)).act);
}

function syncHud(st) {
  const t = st.t;
  ui.scrub.value = st.frame;
  ui.lbl.textContent = `${t.toFixed(2)} / ${DURATION.toFixed(0)}s`;

  const cur = st.act;
  actBtns.forEach(({ act, el, bar }) => {
    const active = act.id === cur.id;
    el.classList.toggle('active', active);
    const p = clamp((t - act.start) / (act.end - act.start));
    bar.style.width = `${(p * 100).toFixed(1)}%`;
  });

  if (ui.capBadge.dataset.act !== cur.id) syncCaption(cur);
}

function show(n) {
  if (n === shown) return;
  shown = n;
  const st = renderFrame(n);
  syncHud(st);
}

function ensureAudio() {
  if (!actx && audioBuf) {
    actx = new AudioContext();
    gainNode = actx.createGain();
    gainNode.gain.value = muted ? 0 : 1;
    gainNode.connect(actx.destination);
  }
  if (actx && actx.state === 'suspended') actx.resume();
}

function stopSound() {
  if (src) { try { src.stop(); } catch (e) {} src = null; }
}

async function play(fromStartIfPreview = false) {
  await soundReady;
  ensureAudio();
  let startFrame = shown;
  if (fromStartIfPreview && !userStarted && !P.get('t') && !P.get('frame')) {
    startFrame = 0;
    show(0);
  }
  userStarted = true;
  const startT = startFrame >= FRAMES - 1 ? 0 : Math.max(0, startFrame) / FPS;
  const now = actx ? actx.currentTime : performance.now() / 1000;
  t0 = now - startT;
  stopSound();
  if (actx && audioBuf) {
    src = actx.createBufferSource();
    src.buffer = audioBuf;
    src.connect(gainNode);
    src.start(0, startT);
  }
  playing = true;
  document.body.classList.add('playing');
  ui.play.textContent = '❚❚';
}

function pause() {
  playing = false;
  stopSound();
  document.body.classList.remove('playing');
  ui.play.textContent = '▶';
}

function jumpToAct(act) {
  userStarted = true;
  const f = Math.round(act.start * FPS);
  show(f);
  play(false);
}

function toggleMute() {
  muted = !muted;
  if (!muted) ensureAudio();
  if (gainNode) gainNode.gain.setTargetAtTime(muted ? 0 : 1, actx.currentTime, 0.03);
  ui.mute.textContent = muted ? '🔇' : '🔊';
  ui.mute.classList.toggle('off', muted);
}

function toggleCaptions() {
  const hidden = document.body.classList.toggle('no-captions');
  ui.capBtn.classList.toggle('off', hidden);
}

function toggleQuality() {
  isLow = !isLow;
  W = isLow ? 1280 : 1920;
  H = isLow ? 720 : 1080;
  post.resize(W, H);
  const t = I18N_D1[currentLang] || I18N_D1.en;
  ui.qualBtn.textContent = isLow ? t.qualLow : t.qualHigh;
  ui.qualBtn.classList.toggle('low', isLow);
  const f = shown;
  shown = -1;
  show(f);
}

function tick() {
  if (playing) {
    const now = actx ? actx.currentTime : performance.now() / 1000;
    const t = now - t0;
    if (t >= DURATION) {
      if (ui.loop.checked) {
        shown = -1;
        show(0);
        playing = false;
        play(false);
      } else {
        show(FRAMES - 1);
        pause();
      }
    } else {
      show(Math.floor(t * FPS));
    }
  }
  requestAnimationFrame(tick);
}

ui.play.onclick = () => (playing ? pause() : play(false));
ui.big.onclick = () => (playing ? pause() : play(true));
ui.mute.onclick = toggleMute;
ui.capBtn.onclick = toggleCaptions;
ui.qualBtn.onclick = toggleQuality;
ui.scrub.oninput = () => { userStarted = true; pause(); show(+ui.scrub.value); };
ui.langBtns.forEach((btn) => { btn.onclick = () => setLang(btn.dataset.lang); });

window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SET_LANG') setLang(e.data.lang);
});

addEventListener('keydown', (e) => {
  if (e.key === ' ') { e.preventDefault(); playing ? pause() : play(!userStarted); }
  if (e.key === 'ArrowRight') { userStarted = true; pause(); show(Math.min(FRAMES - 1, shown + 1)); }
  if (e.key === 'ArrowLeft') { userStarted = true; pause(); show(Math.max(0, shown - 1)); }
  if (e.key === 'm' || e.key === 'M') toggleMute();
  if (e.key === 'c' || e.key === 'C') toggleCaptions();
  if (e.key >= '1' && e.key <= '5') jumpToAct(ACTS[+e.key - 1]);
});

// Apply initial language before initial render so static UI and capsules match
setLang(currentLang, false);

// Default landing preview shows Act 4 Sacred White Elephant dramatic breach (10.7s) unless ?t= or ?frame= or ?act= is given
let first = Math.round(10.7 * FPS);
if (P.get('frame')) first = +P.get('frame');
else if (P.get('t')) first = Math.round(+P.get('t') * FPS);
else if (P.get('act')) {
  const a = ACTS[clamp(+P.get('act') - 1, 0, 4) | 0];
  if (a) first = Math.round((a.start + 0.8) * FPS);
}
show(clamp(first, 0, FRAMES - 1));

if (P.get('headless') === '1') document.body.classList.add('headless');
window.FILM = {
  FPS,
  FRAMES,
  DURATION,
  ACTS,
  I18N_D1,
  setLang,
  getLang: () => currentLang,
  renderFrame: (n) => { show(clamp(n, 0, FRAMES - 1)); return true; },
  jumpToAct: (i) => { if (ACTS[i]) jumpToAct(ACTS[i]); },
  soundReady,
};
window.FILM_READY = true;
requestAnimationFrame(tick);
