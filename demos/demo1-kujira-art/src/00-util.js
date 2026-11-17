// ---- util: deterministic helpers, story acts, and cues (16s at 24fps = 384 frames)
THREE.ColorManagement.enabled = false;
const FPS = 24, DURATION = 16, FRAMES = FPS * DURATION;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const invLerp = (a, b, x) => clamp((x - a) / (b - a));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeIn = (t, p = 2) => Math.pow(clamp(t), p);
const easeOut = (t, p = 2) => 1 - Math.pow(1 - clamp(t), p);
const deg = (d) => (d * Math.PI) / 180;
const onTwos = (t) => Math.floor(t * 12 + 1e-6) / 12;
const onThrees = (t) => Math.floor(t * 8 + 1e-6) / 8;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
class Rng {
  constructor(s) { this.r = mulberry32(s); }
  next() { return this.r(); }
  range(a, b) { return a + (b - a) * this.r(); }
}

function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, ease] = keys[i], [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const u = (ease || smooth)((t - t0) / (t1 - t0));
      return Array.isArray(v0) ? v0.map((x, j) => lerp(x, v1[j], u)) : lerp(v0, v1, u);
    }
  }
  return keys[keys.length - 1][1];
}

function spline(keys, t) {
  if (Array.isArray(keys[0][1])) return keys[0][1].map((_, c) => spline(keys.map(([kt, kv]) => [kt, kv[c]]), t));
  const n = keys.length;
  if (t <= keys[0][0]) return keys[0][1];
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 1;
  while (t > keys[i][0]) i++;
  const slope = (j) => (j === 0 || j === n - 1 ? 0 : (keys[j + 1][1] - keys[j - 1][1]) / (keys[j + 1][0] - keys[j - 1][0]));
  const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
  const h = t1 - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * h * slope(i - 1) + (3 * u2 - 2 * u3) * v1 + (u3 - u2) * h * slope(i);
}

function noise1(x, seed = 0) {
  const h = (n) => { const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453; return s - Math.floor(s); };
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
}

