import type {
  Lang,
  CourseMode,
  RepMode,
  BeatSpec,
  CitationItem,
} from '../types';

export type { Lang, CourseMode, RepMode, BeatSpec, CitationItem } from '../types';

export interface AiPresetSpec {
  id: string;
  label: Record<Lang, string>;
  prompt: Record<Lang, string>;
}

export interface UiDictionary {
  appTitle: string;
  appSubtitle: string;
  modeLabels: Record<CourseMode, string>;
  repLabels: Record<RepMode, string>;
  repDescriptions: Record<RepMode, string>;
  controls: {
    play: string;
    pause: string;
    prev: string;
    next: string;
    reset: string;
    replay: string;
    mute: string;
    unmute: string;
    timelineLabel: string;
    sceneLabel: string;
    mechanismLabel: string;
    citationsLabel: string;
    pdbBadge: string;
    openCitation: string;
    languageLabel: string;
  };
  aiLab: {
    panelTitle: string;
    panelSubtitle: string;
    protocolBadge: string;
    apiKeyLabel: string;
    apiKeyPlaceholder: string;
    apiKeyHint: string;
    promptPlaceholder: string;
    sendButton: string;
    sendingButton: string;
    clearObjectsButton: string;
    sourceGemini: string;
    sourceOffline: string;
    objectsCountLabel: string;
    presetsTitle: string;
    protocolJsonTitle: string;
    emptyCanvasHint: string;
  };
  disclaimer: string;
  presets: AiPresetSpec[];
}

export const BEATS_1MIN: BeatSpec[] = [
  {
    id: '1m-beat-1-peptide-bond',
    start: 0,
    end: 15,
    sceneIdx: 0,
    badge: {
      en: '00–15s · Atom to Peptide Bond',
      zh: '00–15s · 原子与平面肽键',
      th: '00–15 วิ · พันธะเพปไทด์ระนาบเดียว',
    },
    title: {
      en: 'Dehydration Synthesis & the Planar Peptide Bond',
      zh: '氨基酸脱水缩合与刚性平面肽键',
      th: 'การสังเคราะห์แบบดีไฮเดรชันและพันธะเพปไทด์',
    },
    subtitle: {
      en: 'N-terminal −NH₂ + C-terminal −COOH → −CO−NH− + H₂O (ω ≈ 180°)',
      zh: 'N端 −NH₂ + C端 −COOH → −CO−NH− + H₂O（共轭限制 ω ≈ 180°）',
      th: 'หมู่ −NH₂ + −COOH → −CO−NH− + H₂O (มุมทอร์ชัน ω ≈ 180°)',
    },
    narration: {
      en: 'Every peptide begins when the amino group (−NH₂) of one amino acid attacks the carboxyl group (−COOH) of the next, releasing one water molecule (H₂O). Resonance between C=O and C−N gives the peptide bond ~40% double-bond character, locking six backbone atoms into a rigid trans plane (ω ≈ 180°).',
      zh: '生命序列的起点，是前一个氨基酸的羧基（−COOH）与后一个氨基酸的氨基（−NH₂）脱去一分子水（H₂O），形成 −CO−NH− 肽键。由于羰基氧与氮孤对电子共轭，C−N 键具备约 40% 双键性质，把六个主链原子死死锁在一个 ω ≈ 180° 的刚性反式平面内。',
      th: 'เพปไทด์เริ่มต้นเมื่อหมู่ −NH₂ ของกรดอะมิโนตัวหนึ่งเชื่อมกับหมู่ −COOH ของอีกตัว พร้อมปล่อยน้ำ H₂O ออก 1 โมเลกุล ปรากฏการณ์เรโซแนนซ์ทำให้พันธะ C−N มีลักษณะพันธะคู่ราว 40% จึงล็อกอะตอมหลัก 6 ตัวให้อยู่ในระนาบแบนแบบ trans (ω ≈ 180°)',
    },
    mechanism: {
      en: 'Only φ (N–Cα) and ψ (Cα–C) dihedral angles rotate freely; peptide bond ω stays rigid at ~180° (1.32 Å C–N length).',
      zh: '仅 Cα 两侧的 φ、ψ 二面角可自由旋转；肽键 ω 角稳定于 ~180°（C−N 键长缩短至 1.32 Å）。',
      th: 'หมุนได้เฉพาะมุม φ และ ψ รอบคาร์บอน Cα ส่วนพันธะเพปไทด์ C−N ยาว 1.32 Å และแข็งเกร็งในระนาบเดียวกัน',
    },
    citationIds: ['merrifield-1963'],
  },
  {
    id: '1m-beat-2-helix-fda-ruler',
    start: 15,
    end: 30,
    sceneIdx: 1,
    badge: {
      en: '15–30s · Folding & FDA 40-AA Ruler',
      zh: '15–30s · 螺旋折叠与 40 氨基酸标尺',
      th: '15–30 วิ · เกลียวแอลฟาและเกณฑ์ 40 AA ของ FDA',
    },
    title: {
      en: 'α-Helix Geometry & the FDA 40-Amino-Acid Boundary',
      zh: 'α-螺旋折叠与 FDA 40 氨基酸法定分界尺',
      th: 'โครงสร้างเกลียวแอลฟาและเส้นแบ่ง 40 กรดอะมิโนของ US FDA',
    },
    subtitle: {
      en: '3.6 AA/turn · 5.4 Å pitch · 3 AA Collagen vs 31 AA Semaglutide (NDA) vs 51 AA Insulin (BLA)',
      zh: '3.6 残基/圈 · 螺距 5.4 Å · 3 AA 胶原三肽 vs 31 AA 司美格鲁肽 NDA vs 51 AA 胰岛素 BLA',
      th: '3.6 AA/รอบ · ระยะเกลียว 5.4 Å · ไตรเพปไทด์ 3 AA vs เซมากลูไทด์ 31 AA (NDA) vs อินซูลิน 51 AA (BLA)',
    },
    narration: {
      en: 'As the chain lengthens, carbonyl C=O of residue i hydrogen-bonds with amide N−H of residue i+4, coiling into an α-helix with 3.6 residues per turn and a 5.4 Å pitch. Under FDA rule 85 FR 10057 (2020), ≤40 AA polymers such as 31-AA Semaglutide follow the NDA drug path, whereas >40 AA polymers such as 51-AA Insulin are regulated as biologics (BLA).',
      zh: '链长延伸后，第 i 位残基的 C=O 与第 i+4 位的 N−H 形成链内氢键，盘绕成每圈 3.6 个氨基酸、螺距 5.4 Å 的 α-螺旋。按美国 FDA 2020 年 85 FR 10057 规则：≤40 AA（如 3 AA 胶原三肽、31 AA 司美格鲁肽）属化学合成多肽 NDA 路径，而 >40 AA（如 51 AA 胰岛素）则归为生物制品 BLA 路径。',
      th: 'พันธะไฮโดรเจนระหว่างตำแหน่ง i กับ i+4 ม้วนสายเพปไทด์เป็นเกลียวแอลฟา (3.6 AA ต่อรอบ ระยะเกลียว 5.4 Å) ตามกฎ US FDA 85 FR 10057 (2020) สายที่ยาว ≤40 AA เช่น Semaglutide (31 AA) จัดเป็นยาเคมี (NDA) ส่วน >40 AA เช่น อินซูลิน (51 AA) จัดเป็นชีววัตถุ (BLA)',
    },
    mechanism: {
      en: '3.6 AA/turn · 5.4 Å helical pitch · i → i+4 N–H···O=C H-bonds · Bright-line statutory threshold: 40 AA.',
      zh: '3.6 氨基酸/圈 · 5.4 Å 螺距 · i → i+4 氢键稳定 · 法规硬界线：40 个 α-氨基酸。',
      th: '3.6 AA/รอบ · ระยะเกลียว 5.4 Å · พันธะไฮโดรเจน i → i+4 · เกณฑ์กฎหมาย FDA: >40 AA คือโปรตีน/ชีววัตถุ',
    },
    citationIds: ['fda-85fr10057', 'lau-2015-semaglutide'],
  },
  {
    id: '1m-beat-3-dpp4-armor',
    start: 30,
    end: 45,
    sceneIdx: 2,
    badge: {
      en: '30–45s · DPP-4 Battle & Albumin Hitchhiking',
      zh: '30–45s · DPP-4 酶解攻防与长效巡航',
      th: '30–45 วิ · เกราะกันเอนไซม์ DPP-4 และจับอัลบูมิน',
    },
    title: {
      en: '2-Minute Cleavage vs Aib8 Armor & Lys26 C18 Albumin Anchor',
      zh: '2 分钟酶切魔咒 vs Aib8 护甲与 Lys26 C18 白蛋白锚定',
      th: 'ครึ่งชีวิต 2 นาที vs การดัดแปลง Aib8 และสายไขมัน C18 ที่ Lys26',
    },
    subtitle: {
      en: 'Native GLP-1 Ala8–Glu9 shear (<2 min) vs Semaglutide Aib8 + C18 diacid (~165 h/week)',
      zh: '天然 GLP-1 Ala8–Glu9 剪断（<2 分钟）vs 司美格鲁肽 Aib8 护甲与 C18 脂链（~165 小时/周）',
      th: 'GLP-1 ถูกตัดที่ Ala8–Glu9 (<2 นาที) vs Semaglutide Aib8 + C18 จับอัลบูมิน (~165 ชม./สัปดาห์)',
    },
    narration: {
      en: 'Native GLP-1 survives under 2 minutes in plasma because DPP-4 shears the Ala8–Glu9 bond. Semaglutide (PDB 4ZGM) swaps Ala8 for bulky α-aminoisobutyric acid (Aib8) to block DPP-4 and attaches a C18 fatty diacid at Lys26 that reversibly binds human serum albumin—extending half-life to ~165 hours (~1 week).',
      zh: '天然 GLP-1 在血液中半衰期不足 2 分钟，全因 DPP-4 酶精准剪断 Ala8–Glu9 肽键。司美格鲁肽（PDB 4ZGM）在 8 位换上空间位阻极大的 Aib8（α-氨基异丁酸）当护甲，并在 Lys26 挂载 C18 二羧酸脂肪酸链可逆锚定血清白蛋白，将半衰期拉长至约 165 小时，实现每周仅需一针。',
      th: 'GLP-1 ธรรมชาติสลายในเลือดภายในไม่ถึง 2 นาที เพราะเอนไซม์ DPP-4 ตัดตรง Ala8–Glu9 จึงมีการเปลี่ยนเป็น Aib8 เพื่อกันเอนไซม์ และต่อสายกรดไขมัน C18 diacid ที่ Lys26 (PDB 4ZGM) เพื่อจับกับอัลบูมินในซีรัม ยืดครึ่งชีวิตเป็น ~165 ชั่วโมง (ฉีดสัปดาห์ละครั้ง)',
    },
    mechanism: {
      en: 'Native GLP-1 t½ < 2 min (Ala8–Glu9 cleavage) → Semaglutide Aib8 + Arg34 + Lys26(γ-Glu-2xOEG-C18 diacid) t½ ≈ 165 h.',
      zh: '天然 GLP-1 t½ < 2 分钟 → 司美格鲁肽 Aib8 抗酶解 + Lys26 连接 C18 二酸可逆结合 HSA 白蛋白（t½ ≈ 165 小时）。',
      th: 'GLP-1 ธรรมชาติ t½ < 2 นาที → Semaglutide (Aib8 + C18 diacid ที่ Lys26) จับอัลบูมินแบบผันกลับได้ t½ ≈ 165 ชม.',
    },
    citationIds: ['lau-2015-semaglutide', 'coskun-2018-tirzepatide'],
  },
  {
    id: '1m-beat-4-gpcr-organs',
    start: 45,
    end: 60,
    sceneIdx: 3,
    badge: {
      en: '45–60s · GPCR 5VAI & 4 Target Organs',
      zh: '45–60s · GPCR 钥匙开锁与四大靶器官',
      th: '45–60 วิ · ตัวรับ GPCR (5VAI) และ 4 อวัยวะเป้าหมาย',
    },
    title: {
      en: 'Class B GPCR Activation (PDB 5VAI), TM6 Swing & cAMP Burst',
      zh: '跨膜 GPCR（5VAI）TM6 外摆、Gs 激活与人体多靶点响应',
      th: 'การเปิดสวิตช์ GPCR (PDB 5VAI), TM6 กางออก และสัญญาณ cAMP',
    },
    subtitle: {
      en: 'PDB 5VAI TM6 outward kink → Gs α5 docking → cAMP wave in pancreas, brain, heart & skin',
      zh: 'PDB 5VAI TM6 外摆 → Gs 偶联爆发 cAMP → 点亮胰腺 β 细胞、下丘脑、心血管与真皮对照',
      th: 'PDB 5VAI TM6 กางออก → โปรตีน Gs & cAMP → ตับอ่อน สมอง หัวใจ และชั้นผิวหนัง',
    },
    narration: {
      en: 'Cryo-EM structure PDB 5VAI captures GLP-1 clasped between the receptor NTD and transmembrane core, triggering a sharp outward kink in TM6. This opens the intracellular cavity for Gs protein docking, sparking an intracellular cAMP surge that signals pancreatic β-cells, hypothalamic satiety centers, cardiovascular tissue, while contrasting dermal barrier limits.',
      zh: '冷冻电镜结构 PDB 5VAI 揭示了 GLP-1 插入受体胞外域与 7 次跨膜核心后，诱导第 6 跨膜螺旋（TM6）剧烈折弯外摆。这一机械位移接纳 Gs 蛋白并引爆第二信使 cAMP 瀑布，点亮胰腺 β 细胞促胰岛素分泌、下丘脑饱腹中枢与心血管保护，同时对比外源大分子在真皮层的渗透屏障。',
      th: 'โครงสร้างไครโออีเอ็ม PDB 5VAI แสดงการจับของ GLP-1 ที่ผลักให้เกลียว TM6 งอและกางออก เปิดช่องรับโปรตีน Gs กระตุ้นการพุ่งขึ้นของ cAMP ส่งสัญญาณสู่เบต้าเซลล์ตับอ่อน ศูนย์อิ่มในไฮโปทาลามัส ระบบหัวใจและหลอดเลือด และเปรียบเทียบข้อจำกัดการซึมผ่านชั้นผิวหนัง',
    },
    mechanism: {
      en: 'Two-domain clasp (NTD + TM core) → TM6 outward kink → Gs α5 docking → Adenylyl cyclase → cAMP cascade.',
      zh: '胞外域与跨膜核心双点钳夹 → TM6 向外弯折 → Gs 偶联 → 腺苷酸环化酶激活 → cAMP 信号爆发。',
      th: 'การจับสองโดเมน → TM6 กางออก → โปรตีน Gs จับกับโพรงด้านใน → เอนไซม์สร้าง cAMP เพิ่มระดับในเซลล์เป้าหมาย',
    },
    citationIds: ['zhang-2017-5vai', 'myung-2025-collagen'],
  },
];

