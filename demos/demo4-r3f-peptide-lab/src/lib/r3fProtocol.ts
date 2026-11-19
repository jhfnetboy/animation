import { GoogleGenAI } from '@google/genai';
import type { Lang, SceneObjectSpec } from '../types';

export type { Lang, SceneObjectSpec } from '../types';

export interface AskScience3DResult {
  rawText: string;
  cleanText: string;
  objects: SceneObjectSpec[];
  source: 'gemini' | 'offline-sim';
}

const VALID_TYPES: ReadonlySet<SceneObjectSpec['type']> = new Set([
  'box',
  'sphere',
  'cylinder',
  'cone',
  'helix',
  'bond',
  'ring',
]);

const OBJECT_BLOCK_REGEX = /\[3D_OBJECT\]([\s\S]*?)\[\/3D_OBJECT\]/g;

export const SYSTEM_PROMPT = `You are a Computational Structural Biologist and React Three Fiber (R3F) 3D Molecular Scene Architect inside an interactive educational science classroom.

YOUR MISSION:
1. Answer the student's question accurately, concisely, and strictly grounded in peer-reviewed structural biology, medicinal chemistry, and regulatory science (never fabricate papers, PDB IDs, or statistics; never give personal medical advice).
2. Reply in the requested target language (English, Simplified Chinese, or Thai).
3. Emit structured 3D scene geometry using one or more [3D_OBJECT]{...}[/3D_OBJECT] blocks containing valid single-line or multi-line JSON matching this exact TypeScript schema:
   {
     "id": "unique-kebab-id",
     "type": "box" | "sphere" | "cylinder" | "cone" | "helix" | "bond" | "ring",
     "position": [x, y, z],
     "color": "#hex",
     "args": [number, ...],
     "rotation": [rx, ry, rz],
     "label": "Short scientific label",
     "emissive": "#hex",
     "metalness": 0.0-1.0,
     "roughness": 0.0-1.0
   }

PRIMITIVE GEOMETRY & BIOMOLECULAR CONVENTIONS (Coordinates roughly within [-4, 4]):
- "sphere": args = [radius, widthSegments?, heightSegments?] -> atoms (C/N/O/S), SPPS resin beads, cAMP messengers, albumin pockets.
- "cylinder": args = [radiusTop, radiusBottom, height, radialSegments?] -> transmembrane helices, linker stalks, peptide rods.
- "box": args = [width, height, depth] -> phospholipid bilayer slabs, membrane cross-sections, crystal supports.
- "cone": args = [radius, height, radialSegments?] -> enzymatic cleavage active sites (e.g., DPP-4), directional signaling vectors.
- "helix": args = [radius, height, turns, tubeRadius] -> α-helices (3.6 AA/turn, 5.4 Å pitch), collagen triple strands, 7-TM GPCR bundles.
- "bond": position = [x1, y1, z1] (start point), args = [x2, y2, z2, radius] (end point + bond radius) -> covalent peptide bonds, disulfide bridges (-S-S-), i->i+4 H-bonds.
- "ring": args = [innerRadius, outerRadius, thetaSegments?] -> aromatic side chains, receptor binding collars, Aib8 steric shields.

STRICT OUTPUT RULES:
- Place your clear scientific explanation first, then append 4 to 14 [3D_OBJECT]{...}[/3D_OBJECT] blocks.
- Output ONLY pure valid JSON inside each [3D_OBJECT]...[/3D_OBJECT] block (no trailing commas, no comments).
- Never output executable JavaScript or Three.js code.`;

function createFallbackId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }
  const rand = Math.random().toString(36).slice(2, 10);
  const stamp = Date.now().toString(36);
  return `obj-${stamp}-${rand}`;
}

function toFiniteTuple3(value: unknown): [number, number, number] | null {
  if (!Array.isArray(value) || value.length !== 3) {
    return null;
  }
  const nums = value.map((item) => Number(item));
  if (nums.some((n) => !Number.isFinite(n))) {
    return null;
  }
  return [nums[0], nums[1], nums[2]];
}