// 5 educational acts (16s total, trilingual: en / zh / th)
const ACTS = [
  {
    id: 'token', num: 1, start: 0.0, end: 3.0,
    accent: '#5ad2f4',
    en: {
      title: 'Token Raindrops',
      sub: 'Tokenization · Text Splitting',
      lesson: 'Lesson 1 · How AI "Reads" Text',
      desc: 'Before human language enters an AI, it is not swallowed whole—it is sliced into discrete geometric "token blocks" that fall like raindrops into the Sea of Mind, sending ripples across the water.',
    },
    zh: {
      title: '词之雨滴',
      sub: 'Tokenization · 词语切分',
      lesson: '第 1 课 · AI 如何“读懂”文字',
      desc: '人类连绵的语言进入 AI 前，不会整段吞下，而是先被切分成一颗颗独立的几何“词元积木（Token）”，落入心智之海激起涟漪。',
    },
    th: {
      title: 'หยาดฝนแห่งโทเคน',
      sub: 'Tokenization · การตัดแบ่งคำ',
      lesson: 'บทที่ 1 · AI "อ่าน" ข้อความอย่างไร',
      desc: 'ก่อนที่ภาษามนุษย์จะเข้าสู่ระบบ AI มันจะไม่ถูกกลืนลงไปทั้งประโยค แต่จะถูกตัดแบ่งเป็นบล็อกเรขาคณิตขนาดเล็กที่เรียกว่า "โทเคน (Token)" ร่วงหล่นลงสู่ทะเลแห่งจิตใจราวกับหยาดฝนจนเกิดระลอกคลื่น',
    },
  },
  {
    id: 'embed', num: 2, start: 3.0, end: 6.0,
    accent: '#78e6d0',
    en: {
      title: 'Semantic Star Sea',
      sub: 'Embedding Space · Semantic Gravity',
      lesson: 'Lesson 2 · Coordinates of Meaning',
      desc: 'AI maps every token into coordinates within a vast semantic star sea. Words with similar meanings feel "semantic gravity," drifting together to form luminous geometric constellations.',
    },
    zh: {
      title: '语义星海',
      sub: 'Embedding Space · 语义引力',
      lesson: '第 2 课 · 词语的宇宙坐标',
      desc: 'AI 把词语映射到深邃的语义星海坐标中。意思相近的词仿佛受到“语义引力”吸引，自动游聚成明亮的几何星座群落。',
    },
    th: {
      title: 'ทะเลดาวแห่งความหมาย',
      sub: 'Embedding Space · แรงโน้มถ่วงทางความหมาย',
      lesson: 'บทที่ 2 · พิกัดจักรวาลของคำศัพท์',
      desc: 'AI จะแปลงคำศัพท์ให้เป็นพิกัดในทะเลดาวแห่งความหมายอันกว้างใหญ่ คำที่มีความหมายใกล้เคียงกันจะดึงดูดเข้าหากันด้วย "แรงโน้มถ่วงทางความหมาย" และรวมตัวเป็นกลุ่มดาวเรขาคณิตอันส่องสว่าง',
    },
  },
  {
    id: 'attn', num: 3, start: 6.0, end: 9.0,
    accent: '#ffd166',
    en: {
      title: 'Attention Searchlight',
      sub: 'Self-Attention · Context Focus',
      lesson: 'Lesson 2 · Attention Mechanism',
      desc: 'Rather than treating every word equally, the AI shines a searchlight from the "Question Boat," instantly illuminating and linking the most relevant clues into a golden web of energy.',
    },
    zh: {
      title: '注意力探照灯',
      sub: 'Self-Attention · 上下文聚焦',
      lesson: '第 2 课 · 注意力机制',
      desc: 'AI 理解上下文时不会平均用力看每个词，而是由“问题小船”打出探照灯，瞬间点亮并连线最相关的核心线索，织成金色能量网。',
    },
    th: {
      title: 'สปอตไลต์ความใส่ใจ',
      sub: 'Self-Attention · การโฟกัสบริบท',
      lesson: 'บทที่ 2 · กลไกความใส่ใจ (Attention)',
      desc: 'เมื่อ AI ทำความเข้าใจบริบท มันไม่ได้ให้ความสำคัญกับทุกคำเท่ากัน แต่จะส่อง "สปอตไลต์" จากเรือแห่งคำถาม เพื่อสาดแสงและเชื่อมโยงเบาะแสที่เกี่ยวข้องที่สุดเข้าด้วยกันเป็นตาข่ายพลังงานสีทอง',
    },
  },
  {
    id: 'emerge', num: 4, start: 9.0, end: 13.0,
    accent: '#ffa25b',
    en: {
      title: 'Whale of Emergence',
      sub: 'Emergence & Generation · Leap of Intelligence',
      lesson: 'Lesson 5 · When Scale Becomes Insight',
      desc: 'When tens of billions of connections and probabilities resonate to a tipping point in the deep, the large model breaches like a majestic humpback whale—rising in spray and seabirds to deliver a brilliant answer.',
    },
    zh: {
      title: '涌现之鲸',
      sub: 'Emergence & Generation · 智慧涌现',
      lesson: '第 5 课 · 量变引发的智慧质变',
      desc: '当百亿级连接与概率在深海共振到临界点，大模型便如一头宏伟的座头鲸破海跃起，携漫天水珠与飞鸟给出惊艳的回答。',
    },
    th: {
      title: 'วาฬแห่งการอุบัติ',
      sub: 'Emergence & Generation · ปัญญาที่อุบัติขึ้น',
      lesson: 'บทที่ 5 · การก้าวกระโดดทางปัญญาจากขนาดมหึมา',
      desc: 'เมื่อการเชื่อมโยงและความน่าจะเป็นนับหมื่นล้านจุดสั่นพ้องถึงจุดวิกฤตใต้ทะเลลึก โมเดลขนาดใหญ่จะพุ่งทะยานขึ้นเหนือผิวน้ำราวกับวาฬหลังค่อมผู้ยิ่งใหญ่ พร้อมละอองน้ำและฝูงนกเพื่อมอบคำตอบอันน่าทึ่ง',
    },
  },
  {
    id: 'steer', num: 5, start: 13.0, end: 16.0,
    accent: '#ffe082',
    en: {
      title: 'Steering the Future',
      sub: 'Human Agency · You Are the Captain',
      lesson: 'Lesson 5 · Questioner & Navigator',
      desc: 'AI is the mighty whale surging beneath the waves with vast computing power; yet raising the sails, asking meaningful questions, and charting the course to new horizons will always belong to you at the helm.',
    },
    zh: {
      title: '掌舵未来',
      sub: 'Human Agency · 人类是船长',
      lesson: '第 5 课 · 提问者与领航员',
      desc: 'AI 是潜行深海、提供澎湃算力的巨鲸；而扬起风帆、提出有价值好问题并决定驶向何方新大陆的，永远是掌舵的你。',
    },
    th: {
      title: 'กุมหางเสือสู่อนาคต',
      sub: 'Human Agency · มนุษย์คือกัปตัน',
      lesson: 'บทที่ 5 · ผู้ตั้งคำถามและผู้นำทาง',
      desc: 'AI เปรียบเสมือนวาฬยักษ์ที่แหวกว่ายใต้ท้องทะเลและมอบพลังการประมวลผลอันมหาศาล แต่ผู้ที่กางใบเรือ ตั้งคำถามที่มีคุณค่า และกุมหางเสือนำทางสู่ดินแดนใหม่ย่อมเป็นคุณเสมอ',
    },
  },
];