export const BEATS_3MIN: BeatSpec[] = [
  {
    id: '3m-ch1-amino-chirality',
    start: 0,
    end: 36,
    sceneIdx: 0,
    badge: {
      en: 'Ch.1 · 00–36s · Chirality & Planar Bond',
      zh: '第1章 · 00–36s · 手性骨架与共轭平面',
      th: 'บทที่ 1 · 00–36 วิ · ไครัลลิตีและระนาบพันธะเพปไทด์',
    },
    title: {
      en: 'Amino Acid Chirality, Zwitterions & the Conjugated Peptide Plane',
      zh: '氨基酸结构、L-型手性与共轭刚性平面肽键',
      th: 'โครงสร้างกรดอะมิโน ไครัลลิตีชนิด L และพันธะเพปไทด์กึ่งคู่',
    },
    subtitle: {
      en: 'Tetrahedral L-Cα stereocenters + p-π conjugation locking ω ≈ 180°',
      zh: 'Cα 四面体手性中心 + 酰胺 p-π 共轭强制锁定 ω ≈ 180° 反式平面',
      th: 'ศูนย์กลางไครัลแบบ L-Cα + การคอนจูเกต p-π ล็อกมุม ω ≈ 180°',
    },
    narration: {
      en: 'Nineteen of the twenty canonical proteinogenic amino acids (all except achiral glycine) have a chiral α-carbon in the L-configuration. At physiological pH ~7.4, free amino acids exist as zwitterions (−NH₃⁺ and −COO⁻). When two residues condense, electron delocalization across O=C–N shortens the C–N bond to ~1.32 Å, preventing free rotation around ω.',
      zh: '除甘氨酸外，构成天然蛋白质的 19 种编码氨基酸均在中心 Cα 处呈 L-型手性构型；生理 pH 7.4 下它们以 −NH₃⁺ 与 −COO⁻ 两性离子存在。脱水缩合后，羰基与氮原子形成 p-π 共轭，将 C−N 键长压缩至约 1.32 Å 并赋予约 40% 双键性，迫使 ω 角锁定在 180° 反式构象，为后续三维折叠奠定几何刚性。',
      th: 'กรดอะมิโนมาตรฐาน 19 ชนิด (ยกเว้นไกลซีน) มีโครงสร้างแบบ L-configuration ที่คาร์บอน Cα เมื่อรวมตัวกันเป็นสายเพปไทด์ อิเล็กตรอนคู่โดดเดี่ยวของไนโตรเจนจะคอนจูเกตกับหมู่ C=O ทำให้พันธะ C−N สั้นลงเหลือ 1.32 Å และล็อกระนาบ ω ไว้ที่ ~180° เป็นรากฐานให้โปรตีนพับตัวได้แม่นยำ',
    },
    mechanism: {
      en: 'L-amino acid backbone (N–Cα–C) · C–N bond 1.32 Å (~40% double-bond character) · Trans ω ≈ 180° avoids steric clash.',
      zh: 'L-型主链重复单元（N–Cα–C）· C–N 键长 1.32 Å 具 40% 双键性 · 反式 ω ≈ 180° 最大化避开侧链空间冲突。',
      th: 'แกนหลัก L-กรดอะมิโน · พันธะ C–N ยาว 1.32 Å มีความเป็นพันธะคู่ ~40% · แบบ trans ω ≈ 180° ลดการชนกันของหมู่ข้าง',
    },
    citationIds: ['merrifield-1963'],
  },
  {
    id: '3m-ch2-fda-spps',
    start: 36,
    end: 72,
    sceneIdx: 1,
    badge: {
      en: 'Ch.2 · 36–72s · 40-AA Rule & SPPS',
      zh: '第2章 · 36–72s · 40AA 边界与固相合成',
      th: 'บทที่ 2 · 36–72 วิ · เส้นแบ่ง 40 AA และการสังเคราะห์ SPPS',
    },
    title: {
      en: 'From Peptides to Proteins: FDA 85 FR 10057 & Merrifield SPPS',
      zh: '从短肽到蛋白质：FDA 40 AA 法定边界与 SPPS 固相合成',
      th: 'จากเพปไทด์สู่โปรตีน: กฎ FDA 85 FR 10057 และเรซิน SPPS',
    },
    subtitle: {
      en: '≤40 AA Synthetic Drug vs >40 AA Biologic + Merrifield 1963 Resin Coupling & Modern TIDES CDMO',
      zh: '≤40 AA 化学多肽 vs >40 AA 生物制品 · Merrifield 1963 树脂偶联至现代 WuXi TIDES 规模化制造',
      th: '≤40 AA ยาเคมี vs >40 AA ชีววัตถุ + เรซินของ Merrifield (1963) สู่การผลิต CDMO ยุคใหม่',
    },
    narration: {
      en: 'Inside the cell, α-helices (3.6 AA/turn, 5.4 Å) fold via i→i+4 hydrogen bonds. In regulation, FDA rule 85 FR 10057 draws a bright line at 40 amino acids: 31-AA Semaglutide is a synthetic peptide drug, while 51-AA Insulin is a biologic. In manufacturing, R. B. Merrifield (1963) anchored the C-terminus onto insoluble polymer resin beads for cyclic deprotection and coupling—a principle scaled today by automated TIDES CDMOs such as WuXi TIDES.',
      zh: '当肽链通过 i→i+4 氢键盘绕成 3.6 AA/圈、5.4 Å 螺距的 α-螺旋，链长不仅决定功能，也决定法律身份：FDA 2020 年 85 FR 10057 将“大于 40 个氨基酸”正式界定为蛋白质/生物制品，使 31 AA 司美格鲁肽走化学药路径，而 51 AA 胰岛素归入生物制品。化学制造上，Merrifield（1963）发明的固相合成（SPPS）将 C 端锚定在不溶性树脂微球上循环偶联，如今已发展为如 WuXi TIDES 等现代化 CDMO 的万吨级自动化产线。',
      th: 'กฎ US FDA 85 FR 10057 (2020) กำหนดให้พอลิเมอร์กรดอะมิโนที่ยาวเกิน 40 ตัวเป็นโปรตีน (ชีววัตถุ) จึงแยกอินซูลิน (51 AA) ออกจากเซมากลูไทด์ (31 AA) ส่วนฝั่งเคมีอุตสาหกรรม รางวัลโนเบลของ R. B. Merrifield (1963) ใช้เม็ดเรซินโพลิเมอร์ยึดปลาย C เพื่อสังเคราะห์ทีละกรดอะมิโนแบบวัฏจักร ซึ่งต่อยอดสู่โรงงาน TIDES CDMO สมัยใหม่อย่าง WuXi TIDES',
    },
    mechanism: {
      en: 'FDA 85 FR 10057 (>40 AA = protein/biologic) · SPPS cycle: Resin Anchor → Deprotect (Fmoc) → Couple next AA → Cleave & RP-HPLC purify.',
      zh: 'FDA 85 FR 10057（>40 AA 即蛋白/生物制品）· SPPS 循环：树脂锚定 → 脱 Fmoc 保护 → 缩合偶联 → 裂解与反相液相纯化。',
      th: 'FDA 85 FR 10057 (>40 AA = โปรตีน/ชีววัตถุ) · วัฏจักร SPPS: ยึดเรซิน → ปลดหมู่ปกป้อง Fmoc → เชื่อมกรดอะมิโน → ตัดสายและทำให้บริสุทธิ์',
    },
    citationIds: ['fda-85fr10057', 'merrifield-1963'],
  },
  {
    id: '3m-ch3-engineered-vs-skincare',
    start: 72,
    end: 112,
    sceneIdx: 2,
    badge: {
      en: 'Ch.3 · 72–112s · Drug Engineering vs Skincare & Thai FDA',
      zh: '第3章 · 72–112s · 制药改造 vs 护肤肽实证与泰药监区分',
      th: 'บทที่ 3 · 72–112 วิ · ยา GLP-1 vs เพปไทด์ความงามและกฎหมาย อย. ไทย',
    },
    title: {
      en: 'Semaglutide & Tirzepatide Engineering vs Cosmetic Evidence & Thai FDA Rules',
      zh: '司美格鲁肽与替尔泊肽精准改造 vs 护肤肽循证争议与泰国 FDA 法规',
      th: 'วิศวกรรม Semaglutide & Tirzepatide เทียบหลักฐานคอลลาเจนและกฎ อย. ไทย',
    },
    subtitle: {
      en: '31-AA Semaglutide (4ZGM) & 39-AA Tirzepatide vs Argireline/Matrixyl, 2025 Am. J. Med. 23 RCTs & Thai FDA Special Control',
      zh: '31 AA 司美格鲁肽 (4ZGM) 与 39 AA 替尔泊肽 vs 乙酰基六肽-8/棕榈酰五肽-4、2025 Am. J. Med. 23项RCT及泰国 อย. 特殊控制药',
      th: 'Semaglutide (31 AA) & Tirzepatide (39 AA) vs Argireline/Matrixyl, งานวิจัย Am. J. Med. 2025 และประกาศ อย. ฉบับที่ 58',
    },
    narration: {
      en: 'Therapeutic peptides use precise medicinal chemistry: Semaglutide (31 AA, PDB 4ZGM) uses Aib8 + Lys26 C18 diacid; Tirzepatide (39 AA, Coskun 2018) uses Aib2/Aib13 + Lys20 C20 diacid for dual GIP/GLP-1 agonism. In skincare, Argireline mimics SNAP-25 to dampen SNARE signaling and Matrixyl (Pal-KTTKS) adds palmitic acid for penetration—yet a 2025 Am. J. Med. meta-analysis of 23 RCTs found no significant skin benefit in independently funded or high-quality collagen trials. Under Thai FDA Notification No. 58, injectable GLP-1 drugs are Special Control Prescription Drugs, whereas registered cosmetics may never claim therapeutic drug efficacy.',
      zh: '治疗级多肽依靠严密药物化学：31 AA 司美格鲁肽（PDB 4ZGM）以 Aib8 抗 DPP-4 酶解并借 Lys26 C18 脂链结合白蛋白；39 AA 替尔泊肽（Coskun 2018）引入 Aib2/Aib13 与 Lys20 C20 脂链实现 GIP/GLP-1 双靶点长效激活。反观护肤界：Argireline（乙酰基六肽-8）通过模拟 SNAP-25 弱化 SNARE 信号，Matrixyl（Pal-KTTKS）通过棕榈酸增脂溶；但 2025 年《美国医学杂志》对 23 项口服胶原蛋白肽 RCT 的荟萃分析显示，独立非厂商资助与高质量研究中未见显著皮肤抗衰差异。依泰国 FDA（อย.）第 58 号公告，注射 GLP-1 属特殊控制处方药（ยาควบคุมพิเศษ），而化妆品备案严禁宣称医疗疗效。',
      th: 'ยาเพปไทด์อย่าง Semaglutide (31 AA, PDB 4ZGM) ใช้ Aib8+C18 และ Tirzepatide (39 AA) ใช้ Aib2/13+C20 กระตุ้นคู่ GIP/GLP-1 ส่วนสกินแคร์อย่าง Argireline เลียนแบบ SNAP-25 เพื่อลดสัญญาณ SNARE และ Matrixyl เติมกรดปาล์มิติกช่วยซึมผ่าน แต่เมตาวิเคราะห์ใน Am. J. Med. ปี 2025 (23 RCTs) พบว่างานวิจัยอิสระคุณภาพสูงไม่พบผลแตกต่างอย่างมีนัยสำคัญจากคอลลาเจนรับประทาน ทั้งนี้ตามประกาศกระทรวงสาธารณสุข ฉบับที่ 58 ของ อย. ไทย ยาฉีด GLP-1 เป็น "ยาควบคุมพิเศษ" ต้องจ่ายตามใบสั่งแพทย์ ส่วนเครื่องสำอางจดแจ้งห้ามโฆษณาสรรพคุณทางยาเด็ดขาด',
    },
    mechanism: {
      en: 'Semaglutide (31 AA: Aib8, Arg34, Lys26-C18) · Tirzepatide (39 AA: Aib2/13, Lys20-C20) · 2025 Am. J. Med. 23 RCTs (n=1,474): non-industry subgroup p = NS · Thai FDA: Injectable GLP-1 = Special Control Drug.',
      zh: '司美格鲁肽 31 AA（Aib8, C18）· 替尔泊肽 39 AA（Aib2/13, C20）· 2025 Am. J. Med. 23 项 RCT 独立资助组无显著差异 · 泰 FDA 第58号公告：注射 GLP-1 为特殊控制处方药。',
      th: 'Semaglutide (31 AA) & Tirzepatide (39 AA) · งานวิเคราะห์ Am. J. Med. 2025 (23 RCTs, n=1,474) ไม่พบผลเด่นชัดในกลุ่มอิสระ · อย. ไทย: GLP-1 ฉีด = ยาควบคุมพิเศษ',
    },
    citationIds: [
      'lau-2015-semaglutide',
      'coskun-2018-tirzepatide',
      'cosmetic-peptides-signal',
      'myung-2025-collagen',
      'thai-fda-glp1',
    ],
  },
  {
    id: '3m-ch4-membrane-gpcr',
    start: 112,
    end: 150,
    sceneIdx: 3,
    badge: {
      en: 'Ch.4 · 112–150s · Bilayer & GPCR 5VAI',
      zh: '第4章 · 112–150s · 磷脂膜与 GPCR 激活机制',
      th: 'บทที่ 4 · 112–150 วิ · เยื่อหุ้มเซลล์และกลไก GPCR 5VAI',
    },
    title: {
      en: 'Phospholipid Bilayer & 7-TM Class B GPCR Activation (PDB 5VAI)',
      zh: '磷脂双分子层细胞膜与 7-TM GPCR 跨膜信号转导（PDB 5VAI）',
      th: 'ชั้นไขมันสองชั้นของเยื่อหุ้มเซลล์และการกระตุ้น 7-TM GPCR (PDB 5VAI)',
    },
    subtitle: {
      en: 'Two-domain ligand binding → TM6 kink & outward pivot → Gs recruitment & cAMP amplification',
      zh: '双结构域“钳夹”结合 → TM6 折弯外摆 → Gs 蛋白 α5 螺旋嵌入与 cAMP 二级放大',
      th: 'การจับสองโดเมน → เกลียว TM6 หักงอและเปิดออก → โปรตีน Gs จับตัวและกระตุ้น cAMP',
    },
    narration: {
      en: 'Large peptide hormones cannot passively cross the hydrophobic core of the phospholipid bilayer; instead, they signal across the membrane via Class B G-protein-coupled receptors. In cryo-EM structure PDB 5VAI (4.1 Å), GLP-1 is gripped by both the extracellular N-terminal domain and the seven-helix transmembrane bundle. That binding forces a sharp kink in TM6, swinging its intracellular half outward to dock the Gs α5 helix and trigger cAMP production.',
      zh: '大分子多肽无法自由穿过由亲水磷酸头与疏水双脂尾构成的磷脂双分子层，因此必须通过镶嵌其中的 7 次跨膜 Class B GPCR 传递信号。冷冻电镜结构 PDB 5VAI（4.1 Å 分辨率）显示，配体同时被受体胞外 NTD 与跨膜核心“双点钳夹”，迫使第 6 跨膜螺旋（TM6）中部出现标志性锐角折弯并向外大幅摆动，打开胞内空腔接纳 Gs 蛋白 α5 螺旋，催化生成大量第二信使 cAMP。',
      th: 'ฮอร์โมนเพปไทด์ขนาดใหญ่ไม่สามารถแพร่ผ่านแกนไม่ชอบน้ำของเยื่อหุ้มเซลล์ฟอสโฟลิพิดได้โดยตรง แต่สื่อสารผ่านตัวรับ Class B GPCR ที่พาดผ่านเยื่อหุ้มเซลล์ 7 รอบ โครงสร้างไครโออีเอ็ม PDB 5VAI (ความละเอียด 4.1 Å) แสดงให้เห็นว่าเมื่อ GLP-1 จับเข้ากับ NTD และแกนกลาง TM เกลียว TM6 จะหักงอและกางออกด้านนอก เปิดทางให้แอลฟา-5 ของโปรตีน Gs เข้าจับและกระตุ้นการสร้าง cAMP',
    },
    mechanism: {
      en: 'Hydrophilic head / hydrophobic lipid bilayer · PDB 5VAI (4.1 Å cryo-EM) · Sharp TM6 kink opens Gs cavity → GTP exchange → cAMP.',
      zh: '亲水头/疏水尾磷脂双分子层 · PDB 5VAI (4.1 Å) · TM6 折弯外摆打开 Gs 口袋 → 触发 cAMP 级联放大。',
      th: 'เยื่อหุ้มเซลล์ฟอสโฟลิพิด · PDB 5VAI (4.1 Å) · TM6 กางออกเปิดรับ Gs → แลกเปลี่ยน GTP → พุ่งระดับ cAMP',
    },
    citationIds: ['zhang-2017-5vai'],
  },
  {
    id: '3m-ch5-organs-value-chain',
    start: 150,
    end: 180,
    sceneIdx: 3,
    badge: {
      en: 'Ch.5 · 150–180s · 4 Target Organs & Pen Chain',
      zh: '第5章 · 150–180s · 四大靶器官与产业全链',
      th: 'บทที่ 5 · 150–180 วิ · 4 อวัยวะเป้าหมายและห่วงโซ่อุตสาหกรรมยา',
    },
    title: {
      en: 'Four Target Organs & From Resin Bead API to Autoinjector Pen',
      zh: '人体四大靶器官协同响应与从原料药到注射笔全链条回顾',
      th: 'การตอบสนองของ 4 อวัยวะเป้าหมายและห่วงโซ่จากเรซินสู่ปากกาฉีดยา',
    },
    subtitle: {
      en: 'Pancreatic β-cells · Hypothalamus · Cardiovascular · Dermal barrier vs SPPS → Fill-Finish → Pen',
      zh: '胰腺 β 细胞 · 下丘脑饱腹核团 · 心血管保护 · 真皮屏障对比 ＋ SPPS 原料药至注射笔终局',
      th: 'ตับอ่อน · ไฮโปทาลามัส · หัวใจและหลอดเลือด · ชั้นผิวหนัง + จาก API เรซินสู่ปากกาฉีดยา',
    },
    narration: {
      en: 'Elevated cAMP coordinates systemic physiology across four highlighted windows: glucose-dependent insulin release in pancreatic β-cells, hypothalamic satiety activation and slowed gastric emptying, cardioprotective endothelial signaling, and dermal tissue—where the ~500 Da stratum corneum barrier separates topical peptides from injected hormones. Every clinical dose links Merrifield SPPS resin synthesis, chromatographic purification, sterile fill-finish, and precision autoinjector pen delivery.',
      zh: '奔涌的 cAMP 在人体四大目标窗口引发精确生理协同：胰腺 β 细胞葡萄糖依赖性释放胰岛素（低血糖风险极低）；下丘脑弓状核激活饱腹信号并延缓胃排空；心血管系统内皮与代谢炎症减轻；而在皮肤真皮窗口，角质层约 500 Da 渗透阈值鲜明区分了局部护肤信号肽与皮下注射激素。从树脂微球原料药合成、RP-HPLC 纯化、无菌灌装到精密注射笔，化学、结构生物学与制药工程在此闭环。',
      th: 'สัญญาณ cAMP ประสานงานข้าม 4 ระบบสำคัญ: เบต้าเซลล์ตับอ่อนหลั่งอินซูลินตามระดับน้ำตาล ศูนย์อิ่มในไฮโปทาลามัสช่วยลดความอยากอาหารและชะลอการบีบตัวของกระเพาะ ระบบหลอดเลือดและหัวใจได้รับผลปกป้อง และหน้าต่างชั้นผิวหนังที่สะท้อนกฎ ~500 Da ซึ่งแยกเพปไทด์ทากับยาฉีดออกจากกัน ปิดท้ายวงจรจากเม็ดเรซิน SPPS การทำบริสุทธิ์ สู่ปากกาฉีดยาอัตโนมัติที่ปลอดภัย',
    },
    mechanism: {
      en: 'β-cell GSIS (glucose-dependent) · Hypothalamic POMC/CART satiety · CV benefit · ~500 Da skin barrier · SPPS API → HPLC → Fill-Finish → Pen.',
      zh: 'β 细胞葡萄糖依赖性分泌 · 下丘脑饱腹信号 · 心血管获益 · 500 Da 经皮屏障 · SPPS 原料药 → 纯化 → 灌装 → 注射笔。',
      th: 'หลั่งอินซูลินตามกลูโคส · กระตุ้นความอิ่มที่สมอง · ประโยชน์ต่อหัวใจ · กฎ 500 Da ที่ผิวหนัง · SPPS → HPLC → บรรจุปลอดเชื้อ → ปากกาฉีดยา',
    },
    citationIds: [
      'zhang-2017-5vai',
      'merrifield-1963',
      'fda-85fr10057',
      'thai-fda-glp1',
    ],
  },
];

