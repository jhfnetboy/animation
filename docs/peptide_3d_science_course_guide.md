# 基于 Gemini + React Three Fiber 的肽、多肽与人体作用机制 3D 科普课程教学指南

> **Trilingual Edition Notice / 三语课程导览 / คู่มือการสอนหลักสูตรสามภาษา (EN · 中文 · ภาษาไทย)**  
> **目标路径**: `docs/peptide_3d_science_course_guide.md`  
> **适用架构栈**: React 19 · Three.js (`0.175.0`) · React Three Fiber (`@react-three/fiber` v9) · `@react-three/drei` (v10) · `@google/genai` (`1.30.0`)（对齐 [`demos/demo4-r3f-peptide-lab/package.json`](file:///Users/jason/Dev/jhfnetboy/animation/demos/demo4-r3f-peptide-lab/package.json)）  
> **受众定位**: 生物医药科普编剧、国际学校 STEM/IB 教师、3D 科学交互前端架构师及合规审核员

---

## 核心双语-三语科学术语对照表（EN / 中文 / ภาษาไทย）

| English | 简体中文 | ภาษาไทย (Thai) | 教学/科学说明 |
| :--- | :--- | :--- | :--- |
| **Amino Acid** | 氨基酸 | กรดอะมิโน | 构成肽与蛋白质的基本单体，含氨基（$-\text{NH}_2$）与羧基（$-\text{COOH}$） |
| **Peptide Bond** | 肽键 | พันธะเพปไทด์ | 脱水缩合形成的刚性共面酰胺键（$-\text{CO–NH}-$） |
| **Peptide / Polypeptide** | 肽 / 多肽 | เปปไทด์ / พอลิเปปไทด์ | 短链或中等长度氨基酸聚合物；U.S. FDA 将 $\le 40\text{ AA}$ 归入多肽监管边界 |
| **Protein** | 蛋白质 | โปรตีน | $> 40\text{ AA}$ 且具有特定序列及三维折叠结构的多肽链/复合物 |
| **$\alpha$-Helix** | $\alpha$-螺旋 | เกลียวแอลฟา ($\alpha$-helix) | 每圈约 3.6 个残基、螺距 5.4 Å、由 $i \to i+4$ 氢键稳定的右手螺旋二级结构 |
| **Hydrogen Bond** | 氢键 | พันธะไฮโดรเจน | 驱动 $\alpha$-螺旋与受体结合的非共价静电吸引作用 |
| **Solid-Phase Peptide Synthesis (SPPS)** | 固相多肽合成 | การสังเคราะห์เปปไทด์บนวัฏภาคของแข็ง (SPPS) | 1963 年 Merrifield 发明的树脂锚定合成法，现代多肽 CDMO 规模生产基石 |
| **GLP-1 (Glucagon-Like Peptide-1)** | 胰高血糖素样肽-1 | ฮอร์โมน GLP-1 (เปปไทด์คล้ายกลูคากอน-1) | 肠道 L 细胞分泌的肠促胰素，人内源性形式在血浆中半衰期仅约 1–2 分钟 |
| **DPP-4 (Dipeptidyl Peptidase-4)** | 二肽基肽酶-4 | เอนไซม์ DPP-4 | 在第 8 位丙氨酸处快速切断原生 GLP-1 的蛋白酶“分子剪刀” |
| **Human Serum Albumin (HSA)** | 人血清白蛋白 | โปรตีนอัลบูมินในกระแสเลือด | 血液中含量最高的载体蛋白；脂肪酸链可逆结合白蛋白以延长药物半衰期 |
| **Phospholipid Bilayer** | 磷脂双分子层 | เยื่อหุ้มเซลล์ฟอสโฟลิพิดสองชั้น | 亲水头朝外、疏水尾朝内的细胞膜流动镶嵌屏障 |
| **GPCR (G Protein-Coupled Receptor)** | G 蛋白偶联受体 | ตัวรับชนิดจับคู่กับโปรตีนจี (GPCR) | 七次跨膜（7TM）细胞表面“分子门锁”，如 GLP-1R |
| **TM6 Outward Pivot & $G_s$ Protein** | TM6 外摆与 $G_s$ 蛋白 | การเปิดออกของเกลียว TM6 และโปรตีนจี ($G_s$) | GLP-1R 激活时第 6 跨膜螺旋弯折外摆，容纳 $G_s$ 蛋白的 $\alpha5$ 螺旋 |
| **Cyclic AMP (cAMP)** | 环磷酸腺苷（第二信使） | สารส่งสัญญาณภายในเซลล์ cAMP | 由腺苷酸环化酶生成，在胞内放大触发胰岛素分泌或饱腹神经信号 |
| **Half-life ($t_{1/2}$)** | 消除半衰期 | ค่าครึ่งชีวิต (Half-life) | 血药浓度降低一半所需时间（原生 GLP-1 约 1–2 分钟 vs Semaglutide 约 165 小时） |
| **NDA / BLA / Thai FDA (อย.)** | 新药申请 / 生物制品许可 / 泰国食药监局 | การขึ้นทะเบียนยา NDA / ชีววัตถุ BLA / สำนักงานคณะกรรมการอาหารและยา (อย.) | 决定分子归属药品、生物制品、膳食补充剂或化妆品的法定边界 |

---

## 一、技术架构拆解：Gemini + React Three Fiber `[3D_OBJECT]` 科学交互管线

本节参考 **`blog.mushroom.cv`（Mycelium Research Blog）** 提出的「Gemini + React Three Fiber (R3F) 3D 科学互动应用指南」工程范式，结合本仓库 [`demos/demo4-r3f-peptide-lab/package.json`](file:///Users/jason/Dev/jhfnetboy/animation/demos/demo4-r3f-peptide-lab/package.json) 所采用的现代前端生态（React 19、Three.js 0.175、R3F v9、`@react-three/drei` v10 与 `@google/genai` SDK），解析**“AI 说结构化 JSON → 前端安全解析 → 声明式 3D 渲染”**的完整科学可视化架构。

### 1.1 为什么不让 AI 直接生成 Three.js / WebGL 代码？

在传统演示中，直接让大语言模型输出 `new THREE.Mesh(...)` 等可执行 JavaScript 代码虽然看似灵活，但在 K–12 课堂与科研科普产品中存在三类致命工程缺陷：

1. **沙箱越狱与 XSS 安全风险**：动态执行模型输出的 JS 字符串（`eval` / `new Function` / 动态 `<script>` 注入）会把提示词注入（Prompt Injection）直接升级为浏览器端跨站脚本攻击，窃取本地凭据或破坏宿主页状态。
2. **WebGL 资源泄漏与崩溃**：AI 在流式输出中极易漏写 `geometry.dispose()` / `material.dispose()`，或在 React 严格模式下重复创建 `WebGLRenderer`，迅速耗尽浏览器最大 8–16 个 WebGL 上下文配额并导致显卡驱动重置（Context Lost）。
3. **科学真实性失控（幻觉几何）**：直接编写低阶坐标代码时，AI 常生成错误的键角、悬浮的孤立原子或不符合热力学的穿模膜结构；而通过**限定原语（Primitive）与参数范围的结构化 JSON**，所有 3D 分子几何数学公式、PDB 骨架拓扑与 CPK 色彩标准均固化在经过审计的前端 R3F 组件中，AI 仅担任**“科学实验导演”**而非**“无约束的底层渲染程序员”**。

### 1.2 端到端 `[3D_OBJECT]` 安全交互管线

`blog.mushroom.cv` 范式的核心抽象为：**“Gemini 作为科学推理大脑，React Three Fiber 作为声明式光学眼睛，中间以严格界定的 `[3D_OBJECT]{...}[/3D_OBJECT]` 协议作为沙箱契约。”**

```mermaid
flowchart LR
    U["用户提问 / 课程章节点击<br/>(例如：为什么 Semaglutide 能管一周？)"] --> P["系统提示词注入<br/>(限定 [3D_OBJECT] 白名单 Schema)"]
    P --> G["Gemini 模型 (@google/genai)<br/>流式输出科普文本 + [3D_OBJECT]{...}[/3D_OBJECT]"]
    G --> E["extractObjects() 安全解析器<br/>1. 正则抽取完整/闭合标签<br/>2. JSON.parse 异常隔离<br/>3. TypeScript/Schema 白名单校验与边界裁剪"]
    E -->|剥离标签后的纯文本| C["教学对话气泡 / 三语字幕区"]
    E -->|校验通过的 SceneSpec[]| S["React State 场景状态总线"]
    S --> R3F["React Three Fiber <Canvas><br/><OrbitControls> + <Environment> + 生物分子渲染器"]
    R3F --> GPU["WebGL2 / PBR 次表面散射与 InstancedMesh 渲染"]
```

### 1.3 `[3D_OBJECT]` 协议规范与 `extractObjects()` 安全解析参考实现

为了在流式输出（Streaming）和单轮响应中都能稳定驱动 3D 实验台，系统约定 AI 将教学解说文字与 3D 控制荷载分离，3D 指令必须严格包裹在 `[3D_OBJECT]` 与 `[/3D_OBJECT]` 定界符之间：

```text
这是 Semaglutide（31 个氨基酸）抵抗 DPP-4 酶解并结合血清白蛋白的机制……
[3D_OBJECT]
{
  "sceneId": "semaglutide_albumin_shield",
  "preset": "semaglutide_albumin",
  "highlightResidues": [8, 26, 34],
  "showDpp4Scissors": true,
  "albuminBinding": true,
  "cameraTarget": [0, 0.5, 0],
  "pbrMode": "subsurface",
  "annotations": [
    { "label": "Aib8 Shield (Anti-DPP-4)", "position": [-1.8, 1.2, 0.4], "color": "#22d3ee" },
    { "label": "Lys26-γGlu-2xOEG-C18 -> Albumin", "position": [2.1, -0.6, 0.8], "color": "#f59e0b" }
  ]
}
[/3D_OBJECT]
```

#### 前端安全解析与防越界白名单校验（TypeScript 参考实现）

```typescript
export type PeptidePreset =
  | 'peptide_bond'
  | 'alpha_helix'
  | 'fda_40aa_ruler'
  | 'semaglutide_albumin'
  | 'gpcr_membrane_5vai'
  | 'cosmetic_barrier';

export interface Annotation3D {
  label: string;
  position: [number, number, number];
  color: string;
}

export interface PeptideSceneObject {
  sceneId: string;
  preset: PeptidePreset;
  aminoAcidCount?: number;
  highlightResidues?: number[];
  showDpp4Scissors?: boolean;
  albuminBinding?: boolean;
  tm6Activation?: number; // 0 (静息态) ~ 1 (5VAI 激活外摆态)
  pbrMode?: 'cpk' | 'ribbon' | 'subsurface';
  cameraTarget?: [number, number, number];
  annotations?: Annotation3D[];
}

const ALLOWED_PRESETS = new Set<PeptidePreset>([
  'peptide_bond',
  'alpha_helix',
  'fda_40aa_ruler',
  'semaglutide_albumin',
  'gpcr_membrane_5vai',
  'cosmetic_barrier',
]);

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function clampNumber(val: unknown, min: number, max: number, fallback: number): number {
  const n = typeof val === 'number' && Number.isFinite(val) ? val : fallback;
  return Math.min(max, Math.max(min, n));
}

function sanitizeVec3(raw: unknown, fallback: [number, number, number]): [number, number, number] {
  if (!Array.isArray(raw) || raw.length !== 3) return fallback;
  return [
    clampNumber(raw[0], -20, 20, fallback[0]),
    clampNumber(raw[1], -20, 20, fallback[1]),
    clampNumber(raw[2], -20, 20, fallback[2]),
  ];
}

/**
 * extractObjects(): 从 Gemini 输出流中安全剥离并校验 [3D_OBJECT]{...}[/3D_OBJECT] 荷载
 * - 绝不执行 eval / Function
 * - 自动忽略未闭合的流式半包，避免渲染闪烁
 * - 对数值、数组长度与颜色做严格边界裁剪，防止 WebGL 显存爆炸
 */
export function extractObjects(rawText: string): {
  cleanNarrative: string;
  objects: PeptideSceneObject[];
} {
  const objects: PeptideSceneObject[] = [];
  const blockRegex = /\[3D_OBJECT\]([\s\S]*?)\[\/3D_OBJECT\]/g;

  let match: RegExpExecArray | null;
  while ((match = blockRegex.exec(rawText)) !== null) {
    const jsonSlice = match[1].trim();
    if (jsonSlice.length > 16_384) continue; // 防止超长畸形载荷

    try {
      const parsed = JSON.parse(jsonSlice) as Record<string, unknown>;
      const preset = parsed.preset as PeptidePreset;
      if (!ALLOWED_PRESETS.has(preset)) continue;

      const rawAnnotations = Array.isArray(parsed.annotations) ? parsed.annotations.slice(0, 12) : [];
      const annotations: Annotation3D[] = rawAnnotations
        .filter((a): a is Record<string, unknown> => Boolean(a && typeof a === 'object'))
        .map((a) => ({
          label: String(a.label ?? '').slice(0, 64),
          position: sanitizeVec3(a.position, [0, 0, 0]),
          color: typeof a.color === 'string' && HEX_COLOR_RE.test(a.color) ? a.color : '#38bdf8',
        }));

      const rawHighlights = Array.isArray(parsed.highlightResidues)
        ? parsed.highlightResidues.slice(0, 60)
        : [];

      objects.push({
        sceneId: String(parsed.sceneId ?? preset).slice(0, 48),
        preset,
        aminoAcidCount: parsed.aminoAcidCount !== undefined
          ? Math.round(clampNumber(parsed.aminoAcidCount, 1, 200, 31))
          : undefined,
        highlightResidues: rawHighlights
          .map((n) => Math.round(clampNumber(n, 1, 200, 1)))
          .filter((n, idx, arr) => arr.indexOf(n) === idx),
        showDpp4Scissors: Boolean(parsed.showDpp4Scissors),
        albuminBinding: Boolean(parsed.albuminBinding),
        tm6Activation: clampNumber(parsed.tm6Activation, 0, 1, 0),
        pbrMode:
          parsed.pbrMode === 'cpk' || parsed.pbrMode === 'ribbon' || parsed.pbrMode === 'subsurface'
            ? parsed.pbrMode
            : 'subsurface',
        cameraTarget: sanitizeVec3(parsed.cameraTarget, [0, 0, 0]),
        annotations,
      });
    } catch {
      // 单块 JSON 损坏不影响文本展示与其余有效 3D 对象
      continue;
    }
  }

  // 清除完整块以及流式末尾尚未闭合的半截 [3D_OBJECT]... 标签，保持界面整洁
  const cleanNarrative = rawText
    .replace(blockRegex, '')
    .replace(/\[3D_OBJECT\][\s\S]*$/, '')
    .trim();

  return { cleanNarrative, objects };
}
```

### 1.4 生物分子 R3F 声明式画布与 PBR 次表面散射扩展

在前端渲染层，React Three Fiber `<Canvas>` 配合 `@react-three/drei` 的 `<OrbitControls>` 和 `<Environment>` 构成了科学观测台。针对生物医药高分子教学，必须超越简单的哑光塑料球（`meshStandardMaterial`），引入三大生物物理视觉扩展：

#### A. CPK 标准原子配色与 PBR 次表面散射（Subsurface-like `MeshPhysicalMaterial`）

生物分子在电子显微镜与科学艺术渲染中常兼具“表面湿润脂质膜”和“半透有机质”的光学特性。在 Three.js `0.175` / R3F v9 中，无需高开销的多通道光线追踪，即可利用 `meshPhysicalMaterial` 的透射与厚度参数逼近生物组织次表面散射（SSS）：

| 生物元素 / 结构 | CPK 标准色值 (Hex) | PBR 材质核心参数配置 | 视觉与物理教学意义 |
| :--- | :--- | :--- | :--- |
| **碳 (C)** | `#334155`（深石墨灰） | `roughness: 0.35`, `metalness: 0.05`, `clearcoat: 0.4` | 标识分子碳骨架，突显刚性肽键平面 |
| **氮 (N)** | `#2563EB`（钴蓝） | `roughness: 0.25`, `transmission: 0.15`, `ior: 1.42` | 区分氨基末端（N-端）与酰胺键氮原子 |
| **氧 (O)** | `#DC2626`（深红） | `roughness: 0.22`, `emissive: #450a0a`, `clearcoat: 0.6` | 标识羧基、羰基氧及氢键受体位点 |
| **氢 (H)** | `#F8FAFC`（瓷白） | `roughness: 0.18`, `transmission: 0.3`, `thickness: 0.4` | 展示脱水缩合脱去的 $\text{H}_2\text{O}$ 与氢键供体 |
| **磷脂膜头部 / 白蛋白** | `#38BDF8` / `#D97706` | `transmission: 0.45`, `thickness: 1.2`, `attenuationColor`, `sheen: 0.8` | 模拟生理水合层下的生物有机体半透明散射质感 |

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';

export function PeptideLabCanvas({ children }: { children: React.ReactNode }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 2.2, 9.5], fov: 42, near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#060b16']} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 5]} intensity={1.8} color="#f8fafc" />
      <pointLight position={[-6, -3, -4]} intensity={0.9} color="#38bdf8" />

      {/* IBL 环境光照：提供生物湿润膜面的高光反射 */}
      <Environment preset="studio" environmentIntensity={0.65} />

      {children}

      <ContactShadows position={[0, -3.2, 0]} opacity={0.35} scale={18} blur={2.4} />
      <OrbitControls enableDamping dampingFactor={0.07} minDistance={3.5} maxDistance={22} />
    </Canvas>
  );
}
```

#### B. 蛋白 $\alpha$-螺旋飘带（Parametric Ribbon）数学构建

严格依据 **Pauling, Corey & Branson (1951)** 参数构建 $\alpha$-螺旋主链中心线：
- 每圈残基数 $n = 3.6$，故相邻残基绕螺旋轴旋转角 $\Delta \theta = \frac{2\pi}{3.6} = 100^\circ$；
- 每圈螺距（Pitch）$P = 5.4\text{ Å}$，即每增加 1 个残基轴向升高 $\Delta z = \frac{5.4}{3.6} = 1.5\text{ Å}$；
- 主链直径（$\text{C}_\alpha$ 半径）取 $R \approx 2.3\text{ Å}$（视觉比例缩放为 `0.9` R3F 单位）。

将采样点输入 `THREE.CatmullRomCurve3` 并使用 `TubeGeometry`（或扁平 `ExtrudeGeometry` 飘带截面），同时在 $\text{C=O}(i)$ 与 $\text{N-H}(i+4)$ 之间绘制发光虚线氢键（13 元环闭合直观展示）。

#### C. 磷脂双分子层细胞膜（`InstancedMesh` 流式波浪模拟）

单个 GPCR 跨膜区周围往往需要 $400$–$1200$ 个磷脂分子才能形成真实的“细胞边界感”。如果每个磷脂渲染独立的 `<mesh>`，将产生上千次 Draw Call 导致手机端掉帧。必须采用 Three.js **`InstancedMesh`**：
- **实例 1（亲水磷酸头部）**：`SphereGeometry(0.16, 12, 12)`，上下双层沿 $y = \pm 1.25$ 分布，在 `useFrame` 中根据二维正弦波 $y_0 + A\sin(\omega t + 0.6 x + 0.5 z)$ 实时计算 `Matrix4` 模拟细胞膜液态镶嵌流动，**单次 Draw Call** 完成全膜更新。
- **实例 2（疏水脂肪酸双尾）**：`CylinderGeometry(0.035, 0.035, 0.95, 6)`，以微倾角指向膜中央疏水核心，与头部同步脉动，形成绝佳的“水油分离”空间直觉。

---

## 二、核心科学事实、权威论文与监管依据溯源表（严谨无幻觉）

本课程所有三维模型尺寸、半衰期数值、分子改造位点及法规数字，均严格溯源至经同行评审的一手文献与官方公报，**拒绝任何未经证实的科普臆测或数字拼凑**。

### 2.1 五大权威基准与监管档案总表

| 编号 | 权威文献 / 法规档案 | 精确索引 (DOI / PDB / FR) | 核心科学事实与量化基准 | 3D 课程视觉与机制映射 |
| :--- | :--- | :--- | :--- | :--- |
| **①** | **Pauling, Corey & Branson (1951)**<br>*The structure of proteins; two hydrogen-bonded helical configurations of the polypeptide chain* | *Proc. Natl. Acad. Sci. U.S.A.* (PNAS) **37**(4): 205–211<br>DOI: `10.1073/pnas.37.4.205` | 提出氢键稳定的 $\alpha$-螺旋模型（初算 3.7 残基/圈，现代精修为 **3.6 残基/圈**）；螺距 **5.4 Å**（初算 5.44 Å）；单残基轴升 **1.5 Å**（初算 1.47 Å）；由第 $i$ 位 $\text{C=O}$ 与第 $i+4$ 位 $\text{N-H}$ 形成氢键，闭合 13 元环（$3.6_{13}$-helix） | Ch.2 & 12–25s 镜头：用数学公式驱动螺旋飘带升起，高亮每 3.6 个残基一圈及 $i \to i+4$ 发光氢键虚线 |
| **②** | **Merrifield (1963)**<br>*Solid Phase Peptide Synthesis. I. The Synthesis of a Tetrapeptide* | *J. Am. Chem. Soc.* (JACS) **85**(14): 2149–2154<br>DOI: `10.1021/ja00897a025` | 将 C-端氨基酸共价锚定于不溶性氯甲基化聚苯乙烯树脂珠，经“去保护–偶联–过滤洗涤”循环合成四肽 **L-leucyl-L-alanylglycyl-L-valine**（Leu-Ala-Gly-Val）；1984 年获诺贝尔化学奖 | Ch.2 互动实验：把传统烧瓶纯化替换为树脂微球表面循环组装，直观演示 CDMO 自动化规模量产原理 |
| **③** | **Lau et al. (2015)**<br>*Discovery of the Once-Weekly Glucagon-Like Peptide-1 (GLP-1) Analogue Semaglutide* | *J. Med. Chem.* **58**(18): 7370–7380<br>DOI: `10.1021/acs.jmedchem.5b00726`<br>PDB: **`4ZGM`** (1.80 Å X-ray) | **Semaglutide (31 AA)** 与原生 GLP-1 约 94% 同源；**Ala8→Aib8** 抗 DPP-4 酶解；**Lys34→Arg34** 确保专一修饰；**Lys26** 接枝 $\gamma\text{Glu–2}\times\text{OEG}$ 间隔臂与 **C18 脂肪酸二酸** 可逆结合血清白蛋白，将人体半衰期由原生约 **1–2 分钟**延长至约 **165 小时**（约 1 周） | Ch.3 & 25–40s 镜头：DPP-4 分子剪刀在 Aib8 护盾前弹开；Lys26 长链锚定白蛋白穿梭舰，躲避肾滤过清除 |
| **④** | **Zhang et al. (2017)**<br>*Cryo-EM structure of the activated GLP-1 receptor in complex with a G protein* | *Nature* **546**(7657): 248–253<br>DOI: `10.1038/nature22394`<br>PDB: **`5VAI`** (4.10 Å Cryo-EM) | 首个 B 类 GPCR 激活态冷冻电镜结构；激动剂多肽插入 GLP-1R 胞外域与 7 次跨膜口袋后，**TM6** 跨膜螺旋发生锐利弯折（sharp kink）并向胞内侧**外摆**，打开胞质空腔结合 **$G_s$ 蛋白** 的 $\alpha5$ 螺旋，激活腺苷酸环化酶产生 **cAMP** | Ch.4 & 40–60s 镜头：磷脂膜中的 7TM 螺旋束动态解锁，TM6 外摆吸合 $G_s$，胞内爆发金色 cAMP 粒子流 |
| **⑤** | **U.S. FDA Final Rule (2020)**<br>*Definition of the Term "Biological Product"* & 消费级肽/泰国 FDA 合规 | **85 FR 10057**（2020-02-21 发布，2020-03-23 生效）<br>补充：Myung & Park (2025) *Am. J. Med.* 138(9): 1264–1277（DOI: `10.1016/j.amjmed.2025.04.034`）；泰国 FDA 三大法案 | 确立 **40 个氨基酸**亮线：$\le 40\text{ AA}$ 为多肽/药品（**NDA**，如 Semaglutide 31 AA、Tirzepatide 39 AA）；$> 40\text{ AA}$ 为蛋白质/生物制品（**BLA**，如人胰岛素 51 AA）；同步厘清胶原蛋白肽 23 项 RCT 荟萃分析分层结论、外用肽透皮限度与泰国 FDA 法律边界 | Ch.1 & Ch.5 & 12–25s 镜头：3D 长度标尺滑块对比 5/6/31/39/51 AA，以及消费品防夸大红线排雷面板 |

### 2.2 关键科学细节防幻觉核查要点（编剧与教师必读）

1. **关于 PDB `4ZGM` 的精确边界（严禁张冠李戴）**：
   - **事实**：RCSB PDB 登录号 `4ZGM`（分辨率 1.80 Å，X 射线晶体衍射）由 Lau 等人在 2015 年同期解析，其**实际晶体结构为 Semaglutide 多肽骨架（含 Aib8 与 Arg34 改造）结合在 GLP-1R 胞外域（ECD）上的复合物**，且**晶体中 Lys26 位点并未酰化接枝脂肪酸侧链**。
   - **教学严谨表述**：`4ZGM` 在论文中用于证明骨架改造（如 Aib8）不破坏受体结合构象；而“Lys26-$\gamma\text{Glu–2}\times\text{OEG–C18}$ 结合白蛋白延长半衰期至 ~165 小时”是同篇论文中的体外白蛋白亲和力测定、构效关系（SAR）与人体药代动力学结论；至于全长 GPCR 与酰化 Semaglutide 结合的完整冷冻电镜构象，需参见后续解析的结构（如 PDB `7KI0`）。在脚本和课堂中**不可把 `4ZGM` 误述为“Semaglutide 结合人血清白蛋白的晶体结构”**。

2. **关于原生 GLP-1 与长效化分子的精确数量对比**：
   - 人内源性活性 GLP-1 主要以 `GLP-1(7-36)amide`（30 AA）和 `GLP-1(7-37)`（31 AA）形式存在，血浆半衰期极短，仅约 **1–2 分钟**。
   - **Semaglutide**：**31 个氨基酸**（基于 GLP-1(7-37) 骨架，Aib8 + Arg34 + Lys26-C18 二酸侧链），半衰期延长至约 **165 小时**（约 1 周）。
   - **Tirzepatide**：**39 个氨基酸**（GIP/GLP-1 双受体激动剂，含非天然 Aib 修饰及 C20 脂肪酸二酸侧链），仍在 U.S. FDA 40 氨基酸法定界线之内，经 **NDA** 路径获批。
   - **人胰岛素（Human Insulin）**：**51 个氨基酸**（A 链 21 AA + B 链 30 AA，由二硫键交联），超过 40 AA 阈值；2020 年 3 月 23 日起按 BPCI Act 第 7002(e)(4) 条与 `85 FR 10057` 规则，历史获批的胰岛素 NDA 自动“被视为生物制品许可”（*Deemed to be a License*），统一转入 **BLA**（*Purple Book*）监管。

3. **关于消费级肽的科学证据与反夸大标准**：
   - **口服胶原蛋白肽（2025 年权威荟萃分析）**：**Myung & Park (2025)** 发表在 *The American Journal of Medicine*（138 卷 9 期 1264–1277 页）的系统综述与荟萃分析纳入了 **23 项随机对照试验（RCT，共 1,474 名受试者）**。结果揭示极关键的证据鸿沟：若不加区分地合并全部 23 项试验，表面看在皮肤保湿、弹性与皱纹上有统计学意义改善；但**按资助来源分层后，未接受药企/保健品公司资助的独立研究未显示任何显著效果**；按研究质量分层后，**高质量研究同样未发现显著获益**（获益集中出现在低质量或企业资助试验中）。此外，虽然业界（如胶原蛋白行业联盟）对该论文中个别研究的“独立 vs 企业资助”分类提出方法学争议，但课程中必须以严谨科研素养呈现这一核心事实：**口服胶原蛋白在胃肠道被水解为游离氨基酸及少量二/三肽作为蛋白质营养底物，尚缺乏高质量独立临床证据支持其能以“抗衰老靶向药物”方式逆转皮肤老化**。
   - **外用护肤肽的机理与物理局限**：
     - **Argireline（乙酰基六肽-8，Acetyl Hexapeptide-8，6 AA）**：序列 `Ac-Glu-Glu-Met-Gln-Arg-Arg-NH2`，作为 **SNAP-25** N-端模拟肽，在体外模型中竞争性干扰 SNARE 复合体组装以减少神经递质释放；但受完整皮肤角质层透皮吸收屏障限制，外用涂抹仅能极其温和、浅表地缓解动态表情纹的外观，**绝不能等同于肉毒杆菌毒素在神经末梢胞内酶切 SNAP-25 的临床肌松效果**。
     - **Matrixyl（棕榈酰五肽-4，Palmitoyl Pentapeptide-4，5 AA）**：核心序列为 I 型前胶原衍生碎片 **KTTKS**（`Lys-Thr-Thr-Lys-Ser`），接枝棕榈酸提高亲脂透皮率，在体外培养和部分安慰剂对照试验中可作为信号肽（matrikine）温和刺激成纤维细胞合成胶原与纤连蛋白，改善光老化细纹质感，但起效渐进、微弱且高度依赖制剂载体。

4. **关于泰国 FDA（สำนักงานคณะกรรมการอาหารและยา, อย. / Thai FDA）的三维监管边界**：
   在泰国及东南亚开展双语/三语科普与健康创新教学时，学生与传播者必须严格区分泰国三大母法管辖界线：
   - **《药物法》（Drug Act B.E. 2510 / 1967）**：**Semaglutide 及所有注射型多肽均属受控现代处方药/药品**。未经泰国 FDA 注册许可及执业药师/医师处方，禁止向公众直接广告、网售、走私或分装注射肽；泰国 FDA 与消费者保护警察局（CPPD）对此持续开展执法打击。
   - **《食品法》（Food Act B.E. 2522 / 1979）与公共卫生部第 447 号公告（B.E. 2566）**：**胶原蛋白肽、二肽/三肽及氨基酸**可作为合规食品/膳食补充剂原料（列入 Positive List），仅可依据许可清单做常规营养与正常结构维护描述，**严禁宣称治疗、预防疾病或“细胞再生/医学级抗衰”**。
   - **《化妆品法》（Cosmetics Act B.E. 2558 / 2015）与东盟化妆品指令（ACD）**：**Argireline、Matrixyl 等外用护肤肽**需完成 10 位化妆品备案号（เลขจดแจ้ง），宣传功效严格限定在清洁、美化、表皮保湿及“淡化细纹外观（appearance）”，**严禁声称穿透改变深层生理结构或具备药理疗效**。

---

## 三、1 分钟 3D 精华科普短片逐秒分镜脚本（00–60s）

本短片专为 **16:9 横屏课程片头或 9:16 竖屏科学传播**设计，全片以 React Three Fiber 实时渲染管线驱动，严格控制在 60 秒以内，提供 **English / 中文 / ภาษาไทย** 精准同步旁白（按正常科普语速约 130–145 英文词 / 220 中文字符节奏校准）及每一幕对应的 `[3D_OBJECT]` 镜头调度指令。

### 分镜总览表（00s – 60s）

---

#### 第一幕：生命的乐高与刚性肽键（00–12s）
- **科学核心**：氨基酸脱水缩合、刚性共面肽键（$-\text{CO–NH}-$）、多肽成链。
- **镜头调度（Camera & R3F Action）**：
  - `00–04s`：微距暗场特写。两个 CPK 配色氨基酸分子（左蓝右红）在深蓝液态空间中旋转靠近；摄像机 `Orbit` 缓慢推近至 `z: 5.5`。
  - `04–08s`：羧基 $-\text{OH}$ 与氨基 $-\text{H}$ 碰撞闪烁，合并生成一颗半透明荧光蓝水分子（$\text{H}_2\text{O}$）飘离；中间亮起金色刚性矩形平面（共面肽键 6 原子框）。
  - `08–12s`：镜头迅速拉远（`z: 12`），连续 31 颗彩色氨基酸珠子如多米诺骨牌般“咔哒”脱水缩合，串成一条发光多肽链。
- **关联 `[3D_OBJECT]` 指令**：`{"sceneId":"s01_condensation","preset":"peptide_bond","pbrMode":"cpk","cameraTarget":[0,0,0]}`
- **三语同步旁白**：
  - **English**: *"Inside your body, amino acids snap together like precision Lego bricks. Each link sheds one water molecule to forge a rigid, flat peptide bond—building a living peptide chain in milliseconds."*
  - **中文**: *"在人体内，氨基酸像精密的乐高积木般咬合。每连接一次，就脱去一分子水，铸就一个刚性平面的肽键——短短几毫秒，一条生命多肽链就此诞生。"*
  - **ภาษาไทย**: *"ภายในร่างกายของเรา กรดอะมิโนเชื่อมต่อกันราวกับตัวต่อเลโก้สุดแม่นยำ ทุกจุดเชื่อมต่อจะคายน้ำออกหนึ่งโมเลกุล เกิดเป็นพันธะเพปไทด์ที่แบนและแข็งแรง สร้างสายพอลิเปปไทด์แห่งชีวิตขึ้นในเสี้ยววินาที"*

---

#### 第二幕：$\alpha$-螺旋折叠与 40 AA 法定界线（12–25s）
- **科学核心**：Pauling, Corey & Branson (1951) $\alpha$-螺旋参数（3.6 残基/圈、5.4 Å 螺距、$i \to i+4$ 氢键）；U.S. FDA `85 FR 10057` 的 40 氨基酸法定界线。
- **镜头调度（Camera & R3F Action）**：
  - `12–18s`：线性肽链瞬间盘旋升起为一条银蓝发光的 $\alpha$-螺旋飘带；左侧弹出标尺显示 `3.6 AA / turn` 与 `5.4 Å`，第 $i$ 圈与第 $i+4$ 圈之间依次点亮青色虚线氢键（13 元环）。
  - `18–25s`：画面横切出现一根发光的 **“40 AA 监管红线激光尺”**（左侧 **NDA 药物区 $\le 40$** 列出 Semaglutide 31 AA、Tirzepatide 39 AA；右侧 **BLA 生物制品区 $> 40$** 列出人胰岛素 51 AA 蛋白双链）。
- **关联 `[3D_OBJECT]` 指令**：`{"sceneId":"s02_helix_fda","preset":"fda_40aa_ruler","aminoAcidCount":31,"pbrMode":"ribbon"}`
- **三语同步旁白**：
  - **English**: *"Next, hydrogen bonds lock every 3.6 residues into a 5.4-angstrom alpha-helix. Under the U.S. FDA bright-line rule: 40 amino acids or fewer—like 31-residue semaglutide—is a peptide drug; over 40—like 51-residue insulin—crosses into a protein biologic."*
  - **中文**: *"随后，氢键每 3.6 个氨基酸拉紧一圈，折叠出 5.4 埃螺距的 $\alpha$-螺旋。美国 FDA 在此划下一道法定红线：40 个氨基酸及以下的多肽（如 31 肽司美格鲁肽）按药品审评；超过 40 个（如 51 肽胰岛素），则正式跨入蛋白质生物制品阵营。"*
  - **ภาษาไทย**: *"จากนั้น พันธะไฮโดรเจนจะยึดทุกๆ 3.6 กรดอะมิโนให้ขดตัวเป็นเกลียวแอลฟาที่มีระยะพิตช์ 5.4 อังสตรอม และภายใต้เกณฑ์ของ อย. สหรัฐฯ: สายที่มีไม่เกิน 40 กรดอะมิโน เช่น เซมากลูไทด์ 31 หน่วย จัดเป็นยาเพปไทด์ แต่ถ้าเกิน 40 เช่น อินซูลิน 51 หน่วย จะจัดเป็นโปรตีนชีววัตถุ"*

---

#### 第三幕：DPP-4 酶剪刀攻防与白蛋白长效巡航（25–40s）
- **科学核心**：Lau et al. (2015) *J. Med. Chem.* Semaglutide 分子工程：Aib8 抗 DPP-4 酶解 + Lys26-$\gamma\text{Glu–2}\times\text{OEG–C18}$ 锚定白蛋白，半衰期从约 1–2 分钟延展至约 165 小时。
- **镜头调度（Camera & R3F Action）**：
  - `25–31s`：红色蛋白酶 **DPP-4 剪刀** 扑向原生 GLP-1 第 8 位将其“咔嚓”剪碎，右上角倒计时停在 `t₁/₂ ≈ 2 min`。
  - `31–40s`：镜头切换至 Semaglutide 改造版——8 号位亮起 **Aib8 青色结晶护盾**，DPP-4 剪刀撞击弹开；同时 26 号位 **Lys26** 伸出金色 C18 脂肪酸钩索，牢牢钩住巨大的琥珀色半透明 **人血清白蛋白（HSA）航空母舰**，平稳巡航躲过肾脏滤网，计时器跳转为 `t₁/₂ ≈ 165 h (1 Week)`。
- **关联 `[3D_OBJECT]` 指令**：`{"sceneId":"s03_sema_shield","preset":"semaglutide_albumin","highlightResidues":[8,26,34],"showDpp4Scissors":true,"albuminBinding":true}`
- **三语同步旁白**：
  - **English**: *"Native GLP-1 survives barely two minutes before DPP-4 enzyme scissors shred it. By swapping position 8 to Aib8 as armor, and grafting a C18 fatty acid tail onto Lys26 to hitchhike on blood albumin, semaglutide stretches its half-life to 165 hours—one full week."*
  - **中文**: *"天然 GLP-1 在血液里只能活约 2 分钟，就会被 DPP-4 酶剪刀切碎。科学家把第 8 位换上 Aib8 装甲弹开剪刀，并在 26 位接枝一条 C18 脂肪酸钩索搭上血清白蛋白“航母”，半衰期一举拉长到约 165 小时——整整一周。"*
  - **ภาษาไทย**: *"ฮอร์โมน GLP-1 ตามธรรมชาติอยู่รอดได้เพียงราว 2 นาทีก่อนถูกเอนไซม์ DPP-4 ตัดทำลาย นักวิทย์จึงติดเกราะ Aib8 ที่ตำแหน่ง 8 เพื่อต้านเอนไซม์ และต่อสายกรดไขมัน C18 ที่ Lys26 เพื่อเกาะโปรตีนอัลบูมินในเลือด ยืดค่าครึ่งชีวิตยาวนานถึงประมาณ 165 ชั่วโมง หรือหนึ่งสัปดาห์เต็ม"*

---

#### 第四幕：细胞膜 GPCR 开锁与人体四大靶器官响应（40–60s）
- **科学核心**：Zhang et al. (2017) *Nature* PDB `5VAI` GPCR TM6 外摆激活 $G_s$ 蛋白与 cAMP 爆发；人体器官响应；消费合规提醒。
- **镜头调度（Camera & R3F Action）**：
  - `40–48s`：摄像机俯冲穿越波动的磷脂双分子层细胞膜（`InstancedMesh`），聚焦 7 次跨膜 GPCR（`5VAI`）。多肽钥匙旋转嵌入，**TM6 螺旋发生锐利弯折并向外摆动**，胞内绿色 **$G_s$ 蛋白** $\alpha5$ 螺旋咔哒对接，胞内瞬间迸发出金色 **cAMP 信号烟花波**。
  - `48–56s`：镜头极速拉升为全息人体透视轮廓，金色脉冲依次点亮四大效应节点：**胰腺 $\beta$ 细胞**（葡萄糖依赖性分泌胰岛素）、**下丘脑**（放大饱腹信号）、**胃部**（适度延缓胃排空）与 **血管代谢网络**。
  - `56–60s`：画面定格在“3D 分子 + 医学合规徽章”，角落闪出精炼科普免责字幕。
- **关联 `[3D_OBJECT]` 指令**：`{"sceneId":"s04_gpcr_5vai","preset":"gpcr_membrane_5vai","tm6Activation":1.0,"pbrMode":"subsurface"}`
- **三语同步旁白**：
  - **English**: *"Docking into the cell membrane's GPCR lock flips helix TM6 outward, snapping in the Gs protein to ignite a cAMP cascade—signaling pancreatic insulin release, slowing gastric emptying, and quieting brain hunger. Real mechanism, not magic; medical guidance always comes first."*
  - **中文**: *"抵达细胞膜后，它插入 GPCR 分子门锁，推动 TM6 螺旋外摆并吸合 Gs 蛋白，引爆胞内 cAMP 信号波——精准唤醒胰腺分泌胰岛素、放缓胃排空并向大脑传递饱腹感。看懂分子机制，用科学辨别真伪，医疗用药请务必遵从专业医师。"*
  - **ภาษาไทย**: *"เมื่อจับกับตัวรับ GPCR บนเยื่อหุ้มเซลล์ เกลียว TM6 จะเปิดออกเพื่อเชื่อมต่อโปรตีน Gs จุดประกายสัญญาณ cAMP กระตุ้นตับอ่อนหลั่งอินซูลิน ชะลอการบีบตัวของกระเพาะ และส่งสัญญาณอิ่มสู่สมอง เข้าใจกลไกจริงด้วยวิทยาศาสตร์ และควรปรึกษาแพทย์ก่อนใช้ยาเสมอ"*

---

## 四、3 分钟在线互动课程教案（5 大章节 0:00–3:00）及 `[3D_OBJECT]` 课堂交互实验指导

本互动课程面向 **高中生（G10–G12）/ IB Bio & Chem / 跨学科生物科技通识课**，采用“**3 分钟高精度微课节奏 + 课后自由 AI 探索实验台**”双阶段结构。教师可直接使用 `demo4-r3f-peptide-lab` 中的 `<Canvas>` 切换章节状态，并在课末开放 Gemini 对话框供学生提问验证。

### 4.1 五大章节教学教案（0:00 – 3:00）

| 章节与时间 | 章节名称 | 核心教学目标（Learning Objectives） | R3F 3D 交互操作指引（Hands-on Action） | 即时课堂检核（Micro-Check） |
| :--- | :--- | :--- | :--- | :--- |
| **Ch.1**<br>`0:00–0:30` | **分子乐高与 40 AA 法定边界**<br>*Peptide Bond & FDA 40-AA Rule* | 1. 理解脱水缩合与肽键刚性共面特性<br>2. 掌握 `85 FR 10057` 界定的 $\le 40\text{ AA}$（NDA）与 $> 40\text{ AA}$（BLA）核心分水岭 | 拖动底部**“氨基酸长度滑块”**（`5 → 6 → 31 → 39 → 51`），观察分子在 **3D FDA 红线激光面**两侧跃迁并切换标签颜色 | 提问：39 AA 的 Tirzepatide 与 51 AA 的人胰岛素，哪一个走 BLA 生物制品通路？为什么？ |
| **Ch.2**<br>`0:30–1:05` | **从螺旋到树脂工厂**<br>*$\alpha$-Helix & Merrifield SPPS* | 1. 记忆 Pauling (1951) 3.6 残基/圈、5.4 Å 螺距、$i \to i+4$ 氢键<br>2. 理解 Merrifield (1963) 固相树脂合成法对现代多肽 CDMO 规模量产的意义 | 点击 **“氢键透视开关”** 测量 $i$ 到 $i+4$ 虚线；点击 **“SPPS 循环按钮”**（去保护 → 偶联 → 洗涤）观察聚合物树脂微球逐颗“生长”四肽 | 提问：为什么传统液相每接一步都要重新纯化，而固相树脂只需要“冲洗过滤”？ |
| **Ch.3**<br>`1:05–1:45` | **分子特种兵：从 2 分钟到 165 小时**<br>*DPP-4 Shield & Albumin Hitchhiking* | 1. 解释原生 GLP-1 迅速失活的酶解与肾清除双瓶颈<br>2. 拆解 Semaglutide 的 **Aib8**、**Arg34** 与 **Lys26-C18 脂肪酸**三重改装逻辑 | 开启 **“DPP-4 酶攻击模式”** 观察野生型链断裂；勾选 **Aib8 护盾** 与 **白蛋白载体**，对比右侧半衰期仪表盘（`2 min` vs `165 h`） | 提问：为什么必须在 34 位用 Arg 替换原本的 Lys？（提示：防止 C18 侧链错误接枝到 34 位） |
| **Ch.4**<br>`1:45–2:25` | **跨膜门锁与 cAMP 级联**<br>*PDB 5VAI GPCR & 4 Target Organs* | 1. 读懂细胞膜磷脂双分子层与 7 次跨膜 GPCR 拓扑<br>2. 观察 **TM6 外摆**招募 **$G_s$** 并产生 **cAMP**，关联胰腺、下丘脑、胃部与代谢调控 | 旋转进入**胞质内侧视角**，拖动 `tm6Activation` 滑块从 `0.0 → 1.0`，观察 TM6 弯折打开空腔；点击靶器官卡片高亮对应生理回路 | 提问：为什么 B 类 GPCR 激活必需 TM6 在胞内侧向外移动？（为 $G_s$ 的 $\alpha5$ 螺旋腾出对接空间） |
| **Ch.5**<br>`2:25–3:00` | **消费祛魅与三重合规排雷**<br>*Collagen 2025 Meta-Analysis & Thai FDA* | 1. 读懂 Myung & Park (2025) 23 项 RCT 荟萃分析“资助分层归零”的科学含义<br>2. 辨析外用护肤肽透皮局限及美/泰 FDA 法律底线 | 进入 **“合规排雷卡片”** 实验：切换口服胶原蛋白、Argireline、Matrixyl 与处方注射肽，剔除违规医疗宣称话术 | 实操：判断泰语网店“จำหน่ายเซมากลูไทด์ลดน้ำหนักออนไลน์（网售减重 Semaglutide）”触犯泰国哪部法律？（Drug Act B.E. 2510） |

---

### 4.2 `[3D_OBJECT]` 课堂交互实验指导（AI 探究实验室）

在完成 3 分钟主线教学后，教师指导学生打开交互对话框，利用 Gemini + `extractObjects()` 管线开展受控假设检验实验。

#### 实验一：酶切攻防与位点突变实验（探究修饰位点的不可替代性）
- **实验步骤**：
  1. 先输入提示词观察无保护原生 GLP-1 被 DPP-4 切断的状态。
  2. 再发送对比指令，要求模型单独关闭 `Aib8` 护盾或关闭 `albuminBinding` 开关，预测半衰期如何坍缩。
- **学生 Prompt 示例（三语对照）**：
  - **中文**：`对比演示：如果把 Semaglutide 的第 8 位 Aib8 改回普通的丙氨酸 Ala8，但保留 Lys26 的 C18 脂肪酸链，DPP-4 酶剪刀会发生什么反应？请给出 3D 演示。`
  - **English**: `Compare what happens if we revert Aib8 back to regular Ala8 while keeping the Lys26 C18 chain on semaglutide. Show the DPP-4 scissors action in 3D.`
  - **ภาษาไทย**: `เปรียบเทียบให้ดูหน่อยว่า ถ้าเปลี่ยน Aib8 กลับเป็น Ala8 แต่ยังเก็บสายไขมัน C18 ที่ Lys26 ไว้ เอนไซม์ DPP-4 จะทำอย่างไร? ขอโมเดล 3 มิติประกอบ`
- **预期 Gemini 安全响应示范（含可解析荷载）**：
  ```text
  即使保留了 Lys26 的 C18 脂肪酸链去结合白蛋白，一旦失去 Aib8 的空间位阻护盾，第 8 位与第 9 位之间的肽键依然会暴露给 DPP-4 蛋白酶的活性口袋，导致 N-端两个氨基酸被快速切掉，受体激活能力大幅丧失。
  [3D_OBJECT]
  {
    "sceneId": "exp01_aib8_loss",
    "preset": "semaglutide_albumin",
    "highlightResidues": [8, 26],
    "showDpp4Scissors": true,
    "albuminBinding": true,
    "pbrMode": "subsurface",
    "annotations": [
      { "label": "Exposed Ala8 (Cleaved by DPP-4!)", "position": [-1.8, 1.3, 0.3], "color": "#ef4444" },
      { "label": "Lys26-C18 Intact (Albumin Bound)", "position": [2.0, -0.5, 0.6], "color": "#f59e0b" }
    ]
  }
  [/3D_OBJECT]
  ```

#### 实验二：40 AA 监管标尺与消费肽透皮屏障对比实验
- **学生 Prompt 示例**：
  - **中文**：`把 5 个氨基酸的 Matrixyl (KTTKS)、6 个氨基酸的 Argireline 和 51 个氨基酸的人胰岛素放到同一把 FDA 40 氨基酸标尺上对比，并说明为什么外用抗皱肽不能等同于注射肉毒素？`
- **苏格拉底反诘检验（教师追问清单）**：
  1. “Matrixyl 只有 5 个氨基酸，为什么它不按药品 NDA 路径审批，却能作为化妆品卖？决定监管路径的除了氨基酸个数，还有什么关键因素？”（引导回答：**预期用途 Intended Use、给药途径与功效宣称**——美化保湿 vs 治疗疾病/改变生理结构）。
  2. “Myung & Park (2025) 分析了 23 项口服胶原蛋白试验，如果总合并曲线显示‘有效’，为什么科研人员还会对它打问号？”（引导回答：**发表偏倚与企业资助偏倚**——剔除低质量及商业资助试验后，独立高质量 RCT 组统计学显著性消失）。

#### 实验三：PDB `5VAI` GPCR 跨膜开关构象观察
- **学生 Prompt 示例**：
  - **中文**：`切到 PDB 5VAI 的胞内仰视视角，把 TM6 外摆程度设为 1.0，高亮说明 Gs 蛋白是怎么通过这个缺口点燃 cAMP 信号的。`
- **预期 `[3D_OBJECT]` 荷载**：
  ```json
  {
    "sceneId": "exp03_5vai_intracellular",
    "preset": "gpcr_membrane_5vai",
    "tm6Activation": 1.0,
    "pbrMode": "subsurface",
    "cameraTarget": [0, -1.4, 0],
    "annotations": [
      { "label": "TM6 Outward Kink (PDB 5VAI)", "position": [1.4, -0.9, 0.5], "color": "#22d3ee" },
      { "label": "Gs alpha5 Helix Docking", "position": [0.2, -1.8, 0.2], "color": "#10b981" }
    ]
  }
  ```

### 4.3 课堂学习评估量表（Rubric，满分 100 分）

| 评估维度 | 权重 | 优秀标准（A 级表现） | 待改进红线 |
| :--- | :---: | :--- | :--- |
| **分子结构与机制准确度** | 30% | 准确说出 3.6 AA/圈、5.4 Å、Aib8/Lys26-C18 分工及 `5VAI` TM6 外摆触发 cAMP 流程 | 混淆氢键与共价肽键，或把 `4ZGM` 误说成白蛋白晶体 |
| **3D 交互探究与 Prompt 工程** | 25% | 能用精确控制变量 Prompt 驱动 `[3D_OBJECT]` 对比实验并解读空间构象差异 | 仅让 AI 输出泛泛文字，未结合 3D 模型观察坐标与位点 |
| **科学循证与抗幻觉素养** | 25% | 能清晰区分 2025 胶原蛋白荟萃分析的总合并结果与独立研究分层结果，不盲从单一商业结论 | 轻信“吃胶原直接长脸上”或“涂抹完全替代注射”等无依据宣传 |
| **法规与伦理合规意识** | 20% | 准确应用 U.S. FDA `85 FR 10057` 40 AA 规则与泰国 FDA 三大法案界定药品、补充剂与化妆品边界 | 混用医疗治疗宣称与化妆品/食品宣传，或忽视处方药网售禁令 |

---

## 五、医疗、营养与跨国科普合规免责声明（中 / EN / ไทย）

> **简体中文声明**：本课程及配套 3D 交互可视化模型（包括但不限于 GLP-1 受体激动剂、胰岛素、胶原蛋白肽及护肤多肽演示）仅用于生物学机制、药物化学与计算机图形学科普教学，**不构成任何临床诊断、处方建议或医疗治疗指导**。处方多肽药物（如 Semaglutide、Tirzepatide、胰岛素等）具有明确的适应证、禁忌证与不良反应风险，必须在执业医师评估与处方指导下合规获取和使用。任何膳食补充剂与化妆品均不得替代药物治疗疾病。
>
> **English Disclaimer**: This curriculum and its companion 3D interactive visualizations (including models of GLP-1 receptor agonists, insulin, collagen peptides, and cosmetic peptides) are created strictly for science education in molecular biology, medicinal chemistry, and WebGL computer graphics. They **do not constitute medical advice, clinical diagnosis, or treatment recommendations**. Prescription peptide and protein therapeutics carry specific indications, contraindications, and safety risks and must only be obtained and used under the supervision of a licensed physician. Dietary supplements and topical cosmetics are not intended to diagnose, treat, cure, or prevent any disease.
>
> **คำชี้แจงด้านกฎระเบียบและสุขภาพ (ภาษาไทย)**: หลักสูตรนี้และแบบจำลองภาพ 3 มิติเชิงโต้ตอบทั้งหมด (รวมถึงกลไกของยาในกลุ่ม GLP-1 อินซูลิน คอลลาเจนเปปไทด์ และเปปไทด์ในเครื่องสำอาง) จัดทำขึ้นเพื่อ**การศึกษาวิทยาศาสตร์และเทคโนโลยีคอมพิวเตอร์กราฟิกเท่านั้น มิใช่คำแนะนำทางการแพทย์ การวินิจฉัย หรือการรักษาโรค** ยาควบคุมและยาตามใบสั่งแพทย์ต้องได้รับการประเมินและสั่งจ่ายโดยแพทย์ผู้เชี่ยวชาญเท่านั้น และห้ามจำหน่ายหรือโฆษณาผลิตภัณฑ์เสริมอาหารหรือเครื่องสำอางในลักษณะอวดอ้างสรรพคุณรักษาโรคโดยเด็ดขาดตามกฎหมายของสำนักงานคณะกรรมการอาหารและยา (อย.)