// Trilingual UI dictionary for Demo 1
const I18N_D1 = {
  en: {
    pageTitle: 'The Sea of Mind · From Word Stardust to the Whale of Emergence (AI Hand-Painted Film)',
    brandTag: 'The Sea of Mind · AI Odyssey',
    bigTitle: 'Play from start (Space)',
    bigHint: 'Click to start the AI Odyssey (with real-time synthesized music · 16s)',
    capBtn: '📖 Captions',
    capTitle: 'Show/Hide Teaching Captions (C)',
    muteTitle: 'Mute / Unmute Audio (M)',
    qualHigh: 'HD 1080p',
    qualLow: 'Eco 720p',
    qualTitle: 'Switch Render Resolution',
    playTitle: 'Play / Pause (Space)',
    scrubTitle: 'Drag or use ← → to step frame by frame',
    loopLabel: 'Loop',
    actTip: (num, title, start, end) => `Jump to Act ${num}: ${title} (${start}-${end}s)`,
  },
  zh: {
    pageTitle: '心智之海 · 从词语星尘到涌现之鲸（AI 科普手绘动画）',
    brandTag: '心智之海 · The Sea of Mind',
    bigTitle: '从头播放（空格）',
    bigHint: '点击开启 AI 科普之旅（含实时合成音乐 · 16s）',
    capBtn: '📖 解说词',
    capTitle: '显示/隐藏教学解说词 (C)',
    muteTitle: '开启/静音声音 (M)',
    qualHigh: '标准 1080p',
    qualLow: '低功耗 720p',
    qualTitle: '切换渲染分辨率',
    playTitle: '播放 / 暂停（空格）',
    scrubTitle: '拖动或使用 ← → 逐帧',
    loopLabel: '循环',
    actTip: (num, title, start, end) => `跳转到第 ${num} 幕：${title} (${start}-${end}s)`,
  },
  th: {
    pageTitle: 'ทะเลแห่งจิตใจ · จากละอองดาวคำศัพท์สู่วาฬแห่งการอุบัติ (แอนิเมชันวาดมือ AI)',
    brandTag: 'ทะเลแห่งจิตใจ · The Sea of Mind',
    bigTitle: 'เล่นจากเริ่มต้น (Spacebar)',
    bigHint: 'คลิกเพื่อเริ่มการเดินทางเรียนรู้ AI (พร้อมดนตรีสังเคราะห์แบบเรียลไทม์ · 16 วิ)',
    capBtn: '📖 คำบรรยาย',
    capTitle: 'แสดง/ซ่อนคำบรรยายประกอบการสอน (C)',
    muteTitle: 'เปิด/ปิดเสียง (M)',
    qualHigh: 'คมชัด 1080p',
    qualLow: 'ประหยัด 720p',
    qualTitle: 'สลับความละเอียดการเรนเดอร์',
    playTitle: 'เล่น / หยุดชั่วคราว (Spacebar)',
    scrubTitle: 'ลากหรือใช้ปุ่ม ← → เพื่อดูทีละเฟรม',
    loopLabel: 'วนซ้ำ',
    actTip: (num, title, start, end) => `ข้ามไปยังองก์ที่ ${num}: ${title} (${start}-${end}s)`,
  },
};

const actAt = (t) => ACTS.find((a) => t < a.end) || ACTS[ACTS.length - 1];

// story beats (film seconds); picture & audio both sync to these exact timestamps
const CUES = {
  rainStart: 0.15, rainEnd: 2.75,
  clusterStart: 3.1, clusterPull: 3.45, clusterEnd: 5.8,
  beamStart: 6.05, beamLock: 6.75, vortexStart: 8.1,
  bulge: 9.0, call: 9.15, breach: 9.6, apex: 10.8, crash: 12.0,
  sailRaise: 13.05, sailFull: 13.85, end: 16.0,
};

function shaderMat(vs, fs, uniforms, opts = {}) {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: GLSL[vs],
    fragmentShader: GLSL[fs],
    uniforms,
    ...opts,
  });
}