export const CITATIONS: CitationItem[] = [
  {
    id: 'merrifield-1963',
    title: 'Solid Phase Peptide Synthesis. I. The Synthesis of a Tetrapeptide',
    authors: 'R. B. Merrifield',
    journal: 'Journal of the American Chemical Society, 85(14), 2149–2154',
    year: '1963',
    url: 'https://doi.org/10.1021/ja00897a025',
    takeaway: {
      en: 'Established solid-phase peptide synthesis (SPPS) by anchoring the C-terminus to insoluble resin beads, enabling automated stepwise peptide manufacturing.',
      zh: '奠定固相多肽合成（SPPS）基石：将 C 端锚定于不溶性树脂微球，使循环脱保护、偶联及现代 TIDES 规模化自动化生产成为可能。',
      th: 'วางรากฐานการสังเคราะห์เพปไทด์บนวัฏภาคของแข็ง (SPPS) โดยยึดปลาย C บนเม็ดเรซิน เปิดทางสู่การผลิตเพปไทด์อัตโนมัติระดับอุตสาหกรรม',
    },
  },
  {
    id: 'fda-85fr10057',
    title: 'Definition of the Term "Biological Product" (Final Rule, 85 FR 10057)',
    authors: 'U.S. Food and Drug Administration (FDA)',
    journal: 'Federal Register, 85(35), 10057–10067',
    year: '2020',
    url: 'https://www.federalregister.gov/d/2020-03505',
    takeaway: {
      en: 'Defined "protein" as any specific-sequence alpha-amino-acid polymer >40 amino acids, placing ≤40 AA peptides (e.g., 31-AA Semaglutide) in drug NDA pathways and 51-AA Insulin in BLA biologics.',
      zh: '法定明确“大于 40 个氨基酸”的特定序列 α-氨基酸聚合物属蛋白质/生物制品（BLA），将 ≤40 AA（如 31 AA 司美格鲁肽）与 51 AA 胰岛素划出清晰监管边界。',
      th: 'กำหนดเส้นแบ่ง >40 กรดอะมิโนให้จัดเป็นโปรตีน/ชีววัตถุ (BLA) จึงแยกอินซูลิน (51 AA) ออกจากเพปไทด์สังเคราะห์ ≤40 AA เช่น Semaglutide (31 AA)',
    },
  },
  {
    id: 'lau-2015-semaglutide',
    title: 'Discovery of the Once-Weekly Glucagon-Like Peptide-1 (GLP-1) Analogue Semaglutide',
    authors: 'J. Lau, P. Bloch, L. Schäffer, I. Pettersson, L. B. Knudsen, et al.',
    journal: 'Journal of Medicinal Chemistry, 58(18), 7370–7380',
    year: '2015',
    pdb: '4ZGM',
    url: 'https://doi.org/10.1021/acs.jmedchem.5b00726',
    takeaway: {
      en: 'Engineered Aib8 to prevent DPP-4 cleavage and conjugated a C18 fatty diacid via γ-Glu-2xOEG linker at Lys26 for albumin binding, extending half-life from <2 min to ~165 hours (~1 week).',
      zh: '揭示司美格鲁肽设计原理：Aib8 阻断 DPP-4 酶解，Lys26 挂载 γ-Glu-2xOEG 连接臂与 C18 脂肪酸二酸可逆锚定白蛋白，将半衰期由不足 2 分钟延至约 165 小时。',
      th: 'ออกแบบ Semaglutide (PDB 4ZGM) ด้วยการแทนที่ Aib8 กัน DPP-4 และต่อสายไขมัน C18 diacid ที่ Lys26 เพื่อจับอัลบูมิน ยืดครึ่งชีวิตจาก <2 นาทีเป็น ~165 ชม.',
    },
  },
  {
    id: 'coskun-2018-tirzepatide',
    title: 'LY3298176, a novel dual GIP and GLP-1 receptor agonist for the treatment of type 2 diabetes mellitus: From discovery to clinical proof of concept',
    authors: 'T. Coskun, K. W. Sloop, C. Loghin, J. Alsina-Fernandez, S. Urva, et al.',
    journal: 'Molecular Metabolism, 18, 3–14',
    year: '2018',
    url: 'https://doi.org/10.1016/j.molmet.2018.09.009',
    takeaway: {
      en: 'Introduced 39-AA Tirzepatide based on the GIP backbone with Aib2/Aib13 DPP-4 shields and a Lys20 C20 fatty diacid linker for potent dual GIP/GLP-1 receptor co-activation.',
      zh: '首次系统披露 39 AA 双靶点激动剂替尔泊肽（LY3298176）：含 Aib2/Aib13 抗酶解位点及 Lys20 C20 二羧酸脂链，实现 GIP 与 GLP-1 双受体协同增效。',
      th: 'เปิดตัว Tirzepatide (39 AA) ที่ใช้โครงสร้างหลัก GIP พร้อม Aib2/Aib13 กัน DPP-4 และกรดไขมัน C20 diacid ที่ Lys20 เพื่อกระตุ้นทั้งตัวรับ GIP และ GLP-1',
    },
  },
  {
    id: 'zhang-2017-5vai',
    title: 'Cryo-EM structure of the activated GLP-1 receptor in complex with a G protein',
    authors: 'Y. Zhang, B. Sun, D. Feng, H. Hu, M. Chu, Q. Qu, B. K. Kobilka, G. Skiniotis, et al.',
    journal: 'Nature, 546(7657), 248–253',
    year: '2017',
    pdb: '5VAI',
    url: 'https://doi.org/10.1038/nature22394',
    takeaway: {
      en: 'Resolved full-length activated Class B GLP-1R bound to GLP-1 and Gs at ~4.1 Å, visualizing the sharp outward kink in TM6 that unlocks intracellular Gs docking and cAMP signaling.',
      zh: '以约 4.1 Å 分辨率解析全长激活态 Class B GLP-1R-GLP-1-Gs 复合物冷冻电镜结构（PDB 5VAI），直接捕获 TM6 折弯外摆接纳 Gs 蛋白的关键瞬间。',
      th: 'เผยโครงสร้างไครโออีเอ็ม (4.1 Å, PDB 5VAI) ของตัวรับ GLP-1R ที่ถูกกระตุ้นพร้อมโปรตีน Gs แสดงการหักงอและกางออกของ TM6 ที่เป็นสวิตช์ส่งสัญญาณ cAMP',
    },
  },
  {
    id: 'myung-2025-collagen',
    title: 'Effects of Collagen Supplements on Skin Aging: A Systematic Review and Meta-Analysis of Randomized Controlled Trials',
    authors: 'S.-K. Myung, Y. Park',
    journal: 'The American Journal of Medicine',
    year: '2025',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40324552/',
    takeaway: {
      en: 'Meta-analysis of 23 RCTs (n = 1,474): while overall pooled data looked positive, subgroup analyses of non-industry-funded trials and high-quality trials found NO significant improvements in skin hydration, elasticity, or wrinkles.',
      zh: '2025 年《美国医学杂志》23 项 RCT（1,474 人）荟萃分析：合并表面虽呈正相关，但独立（非厂商资助）研究及高质量研究亚组在皮肤水合、弹性与皱纹上均无统计学显著差异。',
      th: 'เมตาวิเคราะห์จาก 23 RCTs (n = 1,474) พบว่าเมื่อคัดแยกเฉพาะงานวิจัยที่ไม่ได้รับทุนจากผู้ผลิตและงานวิจัยคุณภาพสูง ไม่พบประโยชน์อย่างมีนัยสำคัญต่อความชุ่มชื้น ความยืดหยุ่น หรือริ้วรอย',
    },
  },
  {
    id: 'cosmetic-peptides-signal',
    title: 'A synthetic hexapeptide (Argireline) with antiwrinkle activity & Matrixyl KTTKS procollagen fragment foundation',
    authors: 'C. Blanes-Mira, J. Clemente, et al. (2002); K. Katayama, et al. (1993)',
    journal: 'Int. J. Cosmet. Sci., 24, 303–310; J. Biol. Chem., 268(14), 9941–9944',
    year: '2002 / 1993',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18498523/',
    takeaway: {
      en: 'Argireline (Ac-EEMQRR-NH₂) mimics N-terminal SNAP-25 to modulate SNARE complex formation; Matrixyl (Pal-KTTKS) adds a C16 palmitoyl tail to aid stratum corneum delivery of the KTTKS matrikine signal.',
      zh: '揭示两条经典外用信号肽机理：Argireline（六肽-8）模拟 SNAP-25 竞争干扰 SNARE 复合物；Matrixyl（棕榈酰五肽-4）则借 C16 棕榈酸尾改善 KTTKS 在角质层的脂溶性渗透。',
      th: 'Argireline เลียนแบบปลาย N ของโปรตีน SNAP-25 เพื่อชะลอการประกอบ SNARE ส่วน Matrixyl เติมหมู่ Palmitoyl (C16) ให้เพปไทด์ KTTKS ซึมเข้าสู่ผิวชั้นนอกได้ดีขึ้น',
    },
  },
  {
    id: 'thai-fda-glp1',
    title: 'Ministry of Public Health Notification on Special Control Drugs No. 58 (Injectable GLP-1 Agonists) & Cosmetic Act B.E. 2558',
    authors: 'Thai Food and Drug Administration (Thai FDA / อย.), Ministry of Public Health',
    journal: 'Royal Thai Government Gazette (Effective Sep 15, 2026 / B.E. 2569)',
    year: '2026',
    url: 'https://www.fda.moph.go.th/',
    takeaway: {
      en: 'Injectable GLP-1 agonists (e.g., Semaglutide, Tirzepatide) are classified in Thailand as Special Control Drugs requiring a physician prescription, pharmacist dispensing, and Track & Trace; notified cosmetics are strictly barred from medical/drug claims.',
      zh: '依据泰国卫生部第 58 号公告，注射用 GLP-1 激动剂在泰国列为“特殊控制处方药（ยาควบคุมพิเศษ）”，须凭医师处方并在药师指导下发药且纳入追溯系统；而化妆品备案严禁宣称医疗与减重疗效。',
      th: 'ประกาศ สธ. ฉบับที่ 58 จัดให้ยาฉีดกลุ่ม GLP-1 (เช่น Semaglutide, Tirzepatide) เป็น "ยาควบคุมพิเศษ" ต้องจ่ายตามใบสั่งแพทย์และติดตามการกระจายยา ส่วนเครื่องสำอางจดแจ้งห้ามโฆษณาสรรพคุณทางยา',
    },
  },
];