function toFiniteNumberArray(value: unknown): number[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }
  const nums = value.map((item) => Number(item));
  if (nums.some((n) => !Number.isFinite(n))) {
    return null;
  }
  return nums;
}

function normalizeSceneObject(raw: unknown): SceneObjectSpec | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const obj = raw as Record<string, unknown>;
  const typeVal = typeof obj.type === 'string' ? obj.type.trim() : '';
  if (!VALID_TYPES.has(typeVal as SceneObjectSpec['type'])) {
    return null;
  }

  const position = toFiniteTuple3(obj.position) ?? [0, 0, 0];
  const args = toFiniteNumberArray(obj.args) ?? [0.5];
  const rotation = toFiniteTuple3(obj.rotation) ?? undefined;

  const id =
    typeof obj.id === 'string' && obj.id.trim().length > 0
      ? obj.id.trim()
      : createFallbackId();

  const color =
    typeof obj.color === 'string' && obj.color.trim().length > 0
      ? obj.color.trim()
      : '#38bdf8';

  const result: SceneObjectSpec = {
    id,
    type: typeVal as SceneObjectSpec['type'],
    position,
    color,
    args,
  };

  if (rotation) {
    result.rotation = rotation;
  }
  if (typeof obj.label === 'string' && obj.label.trim().length > 0) {
    result.label = obj.label.trim();
  }
  if (typeof obj.emissive === 'string' && obj.emissive.trim().length > 0) {
    result.emissive = obj.emissive.trim();
  }
  if (typeof obj.metalness === 'number' && Number.isFinite(obj.metalness)) {
    result.metalness = Math.min(1, Math.max(0, obj.metalness));
  }
  if (typeof obj.roughness === 'number' && Number.isFinite(obj.roughness)) {
    result.roughness = Math.min(1, Math.max(0, obj.roughness));
  }

  return result;
}

export function extractObjects(response: string): SceneObjectSpec[] {
  if (!response || typeof response !== 'string') {
    return [];
  }

  const results: SceneObjectSpec[] = [];
  const regex = new RegExp(OBJECT_BLOCK_REGEX.source, 'g');
  let match: RegExpExecArray | null = regex.exec(response);

  while (match !== null) {
    let payload = match[1].trim();
    // Strip optional markdown code fences if a model wrapped the JSON payload
    payload = payload
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (payload.length > 0) {
      try {
        const parsed: unknown = JSON.parse(payload);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const normalized = normalizeSceneObject(item);
            if (normalized) {
              results.push(normalized);
            }
          }
        } else {
          const normalized = normalizeSceneObject(parsed);
          if (normalized) {
            results.push(normalized);
          }
        }
      } catch {
        // Ignore malformed JSON block without crashing the 3D pipeline
      }
    }
    match = regex.exec(response);
  }

  return results;
}

