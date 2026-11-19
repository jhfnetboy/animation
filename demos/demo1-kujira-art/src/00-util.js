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

// 5 educational acts (16s total, trilingual: en / zh / th) — Lanna River of Mind
const ACTS = [
  {
    id: 'token', num: 1, start: 0.0, end: 3.0,
    accent: '#5ad2f4',
    en: {
      title: 'Krathong Word Sparks',
      sub: 'Tokenization · Krathong Cut',
      lesson: 'Lesson 1 · How AI "Reads" Text',
      desc: 'Like glowing lotus Krathong lanterns placed onto Chiang Mai’s Ping River during Loy Krathong, continuous human speech is gently cut into discrete, luminous token blocks that drift across the water.',
    },
    zh: {
      title: '水灯词韵',
      sub: '词语切分 · 水灯入河',
      lesson: '第 1 课 · AI 如何“读懂”文字',
      desc: '清迈水灯节的夜晚，一盏盏发光的莲花水灯（Krathong）缓缓落入湄平河——就像人类连绵的语句被切分为一个个独立的 Token 积木，在水面荡开思维的第一圈涟漪。',
    },
    th: {
      title: 'กระทงแห่งถ้อยคำ',
      sub: 'การตัดคำ · กระทงลงสายน้ำ',
      lesson: 'บทที่ 1 · AI "อ่าน" ข้อความอย่างไร',
      desc: 'ดุจกระทงดอกบัวที่ส่องสว่างเมื่อถูกปล่อยลงสู่สายน้ำปิงในเทศกาลยี่เป็ง ถ้อยคำอันต่อเนื่องของมนุษย์จะถูกตัดแบ่งเป็น "โทเคน (Token)" ทีละชิ้นอย่างประณีตเพื่อเริ่มการเรียนรู้',
    },
  },
  {
    id: 'embed', num: 2, start: 3.0, end: 6.0,
    accent: '#78e6d0',
    en: {
      title: 'Yi Peng Star Clusters',
      sub: 'Embedding Space · Khom Loi',
      lesson: 'Lesson 2 · Coordinates of Meaning',
      desc: 'Warm Khom Loi sky lanterns rising over the Yi Peng night sky answer to semantic gravity—kindred meanings drift together and gather into luminous high-dimensional constellations.',
    },
    zh: {
      title: '天灯星群',
      sub: '语义星海 · 孔明灯聚',
      lesson: '第 2 课 · 词语的宇宙坐标',
      desc: '清迈万人天灯节升起的温暖灯火（Khom Loi）受到语义引力的牵引，意思相近的词元彼此吸引、自动聚拢，在夜空与河影间排布成高维星座群落。',
    },
    th: {
      title: 'กลุ่มดาวโคมยี่เป็ง',
      sub: 'พิกัดความหมาย · โคมยี่เป็ง',
      lesson: 'บทที่ 2 · พิกัดจักรวาลของคำศัพท์',
      desc: 'โคมยี่เป็งนับพันที่ลอยขึ้นสู่ฟากฟ้าเชียงใหม่เปรียบเสมือนพิกัดในปริภูมิความหมาย คำที่มีความหมายใกล้เคียงจะดึงดูดเข้าหากันด้วยแรงโน้มถ่วงทางความคิดจนรวมเป็นกลุ่มดาวอันเรืองรอง',
    },
  },
  {
    id: 'attn', num: 3, start: 6.0, end: 9.0,
    accent: '#ffd166',
    en: {
      title: 'Golden Lotus Searchlight',
      sub: 'Self-Attention · Lotus Beam',
      lesson: 'Lesson 2 · Attention Mechanism',
      desc: 'A nine-petaled golden lotus lantern at the prow of a Lanna longtail boat pierces the river mist, illuminating and linking the most relevant Krathong and Khom Loi into a golden mandala web.',
    },
    zh: {
      title: '金莲慧光',
      sub: '注意力机制 · 慧光连线',
      lesson: '第 2 课 · 注意力机制',
      desc: '泰式长尾船船头的九瓣金莲灯穿透水雾，将目光精准点亮并连结最相关的水灯与天灯线索，织就璀璨夺目的金色曼陀罗能量网。',
    },
    th: {
      title: 'แสงบัวทองแห่งความใส่ใจ',
      sub: 'กลไกความใส่ใจ · แสงบัวทอง',
      lesson: 'บทที่ 2 · กลไกความใส่ใจ (Attention)',
      desc: 'โคมบัวทองเก้ากลีบที่หัวเรือหางยาวสาดส่องทะลุหมอกน้ำปิง เพื่อเลือกเชื่อมโยงเฉพาะกระทงและโคมยี่เป็งที่สำคัญที่สุดเข้าด้วยกันเป็นตาข่ายมันดาลาสีทองอันทรงพลัง',
    },
  },
  {
    id: 'emerge', num: 4, start: 9.0, end: 13.0,
    accent: '#ffa25b',
    en: {
      title: 'Sacred White Elephant',
      sub: 'Emergence · Chang Phueak',
      lesson: 'Lesson 5 · When Scale Becomes Insight',
      desc: 'When tens of billions of connections resonate inside the golden lotus vortex, the auspicious Lanna Sacred White Elephant (Chang Phueak) breaches the river with raised trunk and luminous spray—delivering a brilliant answer.',
    },
    zh: {
      title: '白象醒觉',
      sub: '智慧涌现 · 瑞象腾空',
      lesson: '第 5 课 · 量变引发的智慧质变',
      desc: '当百亿级连接在河心金莲漩涡中蓄满共振，象征智慧与吉祥的兰纳神圣白象（Chang Phueak）破水跃起、长鼻扬水长鸣，给出惊艳答案！',
    },
    th: {
      title: 'ช้างเผือกแห่งปัญญาอุบัติ',
      sub: 'ปัญญาอุบัติใหม่ · ช้างเผือก',
      lesson: 'บทที่ 5 · การก้าวกระโดดทางปัญญาจากขนาดมหึมา',
      desc: 'เมื่อสายใยความหมายนับหมื่นล้านเส้นสั่นพ้องถึงขีดสุดกลางวังน้ำวนบัวทอง ช้างเผือกมงคลแห่งล้านนาจึงพุ่งทะยานขึ้นเหนือสายน้ำ ชูงวงก้องคำรามกังวานเพื่อมอบคำตอบอันน่าอัศจรรย์',
    },
  },
  {
    id: 'steer', num: 5, start: 13.0, end: 16.0,
    accent: '#ffe082',
    en: {
      title: 'Sailing to Doi Suthep',
      sub: 'Human Agency · Your Compass',
      lesson: 'Lesson 5 · Questioner & Navigator',
      desc: 'The Sacred White Elephant surges beneath the currents as vast computing power; yet unfurling the golden Lanna silk sail and steering toward Doi Suthep’s golden chedi will always belong to you.',
    },
    zh: {
      title: '兰纳领航',
      sub: '人类掌舵 · 驶向素贴山',
      lesson: '第 5 课 · 提问者与领航员',
      desc: '神圣白象是深水中托举澎湃算力的引擎；而扬起兰纳金纹丝帆、提出好问题并驶向素贴山金佛塔与新天地的，永远是掌舵的你。',
    },
    th: {
      title: 'กุมหางเสือสู่ดอยสุเทพ',
      sub: 'มนุษย์คือกัปตัน · สู่ดอยสุเทพ',
      lesson: 'บทที่ 5 · ผู้ตั้งคำถามและผู้นำทาง',
      desc: 'ช้างเผือกศักดิ์สิทธิ์คือขุมพลังแห่งการประมวลผลใต้สายน้ำ แต่ผู้ที่กางใบเรือผ้าไหมลายคำแห่งล้านนา ตั้งคำถามอันทรงคุณค่า และกุมหางเสือมุ่งหน้าสู่พระธาตุดอยสุเทพย่อมเป็นคุณเสมอ',
    },
  },
];