export const UI_I18N: Record<Lang, UiDictionary> = {
  en: {
    appTitle: 'Peptide & Human Body 3D Lab',
    appSubtitle: 'React Three Fiber + Gemini [3D_OBJECT] Interactive Molecular Classroom',
    modeLabels: {
      '1min': '1-Min Rapid Tour',
      '3min': '3-Min Deep Dive',
    },
    repLabels: {
      'ball-stick': 'Ball & Stick',
      ribbon: 'Ribbon Helix',
      surface: 'Lipid & Surface',
    },
    repDescriptions: {
      'ball-stick': 'Covalent atoms, planar ω bonds & H-bond geometry',
      ribbon: 'α-Helix backbone ribbons (3.6 AA/turn, 5.4 Å)',
      surface: 'Electron cloud, albumin pocket & phospholipid bilayer',
    },
    controls: {
      play: 'Play',
      pause: 'Pause',
      prev: 'Prev',
      next: 'Next',
      reset: 'Reset',
      replay: 'Replay',
      mute: 'Mute Audio',
      unmute: 'Unmute Bio-Audio',
      timelineLabel: 'Course Timeline',
      sceneLabel: '3D Stage',
      mechanismLabel: 'Molecular Mechanism & Parameters',
      citationsLabel: 'Peer-Reviewed Evidence & Regulatory Sources',
      pdbBadge: 'PDB',
      openCitation: 'Source',
      languageLabel: 'Language',
    },
    aiLab: {
      panelTitle: 'Gemini 3D Molecular Lab',
      panelSubtitle: 'Natural Language → [3D_OBJECT] JSON → Live R3F Scene',
      protocolBadge: '[3D_OBJECT] Protocol',
      apiKeyLabel: 'Gemini API Key (Optional)',
      apiKeyPlaceholder: 'Leave empty for Offline Scientific Sim, or paste AIza... key',
      apiKeyHint: 'Key stays in browser memory only; never persisted or logged. Offline mode runs full deterministic [3D_OBJECT] JSON synthesis.',
      promptPlaceholder: 'Ask for any peptide, bond, receptor, or SPPS 3D structure...',
      sendButton: 'Build 3D',
      sendingButton: 'Synthesizing...',
      clearObjectsButton: 'Clear AI Scene',
      sourceGemini: 'Gemini 2.5 Flash Live',
      sourceOffline: 'Offline Scientific Sim',
      objectsCountLabel: 'Rendered 3D Nodes',
      presetsTitle: 'Quick Scientific 3D Prompts',
      protocolJsonTitle: 'Extracted [3D_OBJECT] JSON Stream',
      emptyCanvasHint: 'Choose a preset or enter a prompt to spawn an interactive 3D molecular assembly.',
    },
    disclaimer: 'Educational visualization only; not medical advice. Injectable GLP-1 agents are prescription-only medications (Special Control Drugs in Thailand).',
    presets: [
      {
        id: 'preset-insulin-disulfide',
        label: {
          en: 'Insulin Disulfide Bridges',
          zh: '胰岛素二硫键',
          th: 'พันธะไดซัลไฟด์อินซูลิน',
        },
        prompt: {
          en: 'Build a 3D model of 51-AA human insulin showing A-chain, B-chain, and the three disulfide bridges (two inter-chain, one intra-chain), and explain why FDA classifies >40 AA as a biologic.',
          zh: '请构建 51 氨基酸胰岛素的 3D 模型，展示 A 链、B 链以及两条链间与一条链内二硫键，并解释 FDA 40 AA 分界规则。',
          th: 'ช่วยสร้างแบบจำลอง 3 มิติของอินซูลิน 51 กรดอะมิโน แสดงสาย A, สาย B และพันธะไดซัลไฟด์ 3 แห่ง พร้อมอธิบายเกณฑ์ 40 AA ของ FDA',
        },
      },
      {
        id: 'preset-gpcr-5vai',
        label: {
          en: 'GPCR 5VAI & TM6 Swing',
          zh: 'GPCR 跨膜受体 5VAI',
          th: 'ตัวรับ GPCR 5VAI & TM6',
        },
        prompt: {
          en: 'Visualize a 7-transmembrane Class B GPCR embedded in a phospholipid bilayer with GLP-1 docked, TM6 kinked outward, Gs protein engaged, and cAMP bursts.',
          zh: '构建镶嵌在磷脂双分子层中的 7 次跨膜 Class B GPCR 受体（PDB 5VAI），展示 GLP-1 结合、TM6 外摆、Gs 偶联及 cAMP 爆发。',
          th: 'สร้างภาพ 3 มิติของ Class B GPCR 7 เกลียวในเยื่อหุ้มเซลล์ พร้อม GLP-1, การงอออกของ TM6, โปรตีน Gs และสัญญาณ cAMP',
        },
      },
      {
        id: 'preset-spps-resin',
        label: {
          en: 'Merrifield SPPS Resin',
          zh: 'SPPS 固相合成树脂',
          th: 'เรซินสังเคราะห์ SPPS',
        },
        prompt: {
          en: 'Generate a 3D Merrifield solid-phase peptide synthesis (SPPS) bead with a linker, growing α-amino acid chain, and Fmoc protection cap.',
          zh: '构建 Merrifield 固相多肽合成（SPPS）3D 模型：高分子树脂微球、连接臂、逐个延伸的氨基酸链与 Fmoc 保护帽。',
          th: 'สร้างแบบจำลอง 3 มิติการสังเคราะห์เพปไทด์ SPPS ของ Merrifield แสดงเม็ดเรซิน ตัวเชื่อม สายกรดอะมิโน และหมู่ปกป้อง Fmoc',
        },
      },
      {
        id: 'preset-collagen-skincare',
        label: {
          en: 'Collagen & Skincare Peptides',
          zh: '胶原三螺旋与护肤肽',
          th: 'คอลลาเจนและเพปไทด์ผิวหนัง',
        },
        prompt: {
          en: 'Model a collagen triple helix alongside Pal-KTTKS (Matrixyl) and summarize the 2025 Am. J. Med. 23-RCT evidence and 500 Da skin barrier limit.',
          zh: '展示胶原蛋白三螺旋与 Pal-KTTKS（Matrixyl）3D 对比，并客观总结 2025 Am. J. Med. 23 项 RCT 结论与 500 Da 皮肤屏障。',
          th: 'สร้างแบบจำลองเกลียวสามสายของคอลลาเจนเทียบกับ Pal-KTTKS พร้อมสรุปหลักฐาน 23 RCTs ปี 2025 และข้อจำกัด 500 Da ของผิวหนัง',
        },
      },
    ],
  },
  zh: {
    appTitle: '多肽与人体 3D 交互实验室',
    appSubtitle: 'React Three Fiber + Gemini [3D_OBJECT] 双引擎科学可视化教室',
    modeLabels: {
      '1min': '1 分钟极速导览',
      '3min': '3 分钟深度课堂',
    },
    repLabels: {
      'ball-stick': '球棍原子视图',
      ribbon: '丝带螺旋视图',
      surface: '脂膜表面视图',
    },
    repDescriptions: {
      'ball-stick': '原子成键、共轭刚性平面肽键（ω ≈ 180°）与氢键几何',
      'ribbon': 'α-螺旋骨架丝带（3.6 氨基酸/圈，5.4 Å 螺距）',
      surface: '分子表面包络、白蛋白结合口袋与磷脂双分子层膜',
    },
    controls: {
      play: '播放',
      pause: '暂停',
      prev: '上一幕',
      next: '下一幕',
      reset: '重置',
      replay: '重播',
      mute: '静音',
      unmute: '开启声景',
      timelineLabel: '课程时间轴',
      sceneLabel: '3D 主舞台',
      mechanismLabel: '分子机制与核心定量参数',
      citationsLabel: '权威同行评审文献与监管依据',
      pdbBadge: 'PDB',
      openCitation: '查看原文',
      languageLabel: '界面语言',
    },
    aiLab: {
      panelTitle: 'Gemini 3D 分子实验台',
      panelSubtitle: '自然语言提问 → [3D_OBJECT] JSON → R3F 实时渲染',
      protocolBadge: '[3D_OBJECT] 协议',
      apiKeyLabel: 'Gemini API Key（可选）',
      apiKeyPlaceholder: '留空即体验离线权威仿真，或填入 AIza... 密钥',
      apiKeyHint: '密钥仅驻留浏览器当前内存，不落盘不上传第三方；留空仍可完整运行 [3D_OBJECT] 结构化解析与 3D 渲染。',
      promptPlaceholder: '输入你想构建的多肽、化学键、GPCR 受体或合成工艺...',
      sendButton: '生成 3D',
      sendingButton: '合成计算中...',
      clearObjectsButton: '清空 AI 模型',
      sourceGemini: 'Gemini 2.5 Flash 实时驱动',
      sourceOffline: '本地科学仿真内核',
      objectsCountLabel: '已渲染 3D 节点',
      presetsTitle: '4 大经典科研预设提问',
      protocolJsonTitle: '解析出的 [3D_OBJECT] 协议数据流',
      emptyCanvasHint: '点击下方任意科研预设，或用自然语言提问，立即驱动右侧 3D 分子建构。',
    },
    disclaimer: '仅供科学科普教育，非医疗建议。注射用 GLP-1 类制剂属严格处方药（在泰国依第 58 号公告属特殊控制药物）。',
    presets: [
      {
        id: 'preset-insulin-disulfide',
        label: {
          en: 'Insulin Disulfide Bridges',
          zh: '胰岛素二硫键',
          th: 'พันธะไดซัลไฟด์อินซูลิน',
        },
        prompt: {
          en: 'Build a 3D model of 51-AA human insulin showing A-chain, B-chain, and the three disulfide bridges (two inter-chain, one intra-chain), and explain why FDA classifies >40 AA as a biologic.',
          zh: '请构建 51 氨基酸胰岛素的 3D 模型，展示 A 链、B 链以及两条链间与一条链内二硫键，并解释 FDA 40 AA 分界规则。',
          th: 'ช่วยสร้างแบบจำลอง 3 มิติของอินซูลิน 51 กรดอะมิโน แสดงสาย A, สาย B และพันธะไดซัลไฟด์ 3 แห่ง พร้อมอธิบายเกณฑ์ 40 AA ของ FDA',
        },
      },
      {
        id: 'preset-gpcr-5vai',
        label: {
          en: 'GPCR 5VAI & TM6 Swing',
          zh: 'GPCR 跨膜受体 5VAI',
          th: 'ตัวรับ GPCR 5VAI & TM6',
        },
        prompt: {
          en: 'Visualize a 7-transmembrane Class B GPCR embedded in a phospholipid bilayer with GLP-1 docked, TM6 kinked outward, Gs protein engaged, and cAMP bursts.',
          zh: '构建镶嵌在磷脂双分子层中的 7 次跨膜 Class B GPCR 受体（PDB 5VAI），展示 GLP-1 结合、TM6 外摆、Gs 偶联及 cAMP 爆发。',
          th: 'สร้างภาพ 3 มิติของ Class B GPCR 7 เกลียวในเยื่อหุ้มเซลล์ พร้อม GLP-1, การงอออกของ TM6, โปรตีน Gs และสัญญาณ cAMP',
        },
      },
      {
        id: 'preset-spps-resin',
        label: {
          en: 'Merrifield SPPS Resin',
          zh: 'SPPS 固相合成树脂',
          th: 'เรซินสังเคราะห์ SPPS',
        },
        prompt: {
          en: 'Generate a 3D Merrifield solid-phase peptide synthesis (SPPS) bead with a linker, growing α-amino acid chain, and Fmoc protection cap.',
          zh: '构建 Merrifield 固相多肽合成（SPPS）3D 模型：高分子树脂微球、连接臂、逐个延伸的氨基酸链与 Fmoc 保护帽。',
          th: 'สร้างแบบจำลอง 3 มิติการสังเคราะห์เพปไทด์ SPPS ของ Merrifield แสดงเม็ดเรซิน ตัวเชื่อม สายกรดอะมิโน และหมู่ปกป้อง Fmoc',
        },
      },
      {
        id: 'preset-collagen-skincare',
        label: {
          en: 'Collagen & Skincare Peptides',
          zh: '胶原三螺旋与护肤肽',
          th: 'คอลลาเจนและเพปไทด์ผิวหนัง',
        },
        prompt: {
          en: 'Model a collagen triple helix alongside Pal-KTTKS (Matrixyl) and summarize the 2025 Am. J. Med. 23-RCT evidence and 500 Da skin barrier limit.',
          zh: '展示胶原蛋白三螺旋与 Pal-KTTKS（Matrixyl）3D 对比，并客观总结 2025 Am. J. Med. 23 项 RCT 结论与 500 Da 皮肤屏障。',
          th: 'สร้างแบบจำลองเกลียวสามสายของคอลลาเจนเทียบกับ Pal-KTTKS พร้อมสรุปหลักฐาน 23 RCTs ปี 2025 และข้อจำกัด 500 Da ของผิวหนัง',
        },
      },
    ],
  },
  th: {
    appTitle: 'ห้องปฏิบัติการ 3 มิติ เพปไทด์และร่างกายมนุษย์',
    appSubtitle: 'ห้องเรียนโมเลกุลเชิงโต้ตอบ React Three Fiber + Gemini [3D_OBJECT]',
    modeLabels: {
      '1min': 'สรุปเร่งด่วน 1 นาที',
      '3min': 'เจาะลึก 3 นาที',
    },
    repLabels: {
      'ball-stick': 'ลูกบอลและแท่ง (อะตอม)',
      ribbon: 'ริบบิ้นเกลียวแอลฟา',
      surface: 'พื้นผิวและเยื่อหุ้มเซลล์',
    },
    repDescriptions: {
      'ball-stick': 'แสดงอะตอม พันธะระนาบ ω ≈ 180° และพันธะไฮโดรเจน',
      'ribbon': 'แสดงโครงสร้างเกลียวแอลฟา (3.6 AA/รอบ, 5.4 Å)',
      'surface': 'แสดงพื้นผิวโมเลกุล จุดจับอัลบูมิน และเยื่อหุ้มเซลล์ฟอสโฟลิพิด',
    },
    controls: {
      play: 'เล่น',
      pause: 'หยุดชั่วคราว',
      prev: 'ก่อนหน้า',
      next: 'ถัดไป',
      reset: 'รีเซ็ต',
      replay: 'เล่นซ้ำ',
      mute: 'ปิดเสียง',
      unmute: 'เปิดเสียงโมเลกุล',
      timelineLabel: 'ไทม์ไลน์บทเรียน',
      sceneLabel: 'เวที 3 มิติ',
      mechanismLabel: 'กลไกระดับโมเลกุลและค่าพารามิเตอร์สำคัญ',
      citationsLabel: 'เอกสารอ้างอิงทางวิทยาศาสตร์และกฎหมาย',
      pdbBadge: 'PDB',
      openCitation: 'แหล่งข้อมูล',
      languageLabel: 'ภาษา',
    },
    aiLab: {
      panelTitle: 'ห้องทดลองโมเลกุล Gemini 3 มิติ',
      panelSubtitle: 'ภาษาธรรมชาติ → JSON [3D_OBJECT] → เรนเดอร์ R3F ทันที',
      protocolBadge: 'โปรโตคอล [3D_OBJECT]',
      apiKeyLabel: 'Gemini API Key (ไม่บังคับ)',
      apiKeyPlaceholder: 'เว้นว่างเพื่อใช้โหมดจำลองวิทยาศาสตร์ หรือวางคีย์ AIza...',
      apiKeyHint: 'คีย์อยู่เฉพาะในหน่วยความจำเบราว์เซอร์เท่านั้น หากเว้นว่างระบบยังจำลองและถอดรหัส JSON [3D_OBJECT] ได้ครบถ้วน',
      promptPlaceholder: 'ถามเกี่ยวกับเพปไทด์ พันธะ ตัวรับ GPCR หรือการสังเคราะห์ SPPS...',
      sendButton: 'สร้าง 3 มิติ',
      sendingButton: 'กำลังสังเคราะห์...',
      clearObjectsButton: 'ล้างโมเดล AI',
      sourceGemini: 'Gemini 2.5 Flash สด',
      sourceOffline: 'โหมดจำลองวิทยาศาสตร์ออฟไลน์',
      objectsCountLabel: 'โหนด 3 มิติที่แสดงผล',
      presetsTitle: '4 คำถามตัวอย่างทางวิทยาศาสตร์',
      protocolJsonTitle: 'สตรีม JSON [3D_OBJECT] ที่ถอดรหัสได้',
      emptyCanvasHint: 'เลือกคำถามตัวอย่างหรือพิมพ์ข้อความเพื่อสร้างแบบจำลองโมเลกุล 3 มิติแบบโต้ตอบ',
    },
    disclaimer: 'เพื่อการศึกษาทางวิทยาศาสตร์เท่านั้น มิใช่คำแนะนำทางการแพทย์ ยาฉีด GLP-1 เป็นยาควบคุมพิเศษที่ต้องสั่งจ่ายโดยแพทย์ตามประกาศกระทรวงสาธารณสุขไทย',
    presets: [
      {
        id: 'preset-insulin-disulfide',
        label: {
          en: 'Insulin Disulfide Bridges',
          zh: '胰岛素二硫键',
          th: 'พันธะไดซัลไฟด์อินซูลิน',
        },
        prompt: {
          en: 'Build a 3D model of 51-AA human insulin showing A-chain, B-chain, and the three disulfide bridges (two inter-chain, one intra-chain), and explain why FDA classifies >40 AA as a biologic.',
          zh: '请构建 51 氨基酸胰岛素的 3D 模型，展示 A 链、B 链以及两条链间与一条链内二硫键，并解释 FDA 40 AA 分界规则。',
          th: 'ช่วยสร้างแบบจำลอง 3 มิติของอินซูลิน 51 กรดอะมิโน แสดงสาย A, สาย B และพันธะไดซัลไฟด์ 3 แห่ง พร้อมอธิบายเกณฑ์ 40 AA ของ FDA',
        },
      },
      {
        id: 'preset-gpcr-5vai',
        label: {
          en: 'GPCR 5VAI & TM6 Swing',
          zh: 'GPCR 跨膜受体 5VAI',
          th: 'ตัวรับ GPCR 5VAI & TM6',
        },
        prompt: {
          en: 'Visualize a 7-transmembrane Class B GPCR embedded in a phospholipid bilayer with GLP-1 docked, TM6 kinked outward, Gs protein engaged, and cAMP bursts.',
          zh: '构建镶嵌在磷脂双分子层中的 7 次跨膜 Class B GPCR 受体（PDB 5VAI），展示 GLP-1 结合、TM6 外摆、Gs 偶联及 cAMP 爆发。',
          th: 'สร้างภาพ 3 มิติของ Class B GPCR 7 เกลียวในเยื่อหุ้มเซลล์ พร้อม GLP-1, การงอออกของ TM6, โปรตีน Gs และสัญญาณ cAMP',
        },
      },
      {
        id: 'preset-spps-resin',
        label: {
          en: 'Merrifield SPPS Resin',
          zh: 'SPPS 固相合成树脂',
          th: 'เรซินสังเคราะห์ SPPS',
        },
        prompt: {
          en: 'Generate a 3D Merrifield solid-phase peptide synthesis (SPPS) bead with a linker, growing α-amino acid chain, and Fmoc protection cap.',
          zh: '构建 Merrifield 固相多肽合成（SPPS）3D 模型：高分子树脂微球、连接臂、逐个延伸的氨基酸链与 Fmoc 保护帽。',
          th: 'สร้างแบบจำลอง 3 มิติการสังเคราะห์เพปไทด์ SPPS ของ Merrifield แสดงเม็ดเรซิน ตัวเชื่อม สายกรดอะมิโน และหมู่ปกป้อง Fmoc',
        },
      },
      {
        id: 'preset-collagen-skincare',
        label: {
          en: 'Collagen & Skincare Peptides',
          zh: '胶原三螺旋与护肤肽',
          th: 'คอลลาเจนและเพปไทด์ผิวหนัง',
        },
        prompt: {
          en: 'Model a collagen triple helix alongside Pal-KTTKS (Matrixyl) and summarize the 2025 Am. J. Med. 23-RCT evidence and 500 Da skin barrier limit.',
          zh: '展示胶原蛋白三螺旋与 Pal-KTTKS（Matrixyl）3D 对比，并客观总结 2025 Am. J. Med. 23 项 RCT 结论与 500 Da 皮肤屏障。',
          th: 'สร้างแบบจำลองเกลียวสามสายของคอลลาเจนเทียบกับ Pal-KTTKS พร้อมสรุปหลักฐาน 23 RCTs ปี 2025 และข้อจำกัด 500 Da ของผิวหนัง',
        },
      },
    ],
  },
};
