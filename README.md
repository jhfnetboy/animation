# Post-University Era · K–12 AI Innovation Curriculum & Animation Showcase Studio

> **Language / 语言 / ภาษา**: **[English (Default)](#english-default)** · **[简体中文](#简体中文)** · **[ภาษาไทย](#ภาษาไทย)**

---

<a id="english-default"></a>
## 🌐 English (Default)

An interactive **K–12 AI Innovation & Visual Mechanism Lab** designed for international and bilingual schools across **Chiang Mai, Thailand, Southeast Asia, and China**.  
Rather than starting with dry coding syntax drills, students explore **hand-painted WebGL shaders, procedural timeline animations, and steampunk physics sandboxes** to intuitively grasp how AI thinks, master **72-Hour Rapid Domain Mastery**, defend **human taste and field-researched problem framing**, and ship **Minimum Viable Magic (MVM)** prototypes.

### 1. Target K–12 Grade Bands & International Alignment

| Grade Band | Age / Thai Equivalent | Core Focus | International Curriculum Fit |
| :--- | :--- | :--- | :--- |
| **Upper Primary** | **Grades 4–6** *(Ages 9–12 / ป.4–ป.6)* | Wonder, AI demystification, 24h Curiosity Quests & campus micro-empathy | **IB PYP** *(Transdisciplinary Themes & Grade 5/6 Exhibition)*, **AI4K12 (3–5)** |
| **Middle School** | **Grades 7–9** *(Ages 12–15 / ม.1–ม.3)* | Machine-mind intuition, 72h guided domain scouting & single-file HTML/Agent blueprints | **IB MYP** *(Design Cycle Criteria A–D & Personal Project)*, **AI4K12 (6–8)** |
| **High School** | **Grades 10–12** *(Ages 15–18 / ม.4–ม.6)* | Multilingual Token Tax, 72h hardcore breakthroughs, PDPA-safe fieldwork & external Demo Day | **IB DP** *(TOK, CAS, EE)*, **Cambridge IGCSE/A-Level**, **AP CSP / Capstone**, **AI4K12 (9–12)** |

### 2. Trilingual Switching Mechanism (`?lang=en|zh|th`)

The showcase hub and standalone studio entry points follow a unified URL query convention (**English is the default**):

| Query Parameter | Language | Preview Entry URLs (Local or Hosted) |
| :--- | :--- | :--- |
| **`?lang=en`** *(Default)* | **English** | `http://localhost:8000/?lang=en` · `demos/demo1-kujira-art/index.html?lang=en` |
| **`?lang=zh`** | **简体中文 (Simplified Chinese)** | `http://localhost:8000/?lang=zh` · `demos/demo2-motion-slides/index.html?lang=zh` |
| **`?lang=th`** | **ภาษาไทย (Thai)** | `http://localhost:8000/?lang=th` · `demos/demo3-mechanical-sandbox/index.html?lang=th` |

> **Runtime Implementation Status**: All four web entries ([`index.html`](./index.html), [`demos/demo1-kujira-art/index.html`](./demos/demo1-kujira-art/index.html), [`demos/demo2-motion-slides/index.html`](./demos/demo2-motion-slides/index.html), and [`demos/demo3-mechanical-sandbox/index.html`](./demos/demo3-mechanical-sandbox/index.html)) fully implement `?lang=en|zh|th` detection (default `en`), top-bar `EN / 中文 / ไทย` toggle buttons, `localStorage` (`ai_course_lang`) persistence, and `postMessage` (`SET_LANG`) iframe synchronization.

### 3. Online Hosting & Local Preview (Using `pnpm`)

Because [`index.html`](./index.html), [`demos/demo1-kujira-art/`](./demos/demo1-kujira-art/index.html), [`demos/demo2-motion-slides/index.html`](./demos/demo2-motion-slides/index.html), and [`demos/demo3-mechanical-sandbox/`](./demos/demo3-mechanical-sandbox/index.html) are zero-backend static web apps, they can be deployed directly to any static host (e.g., **Cloudflare Pages** or **GitHub Pages**) for instant online Demo access, or previewed locally from the repository root:

```bash
# Option A: Preview full Showcase Hub & all 3 Demos via pnpm
pnpm dlx serve . -p 8000

# Option B: Preview via Python built-in HTTP server
python3 -m http.server 8000
# Open http://localhost:8000/?lang=en (or ?lang=zh / ?lang=th)
```

- **Run `demo2-motion-slides` (Motion Canvas + Vite TypeScript project — strictly `pnpm`)**:
  ```bash
  cd demos/demo2-motion-slides
  pnpm install
  pnpm dev        # Launch Motion Canvas Studio & Vite dev server
  pnpm build      # Typecheck (tsc --noEmit) & production bundle
  pnpm typecheck  # Run TypeScript check only
  ```
- **Rebuild `demo1-kujira-art` single-file bundle** *(optional; prebuilt `index.html` is already included)*:
  ```bash
  cd demos/demo1-kujira-art
  node build.mjs
  ```
- **Run `demo3-mechanical-sandbox`**: Pure HTML5 Canvas 2D + native JS (`index.html`, `data.js`, `mode_a_galton.js`, `mode_b_alchemy.js`) — runs directly under the root static server with no build step.

### 4. Repository Directory & Documentation Index

```text
.
├── index.html                                         # Master Showcase Hub (Portal for 3 Studios + 6 Lessons)
├── README.md                                          # Trilingual Project Overview (EN / ZH / TH)
├── docs/                                              # All curriculum, research & lesson documents
│   ├── trilingual_international_school_syllabus.md    # Official EN / ZH / TH G4–G12 International School Syllabus
│   ├── cmu_coach_and_teacher_curriculum_system.md     # CMU Coach Train-the-Trainer & 4-Stage Teacher Curriculum (ZH/EN/TH)
│   ├── peptide_3d_science_course_guide.md             # Peptide & Body 3D R3F Course Guide + Peer-Reviewed Citations
│   ├── post_university_ai_curriculum.md               # Top-level Curriculum Architecture & 4-Layer Pyramid (ZH)
│   ├── six_demo_courses_handbook.md                   # Complete 6-Lesson Plans, Scripts & Storyboards (ZH)
│   └── animation_tech_stack_research.md               # Open-Source Animation Tech Stack Research Report (ZH)
├── demos/                                             # Runnable Visualization & Sandbox Studios
│   ├── demo1-kujira-art/                              # Studio 1A (Main): Chiang Mai Lanna Culture (Krathong, Yi Peng, Longtail Boat, White Elephant & Doi Suthep)
│   │   ├── index.html                                 # Self-contained built studio bundle
│   │   ├── build.mjs                                  # Single-file bundler (Three.js + GLSL + src -> index.html)
│   │   ├── template.html                              # Player shell & teaching HUD template
│   │   ├── glsl/                                      # Watercolor/Kuwahara/elephant/sea/sky/beam GLSL shaders
│   │   ├── src/                                       # 00-util.js .. 80-main.js (5-act timeline & Lanna Ranat Ek audio)
│   │   └── vendor/                                    # Local Three.js module & THREE-LICENSE
│   ├── demo1-whale-ocean/                             # Studio 1B (Archive): Original Ocean Whale version of Demo 1
│   ├── demo2-motion-slides/                           # Studio 2: Motion Canvas Timeline + Slidev-Style Lesson Deck
│   │   ├── index.html                                 # Standalone browser interactive micro-course player
│   │   ├── package.json & pnpm-lock.yaml              # pnpm workspace dependencies & scripts
│   │   ├── vite.config.ts & tsconfig.json             # Vite + Motion Canvas build config
│   │   └── src/                                       # project.ts + scenes/lesson1_embedding, lesson2_attention, lesson3_agent
│   ├── demo3-mechanical-sandbox/                      # Studio 3: Canvas 2D Steampunk Pinball + 72h Alchemy Furnace
│   │   ├── index.html                                 # Dual-mode interactive sandbox UI
│   │   ├── styles.css                                 # Steampunk blueprint styling
│   │   ├── data.js                                    # Mode A (4 scenarios × 3 rounds) & Mode B (4×4 venture matrix)
│   │   ├── mode_a_galton.js                           # Physics pinball engine, Temperature/Top-K & Entropy/Hallucination
│   │   └── mode_b_alchemy.js                          # 72h domain breakthrough & cross-perspective alchemy workbench
│   └── demo4-r3f-peptide-lab/                         # Studio 4: React Three Fiber + Gemini [3D_OBJECT] Peptide 3D Course
│       ├── index.html                                 # Redirect entry to built R3F production bundle
│       ├── app.html                                   # Vite SPA HTML entry
│       ├── package.json                               # R3F + Three.js + @google/genai + Vite dependencies
│       ├── dist/                                      # Prebuilt static bundle for direct GitHub Pages serving
│       └── src/                                       # PBR molecular/organ 3D scenes, protocol parser & course data
└── reports/                                           # Reserved output directory for verification reports
```

---

<a id="简体中文"></a>
## 🇨🇳 简体中文

面向**清迈、泰国、东南亚及中国国际学校与双语学校**的新一代 **K–12 AI 创新与视觉机制实验工坊**。  
课程摒弃枯燥的纯 Coding 语法起手式，通过 **Three.js + GLSL 手绘艺术流、Motion Canvas 程序化机制动画与物理机械沙盒**，让青少年在直觉层看穿 AI 的核心工作流，掌握 **72 小时跨领域破壁** 的元学习方法，并在答案廉价的时代建立 **审美品味、真实田野共情与创新原型交付（MVM）** 的人类生态位。

- **适用学段**：
  - **小学高段 Upper Primary（G4–G6 / 9–12 岁）**：好奇心祛魅、不插电积木切词、24 小时微探索与校内微共情，无缝对接 **IB PYP 毕业展（Exhibition）**。
  - **初中段 Middle School（G7–G9 / 12–15 岁）**：AI 机制心智建构、72 小时引导式破壁与单文件原型/Agent 蓝图，对接 **IB MYP 设计循环与 Personal Project**。
  - **高中段 High School（G10–G12 / 15–18 岁）**：英/中/泰多语“Token 税”实测、72 小时硬核领域破壁、PDPA 合规田野调查与真实用户冷启动 **Demo Day**，对接 **IB DP（TOK / CAS / EE）、IGCSE / A-Level、AP**。
- **三语切换机制（`?lang=en|zh|th`）**：
  - 默认英文：`?lang=en` ｜ 简体中文：`?lang=zh` ｜ 泰文：`?lang=th`（例如访问 `http://localhost:8000/?lang=zh`）。
  - *实装状态*：全部四大入口（`index.html`、`demo1-kujira-art`、`demo2-motion-slides` 与 `demo3-mechanical-sandbox`）均已完整支持 `?lang=en|zh|th`（默认英文）、顶栏 `EN / 中文 / ไทย` 切换钮、`localStorage`（`ai_course_lang`）与 `postMessage` (`SET_LANG`) 跨页实时同步。
- **线上部署与本地预览（统一使用 `pnpm`）**：
  - **静态线上托管 / 本地总控预览**：可直接部署至 Cloudflare Pages / GitHub Pages，或在根目录运行 `pnpm dlx serve . -p 8000`（或 `python3 -m http.server 8000`），打开 `http://localhost:8000/?lang=zh`。
  - **单独运行 `demo2-motion-slides`**：进入 `demos/demo2-motion-slides` 后执行 `pnpm install` 与 `pnpm dev`（构建校验执行 `pnpm build` 或 `pnpm typecheck`）。
  - **重新打包 `demo1-kujira-art`**：进入 `demos/demo1-kujira-art` 后执行 `node build.mjs`。
- **核心文档索引（均位于 `docs/`）**：
  - [`docs/trilingual_international_school_syllabus.md`](./docs/trilingual_international_school_syllabus.md) — **英/中/泰三语国际学校官方课程大纲（G4–G12）**
  - [`docs/cmu_coach_and_teacher_curriculum_system.md`](./docs/cmu_coach_and_teacher_curriculum_system.md) — **CMU 实习生 Coach 培训与四阶 Teacher 教案总手册（Touching→Driving→Making→Enhancing）**
  - [`docs/peptide_3d_science_course_guide.md`](./docs/peptide_3d_science_course_guide.md) — **基于 React Three Fiber + Gemini 的肽与人体机制 3D 科普指南与权威文献溯源**
  - [`docs/post_university_ai_curriculum.md`](./docs/post_university_ai_curriculum.md) — 后大学时代青少年 AI 创新课程顶层设计方案
  - [`docs/six_demo_courses_handbook.md`](./docs/six_demo_courses_handbook.md) — 六节标杆示范课完整教案与先文字后动画分镜手册
  - [`docs/animation_tech_stack_research.md`](./docs/animation_tech_stack_research.md) — AI 科普动画开源技术栈与三条实现路线调研报告

---

<a id="ภาษาไทย"></a>
## 🇹🇭 ภาษาไทย (Thai)

**หลักสูตรนวัตกรรม AI และห้องปฏิบัติการแอนิเมชันยุคหลังมหาวิทยาลัย (K–12)** ออกแบบเฉพาะสำหรับ **โรงเรียนนานาชาติและโรงเรียนสองภาษาในเชียงใหม่ ประเทศไทย ภูมิภาคอาเซียน และประเทศจีน**  
หลักสูตรนี้ไม่เริ่มต้นด้วยการท่องจำโค้ดที่แห้งแล้ง (No Pure-Coding Entry) แต่ใช้ **ศิลปะแอนิเมชันสีน้ำ WebGL, ไทม์ไลน์ Motion Canvas และแซนด์บ็อกซ์กลไกฟิสิกส์สตีมพังก์** เพื่อให้นักเรียนเข้าใจวิธีคิดของ AI อย่างลึกซึ้ง ฝึกทักษะ **การเจาะลึกศาสตร์ใหม่ใน 72 ชั่วโมง** รักษาจุดยืนของมนุษย์ผ่านรสนิยมและการลงพื้นที่จริง (Field Empathy) และสร้างต้นแบบ **Minimum Viable Magic (MVM)**

- **ระดับชั้นที่รองรับและการเชื่อมโยงหลักสูตรสากล**:
  - **ประถมศึกษาตอนปลาย (Upper Primary: ป.4–ป.6 / G4–G6)**: ลดความเข้าใจผิดเกี่ยวกับ AI, เกมบล็อกคำ, ภารกิจ 24 ชม. เชื่อมโยง **IB PYP Exhibition**
  - **มัธยมศึกษาตอนต้น (Middle School: ม.1–ม.3 / G7–G9)**: เข้าใจกลไก Token/Attention/Pinball, แผนภาพ 72 ชม. และต้นแบบ HTML/Agent เชื่อมโยง **IB MYP Design Cycle & Personal Project**
  - **มัธยมศึกษาตอนปลาย (High School: ม.4–ม.6 / G10–G12)**: ทดลองความเหลื่อมล้ำ **Thai/Chinese/English Token Tax**, ลงพื้นที่ชุมชนเชียงใหม่/อาเซียนตามมาตรฐาน **PDPA** และนำเสนอ **Demo Day** เชื่อมโยง **IB DP (TOK, CAS, EE), IGCSE / A-Level, AP**
- **กลไกสลับ 3 ภาษา (`?lang=en|zh|th`)**:
  - ค่าเริ่มต้นภาษาอังกฤษ: `?lang=en` ｜ ภาษาจีนตัวย่อ: `?lang=zh` ｜ ภาษาไทย: `?lang=th` (เช่น `http://localhost:8000/?lang=th`)
  - *สถานะปัจจุบัน*: ทุกหน้าหลักทั้ง 4 ส่วน (`index.html`, `demo1-kujira-art`, `demo2-motion-slides` และ `demo3-mechanical-sandbox`) รองรับ `?lang=en|zh|th` (ค่าเริ่มต้นภาษาอังกฤษ), ปุ่มสลับ `EN / 中文 / ไทย`, `localStorage` (`ai_course_lang`) และการซิงค์แบบเรียลไทม์ผ่าน `postMessage` (`SET_LANG`) ครบสมบูรณ์แล้ว
- **วิธีพรีวิวออนไลน์และรันในเครื่อง (ใช้ `pnpm`)**:
  - สามารถอัปโหลดโฟลเดอร์ทั้งหมดขึ้นโฮสต์สแตติก (เช่น Cloudflare Pages / GitHub Pages) หรือรันในเครื่องจากโฟลเดอร์หลักด้วย `pnpm dlx serve . -p 8000` (หรือ `python3 -m http.server 8000`) แล้วเปิด `http://localhost:8000/?lang=th`
  - สำหรับโปรเจกต์ **Motion Canvas** (`demos/demo2-motion-slides`) ให้ใช้ `pnpm install` ตามด้วย `pnpm dev` (หรือ `pnpm build` / `pnpm typecheck`)
  - สำหรับ `demos/demo1-kujira-art` สามารถรวมไฟล์เดียวใหม่ด้วย `node build.mjs`
- **ดัชนีเอกสารหลักทั้งหมด (`docs/`)**:
  - [`docs/trilingual_international_school_syllabus.md`](./docs/trilingual_international_school_syllabus.md) — **หลักสูตรอย่างเป็นทางการ 3 ภาษา (EN / ZH / TH) สำหรับโรงเรียนนานาชาติ G4–G12**
  - [`docs/cmu_coach_and_teacher_curriculum_system.md`](./docs/cmu_coach_and_teacher_curriculum_system.md) — **คู่มือฝึกอบรม CMU Coach และแผนการสอน 4 ระดับสำหรับครู (Touching→Driving→Making→Enhancing)**
  - [`docs/peptide_3d_science_course_guide.md`](./docs/peptide_3d_science_course_guide.md) — **คู่มือบทเรียน 3 มิติเพปไทด์และร่างกายมนุษย์ (R3F + งานวิจัยอ้างอิง)**
  - [`docs/post_university_ai_curriculum.md`](./docs/post_university_ai_curriculum.md) — เอกสารออกแบบโครงสร้างหลักสูตรระดับองค์รวม (ภาษาจีน)
  - [`docs/six_demo_courses_handbook.md`](./docs/six_demo_courses_handbook.md) — คู่มือแผนการสอนและสตอรีบอร์ด 6 บทเรียนสาธิต (ภาษาจีน)
  - [`docs/animation_tech_stack_research.md`](./docs/animation_tech_stack_research.md) — รายงานวิจัยเทคโนโลยีแอนิเมชันโอเพนซอร์ส (ภาษาจีน)