export function stripObjectBlocks(response: string): string {
  if (!response || typeof response !== 'string') {
    return '';
  }
  return response
    .replace(OBJECT_BLOCK_REGEX, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function serializeObjects(objects: SceneObjectSpec[]): string {
  return objects
    .map((obj) => `[3D_OBJECT]${JSON.stringify(obj)}[/3D_OBJECT]`)
    .join('\n');
}

interface OfflineScenario {
  text: Record<Lang, string>;
  objects: SceneObjectSpec[];
}

const SCENARIO_INSULIN: OfflineScenario = {
  text: {
    en: 'Human Insulin (51 amino acids: 21-AA A-chain + 30-AA B-chain) crosses the US FDA 40-AA statutory threshold (85 FR 10057, 2020) and is therefore regulated as a biologic (BLA) rather than a small synthetic peptide. Its tertiary fold is locked by three covalent disulfide bridges (–S–S–): two inter-chain bridges (A7–B7 and A20–B19) and one intra-chain loop (A6–A11).',
    zh: '人胰岛素共 51 个氨基酸（A 链 21 AA + B 链 30 AA），超越美国 FDA 2020 年 85 FR 10057 规则的 40 氨基酸分界线，因此在法规上属于生物制品（BLA）而非化学合成多肽。其三维折叠依赖 3 对共价二硫键（–S–S–）刚性锁死：两条链间二硫键（A7–B7、A20–B19）以及一条链内二硫键（A6–A11）。',
    th: 'อินซูลินมนุษย์ประกอบด้วยกรดอะมิโน 51 ตัว (สาย A 21 AA + สาย B 30 AA) ซึ่งเกินเกณฑ์ 40 กรดอะมิโนของ US FDA (85 FR 10057) จึงจัดเป็นชีววัตถุ (BLA) โครงสร้าง 3 มิติถูกยึดไว้อย่างเสถียรด้วยพันธะไดซัลไฟด์ (–S–S–) 3 แห่ง ได้แก่ พันธะข้ามสาย A7–B7, A20–B19 และพันธะภายในสาย A6–A11',
  },
  objects: [
    {
      id: 'insulin-b-chain',
      type: 'helix',
      position: [-1.1, 0, 0],
      color: '#38bdf8',
      args: [0.46, 3.6, 3.2, 0.08],
      label: 'B-Chain (30 AA)',
      metalness: 0.35,
      roughness: 0.3,
    },
    {
      id: 'insulin-a-chain',
      type: 'helix',
      position: [1.1, 0.25, 0],
      color: '#a855f7',
      args: [0.38, 2.5, 2.2, 0.075],
      label: 'A-Chain (21 AA)',
      metalness: 0.35,
      roughness: 0.3,
    },
    {
      id: 'ss-a7-b7-s1',
      type: 'sphere',
      position: [-0.65, 0.9, 0.2],
      color: '#facc15',
      args: [0.16, 20, 20],
      emissive: '#854d0e',
      label: 'Cys B7 (S)',
    },
    {
      id: 'ss-a7-b7-s2',
      type: 'sphere',
      position: [0.7, 0.9, 0.2],
      color: '#facc15',
      args: [0.16, 20, 20],
      emissive: '#854d0e',
      label: 'Cys A7 (S)',
    },
    {
      id: 'ss-bond-inter-1',
      type: 'bond',
      position: [-0.65, 0.9, 0.2],
      color: '#fde047',
      args: [0.7, 0.9, 0.2, 0.055],
      emissive: '#ca8a04',
      label: 'Disulfide A7–B7',
    },
    {
      id: 'ss-a20-b19-s1',
      type: 'sphere',
      position: [-0.65, -0.75, -0.15],
      color: '#facc15',
      args: [0.16, 20, 20],
      emissive: '#854d0e',
      label: 'Cys B19 (S)',
    },
    {
      id: 'ss-a20-b19-s2',
      type: 'sphere',
      position: [0.7, -0.75, -0.15],
      color: '#facc15',
      args: [0.16, 20, 20],
      emissive: '#854d0e',
      label: 'Cys A20 (S)',
    },
    {
      id: 'ss-bond-inter-2',
      type: 'bond',
      position: [-0.65, -0.75, -0.15],
      color: '#fde047',
      args: [0.7, -0.75, -0.15, 0.055],
      emissive: '#ca8a04',
      label: 'Disulfide A20–B19',
    },
    {
      id: 'ss-bond-intra',
      type: 'bond',
      position: [1.38, 0.55, 0.28],
      color: '#fb923c',
      args: [1.38, 1.25, -0.22, 0.045],
      emissive: '#9a3412',
      label: 'Intra-chain A6–A11',
    },
    {
      id: 'fda-40aa-threshold-ring',
      type: 'ring',
      position: [0, -2.05, 0],
      rotation: [1.57, 0, 0],
      color: '#ef4444',
      args: [1.85, 2.02, 48],
      emissive: '#7f1d1d',
      label: 'FDA 40-AA BLA Boundary (51 AA > 40)',
    },
  ],
};

const SCENARIO_GPCR: OfflineScenario = {
  text: {
    en: 'Cryo-EM structure PDB 5VAI (Zhang et al., Nature 2017; ~4.1 Å) reveals how GLP-1 docks into the 7-transmembrane Class B GLP-1R embedded in the phospholipid bilayer. Agonist clasping induces a sharp outward kink in TM6, opening the intracellular pocket for the Gs α5 helix to trigger an intracellular cAMP surge.',
    zh: '冷冻电镜结构 PDB 5VAI（Zhang 等，Nature 2017，分辨率约 4.1 Å）清晰展示了 GLP-1 如何插入镶嵌于磷脂双分子层中的 7 次跨膜 Class B GPCR 受体。配体双域钳夹后诱导第 6 跨膜螺旋（TM6）剧烈折弯外摆，腾出胞内口袋接纳 Gs 蛋白 α5 螺旋，随即引爆第二信使 cAMP 信号瀑布。',
    th: 'โครงสร้างไครโออีเอ็ม PDB 5VAI (Zhang et al., Nature 2017; ~4.1 Å) เผยกลไกของ GLP-1R ซึ่งเป็น Class B GPCR 7 เกลียวในเยื่อหุ้มเซลล์ฟอสโฟลิพิด เมื่อ GLP-1 เข้าจับ เกลียว TM6 จะหักงอและกางออกด้านนอก เปิดช่องให้โปรตีน Gs เข้าเชื่อมต่อและกระตุ้นการพุ่งขึ้นของสัญญาณ cAMP ภายในเซลล์',
  },
  objects: [
    {
      id: 'bilayer-upper-leaflet',
      type: 'box',
      position: [0, 0.85, 0],
      color: '#0284c7',
      args: [6.2, 0.18, 3.6],
      roughness: 0.45,
      label: 'Extracellular Phospholipid Leaflet',
    },
    {
      id: 'bilayer-lower-leaflet',
      type: 'box',
      position: [0, -0.85, 0],
      color: '#0369a1',
      args: [6.2, 0.18, 3.6],
      roughness: 0.45,
      label: 'Intracellular Phospholipid Leaflet',
    },
    {
      id: 'gpcr-tm1',
      type: 'cylinder',
      position: [-1.1, 0, 0.55],
      color: '#14b8a6',
      args: [0.16, 0.16, 2.3, 18],
      label: 'TM1',
    },
    {
      id: 'gpcr-tm2',
      type: 'cylinder',
      position: [-0.6, 0, 0.95],
      color: '#14b8a6',
      args: [0.16, 0.16, 2.3, 18],
      label: 'TM2',
    },
    {
      id: 'gpcr-tm3',
      type: 'cylinder',
      position: [0.15, 0, 0.85],
      color: '#2dd4bf',
      args: [0.16, 0.16, 2.35, 18],
      label: 'TM3',
    },
    {
      id: 'gpcr-tm4',
      type: 'cylinder',
      position: [-0.9, 0, -0.45],
      color: '#0d9488',
      args: [0.16, 0.16, 2.25, 18],
      label: 'TM4',
    },
    {
      id: 'gpcr-tm5',
      type: 'cylinder',
      position: [0.05, 0, -0.8],
      color: '#14b8a6',
      args: [0.16, 0.16, 2.3, 18],
      label: 'TM5',
    },
    {
      id: 'gpcr-tm6-kinked',
      type: 'cylinder',
      position: [1.15, -0.15, -0.25],
      rotation: [0, 0, -0.48],
      color: '#f97316',
      args: [0.18, 0.18, 2.45, 18],
      emissive: '#9a3412',
      label: 'TM6 Outward Kink (Activated)',
    },
    {
      id: 'gpcr-tm7',
      type: 'cylinder',
      position: [0.85, 0, 0.55],
      color: '#2dd4bf',
      args: [0.16, 0.16, 2.3, 18],
      label: 'TM7',
    },
    {
      id: 'glp1-ligand-key',
      type: 'helix',
      position: [0.1, 1.55, 0.1],
      color: '#f43f5e',
      args: [0.24, 1.75, 2.4, 0.06],
      emissive: '#881337',
      label: 'GLP-1 / Semaglutide Ligand',
    },
    {
      id: 'gs-alpha-subunit',
      type: 'sphere',
      position: [0.25, -1.85, 0],
      color: '#a855f7',
      args: [0.58, 24, 24],
      emissive: '#581c87',
      label: 'Gs Protein α5 Cavity Dock',
    },
    {
      id: 'camp-burst-1',
      type: 'sphere',
      position: [-0.85, -2.55, 0.45],
      color: '#facc15',
      args: [0.15, 16, 16],
      emissive: '#ca8a04',
      label: 'cAMP',
    },
    {
      id: 'camp-burst-2',
      type: 'sphere',
      position: [0.95, -2.65, -0.35],
      color: '#facc15',
      args: [0.17, 16, 16],
      emissive: '#ca8a04',
      label: 'cAMP Cascade',
    },
  ],
};

const SCENARIO_SPPS: OfflineScenario = {
  text: {
    en: 'Solid-Phase Peptide Synthesis (SPPS), pioneered by R. B. Merrifield (J. Am. Chem. Soc. 1963), anchors the C-terminus onto an insoluble crosslinked polymer resin bead. Cyclic Fmoc deprotection, amino acid coupling, and wash steps drive near-quantitative yields—scaled today by automated TIDES CDMOs such as WuXi TIDES to produce multi-ton peptide APIs.',
    zh: '固相多肽合成（SPPS）由诺奖得主 R. B. Merrifield 于 1963 年开创：将 C 端锚定在不溶性交联聚苯乙烯树脂微球上，通过“Fmoc 脱保护 → 偶联下一氨基酸 → 溶剂洗涤”闭环推进，彻底摆脱每步重结晶的瓶颈。如今该工艺已在如 WuXi TIDES 等现代化 CDMO 升级为吨级自动化产线。',
    th: 'การสังเคราะห์เพปไทด์บนวัฏภาคของแข็ง (SPPS) ที่บุกเบิกโดย R. B. Merrifield (1963) ยึดปลาย C ของกรดอะมิโนเข้ากับเม็ดเรซินพอลิเมอร์ที่ไม่ละลายน้ำ แล้วทำวัฏจักรปลดหมู่ Fmoc และเชื่อมต่อทีละตัวจนได้ความบริสุทธิ์สูง ซึ่งขยายสู่โรงงาน TIDES CDMO สมัยใหม่อย่าง WuXi TIDES',
  },
  objects: [
    {
      id: 'spps-resin-bead',
      type: 'sphere',
      position: [-2.1, 0, 0],
      color: '#f59e0b',
      args: [1.05, 32, 32],
      roughness: 0.4,
      metalness: 0.1,
      label: 'Crosslinked Polystyrene Resin Bead',
    },
    {
      id: 'spps-linker-stalk',
      type: 'cylinder',
      position: [-0.85, 0, 0],
      rotation: [0, 0, 1.57],
      color: '#94a3b8',
      args: [0.09, 0.09, 0.7, 16],
      label: 'Acid-Labile Linker',
    },
    {
      id: 'spps-aa-1',
      type: 'sphere',
      position: [-0.25, 0.12, 0],
      color: '#38bdf8',
      args: [0.24, 20, 20],
      label: 'AA-1 (C-Term)',
    },
    {
      id: 'spps-bond-1',
      type: 'bond',
      position: [-0.25, 0.12, 0],
      color: '#e2e8f0',
      args: [0.45, -0.14, 0.1, 0.055],
      label: 'Planar Peptide Bond',
    },
    {
      id: 'spps-aa-2',
      type: 'sphere',
      position: [0.45, -0.14, 0.1],
      color: '#22d3ee',
      args: [0.24, 20, 20],
      label: 'AA-2',
    },
    {
      id: 'spps-bond-2',
      type: 'bond',
      position: [0.45, -0.14, 0.1],
      color: '#e2e8f0',
      args: [1.15, 0.18, -0.08, 0.055],
    },
    {
      id: 'spps-aa-3',
      type: 'sphere',
      position: [1.15, 0.18, -0.08],
      color: '#34d399',
      args: [0.24, 20, 20],
      label: 'AA-3',
    },
    {
      id: 'spps-bond-3',
      type: 'bond',
      position: [1.15, 0.18, -0.08],
      color: '#e2e8f0',
      args: [1.85, -0.08, 0.12, 0.055],
    },
    {
      id: 'spps-aa-4',
      type: 'sphere',
      position: [1.85, -0.08, 0.12],
      color: '#818cf8',
      args: [0.24, 20, 20],
      label: 'AA-4 (Growing N-Term)',
    },
    {
      id: 'spps-fmoc-cap',
      type: 'ring',
      position: [2.35, -0.08, 0.12],
      rotation: [0, 1.57, 0],
      color: '#f43f5e',
      args: [0.16, 0.34, 28],
      emissive: '#881337',
      label: 'Fmoc Protecting Cap',
    },
  ],
};

const SCENARIO_COLLAGEN: OfflineScenario = {
  text: {
    en: 'Collagen forms a tight left-handed polyproline-II triple helix built on Gly-X-Y repeats, whereas topical skincare peptides like Matrixyl (Pal-KTTKS, C16 lipid tail) and Argireline (SNAP-25 mimic) are short signal fragments constrained by the ~500 Da stratum corneum barrier. Notably, a 2025 Am. J. Med. meta-analysis of 23 RCTs (n=1,474) found no statistically significant skin aging benefit in non-industry-funded or high-quality oral collagen trials.',
    zh: '天然胶原蛋白是由 Gly-X-Y 重复序列缠绕而成的刚性三股超螺旋，分子量庞大；而外用护肤肽如 Matrixyl（Pal-KTTKS 挂 C16 棕榈酸尾增脂溶）与 Argireline（模拟 SNAP-25）则受制于皮肤角质层约 500 Da 渗透规则。更需理性看待的是：2025 年《美国医学杂志》对 23 项口服胶原肽 RCT（1,474 人）的荟萃分析指出，在独立非厂商资助与高质量研究中，未见皮肤水合、弹性或皱纹的显著改善。',
    th: 'คอลลาเจนมีโครงสร้างเกลียวสามสาย (Triple Helix) จากลำดับ Gly-X-Y ที่มีขนาดใหญ่เกินกำแพงผิว ~500 Da ส่วนเพปไทด์เครื่องสำอางอย่าง Matrixyl (Pal-KTTKS) และ Argireline ออกฤทธิ์เฉพาะพื้นผิวภายนอก ทั้งนี้ เมตาวิเคราะห์ใน Am. J. Med. ปี 2025 (23 RCTs, n=1,474) พบว่างานวิจัยคุณภาพสูงที่ปราศจากทุนผู้ผลิตไม่พบผลแตกต่างอย่างมีนัยสำคัญจากการรับประทานคอลลาเจน',
  },
  objects: [
    {
      id: 'collagen-strand-1',
      type: 'helix',
      position: [-0.8, 0, 0],
      color: '#f472b6',
      args: [0.22, 3.8, 4.0, 0.065],
      label: 'Collagen α1 Strand (Gly-X-Y)',
    },
    {
      id: 'collagen-strand-2',
      type: 'helix',
      position: [-0.58, 0, 0.22],
      rotation: [0, 2.09, 0],
      color: '#fb7185',
      args: [0.22, 3.8, 4.0, 0.065],
      label: 'Collagen α2 Strand',
    },
    {
      id: 'collagen-strand-3',
      type: 'helix',
      position: [-1.02, 0, 0.22],
      rotation: [0, 4.18, 0],
      color: '#e879f9',
      args: [0.22, 3.8, 4.0, 0.065],
      label: 'Collagen Triple Helix',
    },
    {
      id: 'stratum-corneum-barrier',
      type: 'box',
      position: [0.65, 0.35, 0],
      color: '#fbbf24',
      args: [0.16, 3.6, 2.6],
      roughness: 0.6,
      label: 'Stratum Corneum (~500 Da Barrier)',
    },
    {
      id: 'pal-kttks-peptide',
      type: 'sphere',
      position: [1.75, 0.5, 0],
      color: '#34d399',
      args: [0.26, 20, 20],
      label: 'KTTKS Pentapeptide Head',
    },
    {
      id: 'pal-kttks-c16-tail',
      type: 'cylinder',
      position: [1.28, 0.5, 0],
      rotation: [0, 0, 1.57],
      color: '#f59e0b',
      args: [0.07, 0.07, 0.85, 16],
      label: 'C16 Palmitoyl Tail (Lipophilic)',
    },
    {
      id: 'argireline-hexapeptide',
      type: 'cylinder',
      position: [1.7, -0.75, 0.25],
      rotation: [0.3, 0, 1.2],
      color: '#38bdf8',
      args: [0.11, 0.11, 1.1, 16],
      label: 'Argireline (Ac-EEMQRR-NH₂)',
    },
  ],
};

const SCENARIO_DEFAULT_SEMAGLUTIDE: OfflineScenario = {
  text: {
    en: 'Semaglutide (31 AA, PDB 4ZGM; Lau et al., J. Med. Chem. 2015) solves native GLP-1’s <2-minute DPP-4 cleavage by replacing Ala8 with bulky Aib8 and attaching a C18 fatty diacid at Lys26. This enables reversible human serum albumin (HSA) hitchhiking for a ~165-hour (~1 week) half-life. (Educational visualization only; injectable GLP-1 agents require medical prescription.)',
    zh: '司美格鲁肽（31 AA，PDB 4ZGM；Lau 等，J. Med. Chem. 2015）针对天然 GLP-1 不足 2 分钟即被 DPP-4 酶切的痛点，以大位阻非天然氨基酸 Aib8 构筑抗酶解护甲，并在 Lys26 连接 C18 脂肪酸二酸可逆锚定人血清白蛋白（HSA），将消除半衰期延长至约 165 小时（每周一次给药）。（仅作科普演示，注射用 GLP-1 为严格处方药）',
    th: 'Semaglutide (31 AA, PDB 4ZGM; Lau et al., 2015) แก้ปัญหา GLP-1 ธรรมชาติที่ถูกเอนไซม์ DPP-4 ตัดภายใน <2 นาที โดยใช้กรดอะมิโนสังเคราะห์ Aib8 เป็นเกราะป้องกัน และต่อสายไขมัน C18 diacid ที่ Lys26 เพื่อจับกับอัลบูมินในซีรัม ยืดครึ่งชีวิตเป็น ~165 ชั่วโมง (เพื่อการศึกษาเท่านั้น ยาฉีด GLP-1 เป็นยาควบคุมพิเศษ)',
  },
  objects: [
    {
      id: 'sema-alpha-helix',
      type: 'helix',
      position: [-0.35, 0, 0],
      color: '#38bdf8',
      args: [0.48, 3.6, 3.5, 0.085],
      metalness: 0.3,
      roughness: 0.25,
      label: 'Semaglutide 31-AA α-Helix (3.6 AA/turn)',
    },
    {
      id: 'sema-aib8-armor',
      type: 'ring',
      position: [-0.35, 1.25, 0],
      rotation: [1.57, 0, 0],
      color: '#22c55e',
      args: [0.55, 0.78, 32],
      emissive: '#14532d',
      label: 'Aib8 Steric Armor (Blocks DPP-4)',
    },
    {
      id: 'dpp4-scissors-blocked',
      type: 'cone',
      position: [-1.7, 1.45, 0.3],
      rotation: [0, 0, -1.2],
      color: '#ef4444',
      args: [0.35, 0.75, 24],
      emissive: '#7f1d1d',
      label: 'DPP-4 Cleavage Site Deflected',
    },
    {
      id: 'lys26-linker-bond',
      type: 'bond',
      position: [0.1, -0.55, 0],
      color: '#fbbf24',
      args: [1.25, -0.55, 0.15, 0.06],
      label: 'Lys26 γ-Glu-2xOEG Linker',
    },
    {
      id: 'c18-diacid-chain',
      type: 'cylinder',
      position: [1.55, -0.55, 0.15],
      rotation: [0, 0, 1.57],
      color: '#f59e0b',
      args: [0.09, 0.09, 0.9, 16],
      label: 'C18 Fatty Diacid Anchor',
    },
    {
      id: 'hsa-albumin-pocket',
      type: 'sphere',
      position: [2.55, -0.55, 0.15],
      color: '#8b5cf6',
      args: [0.78, 28, 28],
      roughness: 0.35,
      emissive: '#4c1d95',
      label: 'Serum Albumin (~165h Half-Life)',
    },
  ],
};

function selectOfflineScenario(prompt: string): OfflineScenario {
  const q = prompt.toLowerCase();

  if (
    /insulin|disulfide|51\s*aa|bla|胰岛素|二硫键|อินซูลิน|ไดซัลไฟด์/.test(q)
  ) {
    return SCENARIO_INSULIN;
  }

  if (
    /gpcr|5vai|tm6|camp|bilayer|membrane|receptor|受体|跨膜|膜|ตัวรับ|เยื่อหุ้ม/.test(
      q
    )
  ) {
    return SCENARIO_GPCR;
  }

  if (
    /spps|resin|merrifield|fmoc|tides|solid|合成|树脂|固相|เรซิน|สังเคราะห์/.test(
      q
    )
  ) {
    return SCENARIO_SPPS;
  }

  if (
    /collagen|skin|argireline|matrixyl|kttks|snap|cosmetic|rct|胶原|护肤|皱纹|角质|คอลลาเจน|สกินแคร์|ผิวหนัง/.test(
      q
    )
  ) {
    return SCENARIO_COLLAGEN;
  }

  return SCENARIO_DEFAULT_SEMAGLUTIDE;
}

function buildOfflineResult(prompt: string, lang: Lang): AskScience3DResult {
  const scenario = selectOfflineScenario(prompt);
  const explanation = scenario.text[lang];
  const rawText = `${explanation}\n\n${serializeObjects(scenario.objects)}`;
  const objects = extractObjects(rawText);
  const cleanText = stripObjectBlocks(rawText);
  return {
    rawText,
    cleanText,
    objects,
    source: 'offline-sim',
  };
}

function getLangInstruction(lang: Lang): string {
  switch (lang) {
    case 'zh':
      return 'Respond in Simplified Chinese (简体中文).';
    case 'th':
      return 'Respond in Thai (ภาษาไทย).';
    case 'en':
    default:
      return 'Respond in English.';
  }
}

export async function askScience3D(
  prompt: string,
  lang: Lang,
  apiKey?: string
): Promise<AskScience3DResult> {
  const trimmedPrompt = prompt.trim();
  const effectivePrompt =
    trimmedPrompt.length > 0
      ? trimmedPrompt
      : 'Semaglutide Aib8 and C18 albumin binding 3D overview';
  const trimmedKey = apiKey?.trim();

  if (!trimmedKey) {
    return buildOfflineResult(effectivePrompt, lang);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: trimmedKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${getLangInstruction(lang)}\n\nStudent Question: ${effectivePrompt}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4,
      },
    });

    const rawText = response.text?.trim() ?? '';
    if (!rawText) {
      return buildOfflineResult(effectivePrompt, lang);
    }

    let objects = extractObjects(rawText);
    let finalRaw = rawText;

    // Guarantee valid 3D output even if the model returned prose without [3D_OBJECT] tags
    if (objects.length === 0) {
      const fallback = selectOfflineScenario(effectivePrompt);
      finalRaw = `${rawText}\n\n${serializeObjects(fallback.objects)}`;
      objects = extractObjects(finalRaw);
    }

    return {
      rawText: finalRaw,
      cleanText: stripObjectBlocks(finalRaw),
      objects,
      source: 'gemini',
    };
  } catch {
    return buildOfflineResult(effectivePrompt, lang);
  }
}