// Trilingual UI dictionary for Demo 1 — Lanna River of Mind
const I18N_D1 = {
  en: {
    pageTitle: 'Lanna River of Mind · From Krathong Sparks to the Sacred White Elephant (AI Hand-Painted Film)',
    brandTag: 'Lanna River of Mind · Krathong to White Elephant',
    bigTitle: 'Play from start (Space)',
    bigHint: 'Click to start Lanna River of Mind (with real-time Lanna music · 16s)',
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
    pageTitle: '兰纳心智之河 · 从水灯天灯到觉醒白象（AI 科普手绘动画）',
    brandTag: '兰纳心智之河 · 水灯至白象',
    bigTitle: '从头播放（空格）',
    bigHint: '点击开启《兰纳心智之河》科普之旅（含实时兰纳配乐 · 16s）',
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
    pageTitle: 'สายน้ำแห่งปัญญาล้านนา · จากกระทงสู่ช้างเผือก (แอนิเมชันวาดมือ AI)',
    brandTag: 'สายน้ำแห่งปัญญาล้านนา · กระทงสู่ช้างเผือก',
    bigTitle: 'เล่นจากเริ่มต้น (Spacebar)',
    bigHint: 'คลิกเพื่อเริ่มชมสายน้ำแห่งปัญญาล้านนา (พร้อมดนตรีล้านนาสังเคราะห์ · 16 วิ)',
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
