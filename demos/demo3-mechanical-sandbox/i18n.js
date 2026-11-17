/**
 * Demo 3: Interactive Physics & Mechanical Sandbox - Trilingual i18n Framework
 * Supports English (default), Simplified Chinese (zh), and Thai (th).
 * Zero external dependencies; exposes window.DEMO3_I18N and window.DEMO3_LANG.
 */
(function (root) {
  "use strict";

  const VALID_LANGS = ["en", "zh", "th"];
  const STORAGE_KEY = "ai_course_lang";
  const DEFAULT_LANG = "en";

  const DEMO3_I18N = {
    en: {
      meta: {
        pageTitle: "Demo 3: Interactive Physics Sandbox | Steampunk Blueprint Lab",
        langName: "English"
      },
      topbar: {
        brandTitle: "Interactive Physics Sandbox · Steampunk Blueprint Lab",
        brandSub: "Turn LLM probability sampling & cross-disciplinary AI mastery into machines you can see and touch",
        modeSwitcherAria: "Switch Experiment Mode",
        modeATag: "Mode A",
        modeAName: "Probability Galton Pinball",
        modeBTag: "Mode B",
        modeBName: "Cognitive Alchemy Forge",
        tipsBtn: "💡 Class Tips",
        resetBtn: "↺ Reset Lab",
        toastResetA: "Mode A: Restored initial rig state and cleared all marbles",
        toastResetB: "Mode B: Cognitive Alchemy Forge reset to Station 1"
      },
      tips: {
        title: "🎓 1-Minute Classroom Teaching Guide (Instructor Script)",
        closeBtn: "✕ Close",
        modeATitle: "Mode A (Probability Galton Pinball): How to Demo AI \"Personality\" & \"Hallucinations\"?",
        modeAItems: [
          "<b>1. Demo Determinism (Frost Mode):</b> Select \"Scientific Fact Reasoning\", slide Temperature to <code>0.15</code> and Top-K to <code>2</code>, then fire 50 marbles—students watch every marble strike \"100°C\" like a laser beam.",
          "<b>2. Demo Nonsense (Furnace Mode):</b> Switch to \"Historical Fact Q&amp;A\", crank Temperature to <code>2.0</code> and open Top-K to <code>8</code>—superheated marbles scatter into \"Constantinople / Mark Antony / Cybertron\" and turn the hallucination lamp red!",
          "<b>3. Demo Autoregressive Snowball:</b> Intentionally click an off-track token in Round 1 and watch Rounds 2 &amp; 3 keep elaborating seriously from that flawed premise."
        ],
        modeBTitle: "Mode B (Cognitive Alchemy Forge): How to Guide Students into Rapid Cross-Disciplinary \"Solo-Founder\" Innovation?",
        modeBItems: [
          "<b>1. Demystify:</b> Have students type any intimidating frontier domain above (e.g., \"Brain-Computer Interface\" or \"Quantum Error Correction\") and watch Station 1's brass gears crush jargon into 3 plain-English principles.",
          "<b>2. Find Your Irreplaceable Edge:</b> Switch personal lenses (Visual Designer / High School Teacher / Financial Auditor / Game Designer) to show that <b>in the AI era, memorizing buzzwords has zero value—your lived perspective spots pain cracks nobody else sees</b>.",
          "<b>3. 72-Hour Action:</b> Advance to Station 4 to forge a \"Solo-Founder Project Card\", then copy or print it as a concrete post-class launch assignment!"
        ]
      },
      modeA: {
        canvasPanelTitle: "🎯 Probability Marble Physics Engine",
        canvasHint: "Click pegs above to drop 1 ｜ Click bottom bin to chain token",
        statsLabel: "Dropped {0} | Entropy {1} bits",
        panel1Title: "📜 1. Teaching Scenarios & 3-Round Autoregressive Chain",
        panel2Title: "🌡 2. Thermodynamic Temperature & Top-K Mechanical Gate",
        tempLabel: "Temperature (Thermal Airflow Turbulence)",
        tempScaleLow: "0.05 Frost Rigid",
        tempScaleMid: "0.85 Balanced",
        tempScaleHigh: "2.50 Furnace Wild",
        topkLabel: "Top-K Mechanical Gate (Open Slots)",
        topkScaleLow: "K=1 Greedy Dictator",
        topkScaleMid: "K=4 Steady",
        topkScaleHigh: "K=8 All Slots Open",
        btnDrop1: "⚪ Drop 1",
        btnDrop10: "🔵 Burst 10",
        btnDrop50: "⚡ Burst 50",
        btnSampleNext: "🎯 Sample 1 & Chain",
        btnReplay: "↺ Run Another Round",
        btnClearBins: "🧹 Clear Bins",
        panel3Title: "📊 3. Live Softmax Distribution (Click Right to Chain)",
        panel3Legend: "Token / Logit / Theory% / Action",
        tempStateFrost: "❄ Frost Deterministic",
        tempStateFurnace: "🔥 Furnace Divergent",
        tempStateBalanced: "⚙ Standard Balanced",
        tempBadge: "T={0}  {1}",
        topkBadge: "Top-{0}",
        gateLockedCanvas: "TOP-{0} GATE LOCKED",
        binLocked: "LOCKED",
        tableLocked: "Locked",
        binHallucinationTag: "⚠ Hallucination",
        binClickChainTag: "Click to chain",
        legendTheory: "Theoretical Curve (Softmax)",
        legendHistogram: "Empirical Histogram",
        legendComparison: "Theoretical Curve vs. Empirical Histogram",
        canvasDropHint: "Click pegboard to drop 1 | Click bin to chain | Replay when done",
        currentScenarioLabel: "Scenario:",
        chainProgressLabel: "Chain:",
        roundDone3: "3 / 3 Rounds Complete",
        roundCurrent: "Round {0} / 3",
        tokenTooltip: "Chosen Prob {0}% | T={1}",
        pendingToken: "Next Token?",
        finishedHint: "3-round autoregressive chain complete! Inspect the stitched sentence above, or click \"Sample 1 & Chain\" to replay.",
        riskHallucination: "Hallucination",
        riskDrift: "Drift",
        btnChain: "Chain",
        toastCleared: "Cleared bin counts and flying marbles",
        toastAlreadyFinished: "3-round chain finished! Click \"Run Another Round\" or switch scenario.",
        toastRoundAdvanced: "{0} picked \"{1}\" — auto-chained to Round {2}",
        toastDoneSnowball: "3-round chain complete! Warning: AI Hallucination Snowball triggered.",
        toastDoneSuccess: "3-round autoregressive chain completed cleanly!",
        toastGateBlocked: "\"{0}\" is blocked by the Top-{1} gate. Increase Top-K to unlock.",
        sourceClickBin: "Bin Click",
        sourceMarbleSample: "Marble Sample",
        sourceTablePick: "Table Pick",
        lampDefaultTitle: "✅ Factual Steady State: High-Confidence Lock",
        lampDefaultDesc: "Observe how temperature, gate width, and token choices jointly trigger AI hallucinations.",
        lampSafeTitle: "✅ Factual Steady State: High-Confidence Lock",
        lampSafeDesc: "Low temperature and narrow Top-K suppress long-tail noise—outputs stay rigorous, though less surprising.",
        lampWarnTitle: "⚡ Creative Divergence Alert: Rising Entropy",
        lampWarnDesc: "Distribution entropy is {0} bits—great for poetry brainstorming, risky for code, medicine, or history facts.",
        lampHighRiskTitle: "🔥 High Hallucination Risk: High Temp + Wide Gate",
        lampHighRiskDesc: "Long-tail hallucination mass has reached {0}%. Further sampling is very likely to drift into nonsense.",
        lampTriggeredTitle: "🚨 AI Hallucination Alert: Factual Drift Detected!",
        lampTriggeredDesc: "A prior token landed in the low-probability tail; autoregressive decoding will now earnestly fabricate onward."
      },
      modeB: {
        canvasPanelTitle: "⚗ Cognitive Alchemy Assembly Line",
        canvasPanelBadge: "4 Live Stations",
        canvasPanelHint: "Click any station rig on canvas to switch",
        inputPanelTitle: "🧪 Hopper: Frontier Domain × Personal Lens",
        stepALabel: "Step A: Pick an unfamiliar frontier domain (or type any new field):",
        customPlaceholder: "Enter custom domain, e.g., Nuclear Fusion, Deep-Sea Mining...",
        btnCrushCustom: "Feed to Crusher",
        stepBLabel: "Step B: Choose your personal advantage lens:",
        stationPanelTitle: "🏭 Alchemy Station Deck",
        tab1Num: "Station 01",
        tab1Name: "First Principles",
        tab2Num: "Station 02",
        tab2Name: "72h Inquiry",
        tab3Num: "Station 03",
        tab3Name: "Pain Spotlight",
        tab4Num: "Station 04",
        tab4Name: "Founder Forge",
        canvasStation1: "Station 1 · First-Principles Crusher",
        canvasStation2: "Station 2 · 72h Socratic Chain",
        canvasStation3: "Station 3 · Human Pain Spotlight",
        canvasStation4: "Station 4 · Solo-Founder Forge",
        canvasEssencePill: "💎 3 Core Principles",
        canvasSocraticCap: "72h Socratic Chain Charged",
        canvasPainTarget: "🎯 {0} Target",
        canvasPayloadEssence: "Core Ore",
        canvasVatLine1: "AI + Human Lens",
        canvasVatLine2: "High-Pressure Synthesis",
        s1Title: "⚙ Station 1: First-Principles Crusher",
        s1Intro: "Crush intimidating jargon into plain talk, then distill 3 underlying physical & business principles:",
        btnRecrush: "⚡ Crush Again",
        btnNextS2: "Send to Station 2: 72h Inquiry →",
        s2Title: "⚡ Station 2: 72h Socratic Chain",
        s2Resonated: "⚡ Resonated",
        s2ClickLight: "Click to ignite",
        s2PromptHeading: "Dedicated AI Socratic Deep-Dive Prompt:",
        btnCopyPrompt: "📋 Copy Prompt",
        btnPrevS1: "← Back to Station 1",
        btnNextS3: "Send to Station 3: Pain Spotlight →",
        s3Title: "🔦 Station 3: Human Pain Spotlight",
        s3BadgeLens: "Lens: {0}",
        s3Intro: "Scientists obsess over hardware limits; the spotlight reveals everyday anxiety, unit-economics friction, and usability cracks:",
        s3MatchTag: "★ Bullseye for Your Lens | ",
        btnPrevS2: "← Back to Station 2",
        btnNextS4: "Feed Reactor: Forge Project Card →",
        cardBadgeForged: "Forged",
        cardFieldPitch: "One-Line Value Proposition (Pitch)",
        cardFieldLeverage: "AI & Open-Source Leverage (Zero Heavy Assets)",
        cardFieldMvp: "72-Hour Minimum Viable Action Plan (MVP)",
        cardFieldMonetization: "First-Dollar Monetization Path",
        btnPrevS3: "← Back to Station 3",
        btnReforge: "🔨 Reforge",
        btnCopyCard: "📋 Copy Project Card",
        btnPrintCard: "🖨 Print Card",
        copyCardDomain: "Target Domain",
        copyCardPerspective: "Personal Lens",
        copyCardPitch: "Value Proposition",
        copyCardLeverage: "Tech Leverage",
        copyCardMvp: "72h MVP",
        copyCardMonetization: "Monetization",
        toastDomainFed: "Fed \"{0}\" into the First-Principles Crusher!",
        toastCustomEmpty: "Enter any frontier domain first (e.g., Quantum Error Correction, Solid-State Batteries)",
        toastCustomCreated: "Dynamic alchemy blueprint generated: crushing \"{0}\"",
        toastPerspSwitched: "Switched personal lens: [{0}]",
        toastPromptCopied: "Copied dedicated AI Socratic inquiry prompt!",
        toastReforged: "Hydraulic hammer strike! Project card quenched and forged.",
        toastCardCopied: "Copied Solo-Founder Project Card text!",
        toastCopyFailed: "Copy failed—please select and copy the text manually"
      }
    },

    zh: {
      meta: {
        pageTitle: "示范工程 3：可交互物理机械沙盒 | 蒸汽朋克蓝图实验台",
        langName: "简体中文"
      },
      topbar: {
        brandTitle: "可交互物理机械沙盒 · 蒸汽朋克实验台",
        brandSub: "把大语言模型概率采样与 AI 跨界方法论，变成看得见、摸得着的机械装置",
        modeSwitcherAria: "实验模式切换",
        modeATag: "模式 A",
        modeAName: "概率弹珠高尔顿板",
        modeBTag: "模式 B",
        modeBName: "认知炼金炉工作台",
        tipsBtn: "💡 课堂小贴士",
        resetBtn: "↺ 重置当前实验",
        toastResetA: "模式 A：已恢复初始工况并清空弹珠",
        toastResetB: "模式 B：已重置认知炼金炉至工位 1"
      },
      tips: {
        title: "🎓 课堂 1 分钟讲透指南（教师演示剧本）",
        closeBtn: "✕ 关闭",
        modeATitle: "模式 A（概率弹珠高尔顿板）：如何演示 AI 的“性格”与“幻觉”？",
        modeAItems: [
          "<b>1. 演示确定性（冰霜态）：</b>选「科学常识推理」，把 Temperature 拉到 <code>0.15</code>、Top-K 设为 <code>2</code>，连发 50 颗弹珠——让学生亲眼看到所有弹珠像激光一样全部砸进「100℃」。",
          "<b>2. 演示胡说八道（炉火态）：</b>切到「历史事实问答」，把 Temperature 拉高到 <code>2.0</code>、Top-K 放开到 <code>8</code>，弹珠受热乱撞落入「突厥/灵渠/赛博坦」——幻觉警告灯变红！",
          "<b>3. 演示自回归雪球：</b>故意点击第 1 轮的一个偏差词接龙，展示第 2、3 轮 AI 如何“顺着错话继续一本正经地接下去”。"
        ],
        modeBTitle: "模式 B（认知炼金炉）：如何带学生用 AI 快速跨界“降维创业”？",
        modeBItems: [
          "<b>1. 祛魅：</b>让学生在上方随便输入一个最吓人的硬核领域（如「脑机接口」或「量子纠错」），看工位 1 如何用齿轮把术语压碎成 3 句大白话本质。",
          "<b>2. 找自己的不可替代性：</b>切换不同的“个人视角”（设计师 / 老师 / 金融 / 游戏策划），让学生看到——<b>AI 时代值钱的不是记住名词，而是用你独特的人生视角发现别人看不见的痛点裂缝</b>。",
          "<b>3. 72 小时行动：</b>进入工位 4 锻造出一张「一人独角兽立项卡」，直接复制或打印作为本节课的课后实践作业！"
        ]
      },
      modeA: {
        canvasPanelTitle: "🎯 概率弹珠物理引擎",
        canvasHint: "点击上方钉阵投 1 颗 ｜ 点击底部槽位直接接龙",
        statsLabel: "已投落 {0} 颗 | 信息熵 {1} bits",
        panel1Title: "📜 1. 教学剧本与 3 轮自回归接龙",
        panel2Title: "🌡 2. 热力学温度与 Top-K 机械闸门",
        tempLabel: "Temperature（热气流扰动温度）",
        tempScaleLow: "0.05 冰霜严谨",
        tempScaleMid: "0.85 平衡",
        tempScaleHigh: "2.50 炉火疯狂",
        topkLabel: "Top-K 机械闸门（开放槽位数）",
        topkScaleLow: "K=1 贪心独裁",
        topkScaleMid: "K=4 稳妥",
        topkScaleHigh: "K=8 全槽敞开",
        btnDrop1: "⚪ 投掷 1 颗",
        btnDrop10: "🔵 连发 10 颗",
        btnDrop50: "⚡ 连发 50 颗",
        btnSampleNext: "🎯 采样1颗并接龙",
        btnReplay: "↺ 再来一轮实验",
        btnClearBins: "🧹 清空统计",
        panel3Title: "📊 3. Softmax 实时概率明细（点右侧接龙）",
        panel3Legend: "词 / Logit / 理论% / 操作",
        tempStateFrost: "❄ 冰霜确定态",
        tempStateFurnace: "🔥 炉火高热发散态",
        tempStateBalanced: "⚙ 标准概率平衡态",
        tempBadge: "T={0}  {1}",
        topkBadge: "Top-{0}",
        gateLockedCanvas: "TOP-{0} 机械门锁死",
        binLocked: "LOCKED",
        tableLocked: "锁死",
        binHallucinationTag: "⚠ 幻觉区",
        binClickChainTag: "点槽接龙",
        legendTheory: "理论概率曲线 (Softmax)",
        legendHistogram: "实测直方图",
        legendComparison: "理论曲线 vs 实测直方图",
        canvasDropHint: "点击钉阵投珠 | 点击槽位接龙 | 完成后可重播",
        currentScenarioLabel: "当前剧本：",
        chainProgressLabel: "接龙进度：",
        roundDone3: "3 / 3 轮已完成",
        roundCurrent: "第 {0} / 3 轮",
        tokenTooltip: "当时选中概率 {0}% | T={1}",
        pendingToken: "待采样词元",
        finishedHint: "3 轮自回归生成已结束！可对比上方拼接历史，或点击「采样选定并接龙」重来一局。",
        riskHallucination: "幻觉",
        riskDrift: "偏离",
        btnChain: "接龙",
        toastCleared: "已清空槽位统计与飞行弹珠",
        toastAlreadyFinished: "已完成 3 轮接龙，请点击「重新实验」或切换剧本",
        toastRoundAdvanced: "{0}选中「{1}」，已自动接龙至第 {2} 轮",
        toastDoneSnowball: "3 轮接龙完成！注意：已触发 AI 幻觉滚雪球现象",
        toastDoneSuccess: "3 轮自回归接龙圆满完成！",
        toastGateBlocked: "「{0}」已被 Top-{1} 机械闸门封锁，调大 Top-K 可解锁",
        sourceClickBin: "手动点击槽位",
        sourceMarbleSample: "物理采样投掷",
        sourceTablePick: "词表强制接龙",
        lampDefaultTitle: "✅ 事实稳态：高置信度锁定",
        lampDefaultDesc: "观察温度、闸门与接龙选择如何共同诱发 AI 幻觉。",
        lampSafeTitle: "✅ 事实稳态：高置信度锁定",
        lampSafeDesc: "低温与窄 Top-K 压制了长尾噪声，模型输出严谨稳定，但缺乏意外创意。",
        lampWarnTitle: "⚡ 创意发散预警：熵值上升中",
        lampWarnDesc: "分布信息熵 {0} bits，适合写诗头脑风暴，不建议用于代码/医学/历史严谨问答。",
        lampHighRiskTitle: "🔥 幻觉高危工况：高温 + 宽闸门敞开",
        lampHighRiskDesc: "当前幻觉尾区概率累计已达 {0}%，继续采样极易跑偏胡诌。",
        lampTriggeredTitle: "🚨 AI 幻觉警报：已发生事实偏移！",
        lampTriggeredDesc: "前序接龙落入了低概率长尾词，自回归机制会顺着错误前提继续一本正经编造后续内容。"
      },
      modeB: {
        canvasPanelTitle: "⚗ 认知炼金机械流水线",
        canvasPanelBadge: "4 工位实时流转",
        canvasPanelHint: "点击画布中任意工位机械可直接切换",
        inputPanelTitle: "🧪 投料口：硬核陌生领域 × 个人视角",
        stepALabel: "步骤 A：选择一个硬核陌生领域（或输入任意新领域）：",
        customPlaceholder: "输入自定义领域，如：可控核聚变、深海采矿...",
        btnCrushCustom: "投入粉碎机",
        stepBLabel: "步骤 B：选择你的个人优势视角透镜：",
        stationPanelTitle: "🏭 炼金工位流转台",
        tab1Num: "工位 01",
        tab1Name: "本质粉碎",
        tab2Num: "工位 02",
        tab2Name: "72h追问",
        tab3Num: "工位 03",
        tab3Name: "痛点探照",
        tab4Num: "工位 04",
        tab4Name: "立项锻造",
        canvasStation1: "工位 1 · 第一性原理粉碎机",
        canvasStation2: "工位 2 · 72h 极速追问共振塔",
        canvasStation3: "工位 3 · 人类痛点探照灯",
        canvasStation4: "工位 4 · 一人独角兽锻造反应釜",
        canvasEssencePill: "💎 提炼 3 条底层本质",
        canvasSocraticCap: "72h 极速追问链充能",
        canvasPainTarget: "🎯 {0}痛点靶心",
        canvasPayloadEssence: "本质原石",
        canvasVatLine1: "AI + 人类视角",
        canvasVatLine2: "高压化学反应中",
        s1Title: "⚙ 工位 1：第一性原理粉碎机",
        s1Intro: "先把吓人的行业黑话压碎成大白话，再提炼 3 条底层物理/商业本质：",
        btnRecrush: "⚡ 再粉碎一次",
        btnNextS2: "送往工位 2：极速追问链 →",
        s2Title: "⚡ 工位 2：72h 极速追问链",
        s2Resonated: "⚡ 已共振",
        s2ClickLight: "点击点亮",
        s2PromptHeading: "专属 AI 苏格拉底深潜 Prompt：",
        btnCopyPrompt: "📋 一键复制 Prompt",
        btnPrevS1: "← 返回工位 1",
        btnNextS3: "送往工位 3：人类痛点探照灯 →",
        s3Title: "🔦 工位 3：人类痛点探照灯",
        s3BadgeLens: "视角：{0}",
        s3Intro: "科学家总盯着硬件上限，探照灯帮你照出普通人真正卡住的焦虑、算账与体验裂缝：",
        s3MatchTag: "★ 命中你的视角靶心｜",
        btnPrevS2: "← 返回工位 2",
        btnNextS4: "送入反应釜：锻造立项卡 →",
        cardBadgeForged: "已锻造",
        cardFieldPitch: "一句话价值主张 (Pitch)",
        cardFieldLeverage: "AI 与开源技术杠杆 (零自建重资产)",
        cardFieldMvp: "72 小时最小验证行动清单 (MVP)",
        cardFieldMonetization: "首单变现路径",
        btnPrevS3: "← 返回工位 3",
        btnReforge: "🔨 重新锻打",
        btnCopyCard: "📋 复制立项卡",
        btnPrintCard: "🖨 打印立项卡",
        copyCardDomain: "切入领域",
        copyCardPerspective: "个人视角",
        copyCardPitch: "价值主张",
        copyCardLeverage: "技术杠杆",
        copyCardMvp: "72h MVP",
        copyCardMonetization: "变现路径",
        toastDomainFed: "已将「{0}」投入第一性原理粉碎机！",
        toastCustomEmpty: "请先输入任意硬核陌生领域名称（如：量子纠错、固态电池）",
        toastCustomCreated: "动态炼金蓝图已生成：「{0}」正在粉碎拆解",
        toastPerspSwitched: "已切换个人透镜：【{0}】",
        toastPromptCopied: "已复制专属 AI 极速追问 Prompt！",
        toastReforged: "液压锻锤重击！项目立项卡已完成高温淬火",
        toastCardCopied: "已复制一人独角兽立项卡文本！",
        toastCopyFailed: "复制失败，请手动选中文本复制"
      }
    },

    th: {
      meta: {
        pageTitle: "ตัวอย่างที่ 3: แซนด์บ็อกซ์ฟิสิกส์เชิงกลโต้ตอบ | แท่นทดลองพิมพ์เขียวสตีมพังก์",
        langName: "ภาษาไทย"
      },
      topbar: {
        brandTitle: "แซนด์บ็อกซ์ฟิสิกส์เชิงกลโต้ตอบ · แท่นทดลองสตีมพังก์",
        brandSub: "เปลี่ยนการสุ่มความน่าจะเป็นของ LLM และวิธีคิดข้ามศาสตร์ด้วย AI ให้เป็นกลไกที่จับต้องและมองเห็นได้จริง",
        modeSwitcherAria: "สลับโหมดการทดลอง",
        modeATag: "โหมด A",
        modeAName: "กระดานกอลตันลูกแก้วความน่าจะเป็น",
        modeBTag: "โหมด B",
        modeBName: "แท่นหลอมแปรธาตุทางปัญญา",
        tipsBtn: "💡 เคล็ดลับสอนในชั้นเรียน",
        resetBtn: "↺ รีเซ็ตการทดลอง",
        toastResetA: "โหมด A: คืนค่าเริ่มต้นของเครื่องและล้างลูกแก้วทั้งหมดแล้ว",
        toastResetB: "โหมด B: รีเซ็ตเตาหลอมแปรธาตุทางปัญญากลับไปที่สถานีที่ 1 แล้ว"
      },
      tips: {
        title: "🎓 คู่มือสรุปสอนเข้าใจใน 1 นาที (สคริปต์สาธิตสำหรับผู้สอน)",
        closeBtn: "✕ ปิด",
        modeATitle: "โหมด A (กระดานกอลตันลูกแก้ว): สาธิต \"บุคลิก\" และ \"อาการหลอน (Hallucination)\" ของ AI อย่างไร?",
        modeAItems: [
          "<b>1. สาธิตความแน่นอน (โหมดน้ำแข็ง):</b> เลือก \"การให้เหตุผลเชิงวิทยาศาสตร์\" ปรับ Temperature ไปที่ <code>0.15</code> และ Top-K เป็น <code>2</code> แล้วปล่อยลูกแก้ว 50 ลูก—นักเรียนจะเห็นลูกแก้วทุกลูกพุ่งตรงดิ่งเข้าช่อง \"100°C\" ราวกับลำแสงเลเซอร์",
          "<b>2. สาธิตการมั่วคำตอบ (โหมดเตาหลอมเดือด):</b> สลับไปที่ \"ถาม-ตอบข้อเท็จจริงทางประวัติศาสตร์\" เร่ง Temperature เป็น <code>2.0</code> และเปิด Top-K เป็น <code>8</code>—ลูกแก้วจะกระดอนมั่วเข้าสู่ช่อง \"Constantinople / Mark Antony / Cybertron\" และไฟเตือนอาการหลอนจะเปลี่ยนเป็นสีแดง!",
          "<b>3. สาธิตลูกบอลหิมะแบบ Autoregressive:</b> ลองคลิกเลือกคำที่เบี่ยงเบนในรอบที่ 1 แล้วดูว่าในรอบที่ 2 และ 3 AI จะ \"แต่งเรื่องต่ออย่างจริงจังบนสมมติฐานที่ผิดพลาดเดิม\" ได้อย่างไร"
        ],
        modeBTitle: "โหมด B (เตาหลอมแปรธาตุทางปัญญา): พานักเรียนใช้ AI ข้ามศาสตร์และสร้างนวัตกรรมแบบ \"Solo Founder\" อย่างรวดเร็วได้อย่างไร?",
        modeBItems: [
          "<b>1. ทลายกำแพงความกลัวศัพท์ยาก:</b> ให้นักเรียนพิมพ์ศาสตร์ที่ฟังดูน่าเกรงขามไว้ด้านบน (เช่น \"ส่วนต่อประสานสมองกับคอมพิวเตอร์\" หรือ \"การแก้ไขข้อผิดพลาดควอนตัม\") แล้วดูฟันเฟืองสถานีที่ 1 บดศัพท์หรูให้เป็นแก่นความจริง 3 ข้อที่เข้าใจง่าย",
          "<b>2. ค้นหาจุดแข็งที่ AI แทนไม่ได้:</b> ลองสลับ \"มุมมองเฉพาะตัว\" (นักออกแบบ / ครูมัธยม / ผู้ตรวจสอบการเงิน / นักออกแบบเกม) เพื่อให้นักเรียนเห็นว่า <b>ในยุค AI การท่องจำคำศัพท์ไม่มีราคา แต่การมองเห็นรอยร้าวและปัญหาของผู้คนผ่านประสบการณ์ชีวิตของคุณคือขุมทรัพย์</b>",
          "<b>3. ลงมือทำจริงใน 72 ชั่วโมง:</b> เข้าสู่สถานีที่ 4 เพื่อหลอม \"การ์ดโครงการยูนิคอร์นคนเดียว\" แล้วคัดลอกหรือสั่งพิมพ์เป็นการบ้านภาคปฏิบัติหลังจบคาบเรียน!"
        ]
      },
      modeA: {
        canvasPanelTitle: "🎯 เครื่องยนต์ฟิสิกส์ลูกแก้วความน่าจะเป็น",
        canvasHint: "คลิกแผงหมุดด้านบนเพื่อปล่อย 1 ลูก ｜ คลิกช่องด้านล่างเพื่อต่อคำทันที",
        statsLabel: "ปล่อยแล้ว {0} ลูก | เอนโทรปี {1} bits",
        panel1Title: "📜 1. บทเรียนตัวอย่างและการต่อคำ 3 รอบ (Autoregressive)",
        panel2Title: "🌡 2. อุณหภูมิเทอร์โมไดนามิกส์และประตูกั้นกล Top-K",
        tempLabel: "Temperature (อุณหภูมิความปั่นป่วนของกระแสลมร้อน)",
        tempScaleLow: "0.05 เยือกแข็งแม่นยำ",
        tempScaleMid: "0.85 สมดุล",
        tempScaleHigh: "2.50 เตาหลอมคลุ้มคลั่ง",
        topkLabel: "ประตูกั้นกล Top-K (จำนวนช่องที่เปิด)",
        topkScaleLow: "K=1 เลือกคำอันดับ 1",
        topkScaleMid: "K=4 มั่นคง",
        topkScaleHigh: "K=8 เปิดครบทุกช่อง",
        btnDrop1: "⚪ ปล่อย 1 ลูก",
        btnDrop10: "🔵 ยิงรัว 10 ลูก",
        btnDrop50: "⚡ ยิงรัว 50 ลูก",
        btnSampleNext: "🎯 สุ่ม 1 ลูกและต่อคำ",
        btnReplay: "↺ ทดลองใหม่อีกรอบ",
        btnClearBins: "🧹 ล้างสถิติ",
        panel3Title: "📊 3. ตารางความน่าจะเป็น Softmax สด (คลิกขวาเพื่อต่อคำ)",
        panel3Legend: "คำ / Logit / ทฤษฎี% / คำสั่ง",
        tempStateFrost: "❄ สถานะเยือกแข็งแน่นอน",
        tempStateFurnace: "🔥 สถานะเตาเดือดฟุ้งกระจาย",
        tempStateBalanced: "⚙ สถานะสมดุลมาตรฐาน",
        tempBadge: "T={0}  {1}",
        topkBadge: "Top-{0}",
        gateLockedCanvas: "ประตูกั้น TOP-{0} ล็อกอยู่",
        binLocked: "ล็อก",
        tableLocked: "ล็อก",
        binHallucinationTag: "⚠ โซนหลอน",
        binClickChainTag: "คลิกต่อคำ",
        legendTheory: "เส้นโค้งทฤษฎี (Softmax)",
        legendHistogram: "ฮิสโตแกรมจากการตกจริง",
        legendComparison: "เส้นโค้งทฤษฎี เทียบ ฮิสโตแกรมจริง",
        canvasDropHint: "คลิกแผงหมุดปล่อยลูกแก้ว | คลิกช่องเพื่อต่อคำ | กดเล่นซ้ำได้",
        currentScenarioLabel: "บทเรียน:",
        chainProgressLabel: "ความคืบหน้า:",
        roundDone3: "ครบ 3 / 3 รอบแล้ว",
        roundCurrent: "รอบที่ {0} / 3",
        tokenTooltip: "ความน่าจะเป็นที่เลือก {0}% | T={1}",
        pendingToken: "รอสุ่มคำถัดไป",
        finishedHint: "ต่อคำครบ 3 รอบแล้ว! ลองเปรียบเทียบข้อความด้านบน หรือคลิก \"สุ่ม 1 ลูกและต่อคำ\" เพื่อเริ่มทดลองใหม่",
        riskHallucination: "หลอน",
        riskDrift: "คลาดเคลื่อน",
        btnChain: "ต่อคำ",
        toastCleared: "ล้างสถิติช่องและลูกแก้วที่กำลังตกแล้ว",
        toastAlreadyFinished: "ต่อคำครบ 3 รอบแล้ว กรุณากด \"ทดลองใหม่อีกรอบ\" หรือเปลี่ยนบทเรียน",
        toastRoundAdvanced: "{0}เลือก \"{1}\" — ต่อคำเข้าสู่รอบที่ {2} อัตโนมัติ",
        toastDoneSnowball: "ต่อคำครบ 3 รอบแล้ว! คำเตือน: เกิดปรากฏการณ์ลูกบอลหิมะอาการหลอนของ AI",
        toastDoneSuccess: "การต่อคำอัตโนมัติ 3 รอบเสร็จสมบูรณ์อย่างแม่นยำ!",
        toastGateBlocked: "\"{0}\" ถูกประตูกั้นกล Top-{1} บล็อกไว้ เพิ่มค่า Top-K เพื่อปลดล็อก",
        sourceClickBin: "คลิกช่องด้วยตนเอง",
        sourceMarbleSample: "สุ่มด้วยลูกแก้วฟิสิกส์",
        sourceTablePick: "เลือกบังคับจากตาราง",
        lampDefaultTitle: "✅ สถานะข้อเท็จจริงมั่นคง: ล็อกความมั่นใจสูง",
        lampDefaultDesc: "สังเกตว่าอุณหภูมิ ประตูกั้น และการเลือกคำร่วมกันกระตุ้นอาการหลอนของ AI อย่างไร",
        lampSafeTitle: "✅ สถานะข้อเท็จจริงมั่นคง: ล็อกความมั่นใจสูง",
        lampSafeDesc: "อุณหภูมิต่ำและ Top-K แคบช่วยกดสัญญาณรบกวนหางยาว ผลลัพธ์แม่นยำมั่นคงแต่ขาดความคิดสร้างสรรค์ที่แปลกใหม่",
        lampWarnTitle: "⚡ เตือนความหลากหลายเชิงสร้างสรรค์: เอนโทรปีกำลังเพิ่มขึ้น",
        lampWarnDesc: "ค่าเอนโทรปีอยู่ที่ {0} bits—เหมาะกับการระดมสมองแต่งกลอน ไม่แนะนำสำหรับโค้ด การแพทย์ หรือข้อเท็จจริงประวัติศาสตร์",
        lampHighRiskTitle: "🔥 ความเสี่ยงอาการหลอนสูงมาก: อุณหภูมิสูง + เปิดประตูกว้าง",
        lampHighRiskDesc: "ความน่าจะเป็นสะสมของโซนหลอนสูงถึง {0}% แล้ว หากสุ่มต่อมีโอกาสสูงที่จะแต่งเรื่องมั่ว",
        lampTriggeredTitle: "🚨 สัญญาณเตือนอาการหลอน AI: เกิดการเบี่ยงเบนจากข้อเท็จจริงแล้ว!",
        lampTriggeredDesc: "คำก่อนหน้าตกลงในโซนหางยาวความน่าจะเป็นต่ำ ระบบ Autoregressive จะแต่งเรื่องต่ออย่างจริงจังบนสมมติฐานที่ผิดพลาดนี้"
      },
      modeB: {
        canvasPanelTitle: "⚗ สายพานเครื่องจักรแปรธาตุทางปัญญา",
        canvasPanelBadge: "4 สถานีทำงานต่อเนื่อง",
        canvasPanelHint: "คลิกที่เครื่องจักรสถานีใดก็ได้บนแคนวาสเพื่อสลับ",
        inputPanelTitle: "🧪 ช่องป้อนวัตถุดิบ: ศาสตร์เฉพาะทาง × มุมมองส่วนตัว",
        stepALabel: "ขั้นตอน A: เลือกศาสตร์เฉพาะทางที่ท้าทาย (หรือพิมพ์สาขาใหม่ใดก็ได้):",
        customPlaceholder: "พิมพ์ศาสตร์ที่สนใจ เช่น พลังงานฟิวชัน, เหมืองใต้ทะเลลึก...",
        btnCrushCustom: "ป้อนเข้าเครื่องบด",
        stepBLabel: "ขั้นตอน B: เลือกเลนส์มุมมองจุดแข็งเฉพาะตัวของคุณ:",
        stationPanelTitle: "🏭 แท่นควบคุมสถานีแปรธาตุ",
        tab1Num: "สถานี 01",
        tab1Name: "บดสู่แก่นแท้",
        tab2Num: "สถานี 02",
        tab2Name: "เจาะลึก 72 ชม.",
        tab3Num: "สถานี 03",
        tab3Name: "ส่องปัญหาจริง",
        tab4Num: "สถานี 04",
        tab4Name: "หลอมโครงการ",
        canvasStation1: "สถานี 1 · เครื่องบดหลักการพื้นฐาน",
        canvasStation2: "สถานี 2 · หอสะท้อนคำถาม 72 ชม.",
        canvasStation3: "สถานี 3 · สปอตไลต์ปัญหาผู้คน",
        canvasStation4: "สถานี 4 · เตาหลอมยูนิคอร์นคนเดียว",
        canvasEssencePill: "💎 สกัด 3 แก่นความจริง",
        canvasSocraticCap: "ชาร์จห่วงโซ่คำถาม 72 ชม.",
        canvasPainTarget: "🎯 เป้าปัญหา: {0}",
        canvasPayloadEssence: "แร่แก่นแท้",
        canvasVatLine1: "AI + มุมมองมนุษย์",
        canvasVatLine2: "กำลังสังเคราะห์แรงดันสูง",
        s1Title: "⚙ สถานี 1: เครื่องบดหลักการพื้นฐาน",
        s1Intro: "บดศัพท์เทคนิคที่ชวนงงให้เป็นภาษาคนทั่วไป แล้วสกัด 3 แก่นแท้ทางฟิสิกส์และธุรกิจ:",
        btnRecrush: "⚡ บดละเอียดอีกครั้ง",
        btnNextS2: "ส่งต่อไปสถานี 2: ห่วงโซ่คำถาม 72 ชม. →",
        s2Title: "⚡ สถานี 2: ห่วงโซ่คำถาม 72 ชม.",
        s2Resonated: "⚡ สั่นพ้องแล้ว",
        s2ClickLight: "คลิกเพื่อจุดประกาย",
        s2PromptHeading: "Prompt เจาะลึกแบบโสกราตีสเฉพาะคุณสำหรับ AI:",
        btnCopyPrompt: "📋 คัดลอก Prompt",
        btnPrevS1: "← กลับสถานี 1",
        btnNextS3: "ส่งต่อไปสถานี 3: สปอตไลต์ส่องปัญหา →",
        s3Title: "🔦 สถานี 3: สปอตไลต์ส่องปัญหาผู้คน",
        s3BadgeLens: "เลนส์: {0}",
        s3Intro: "นักวิทยาศาสตร์มักหมกมุ่นกับขีดจำกัดฮาร์ดแวร์ แต่สปอตไลต์จะส่องให้เห็นความกังวล ต้นทุน และรอยร้าวด้านการใช้งานของคนธรรมดา:",
        s3MatchTag: "★ ตรงเป้ามุมมองของคุณ | ",
        btnPrevS2: "← กลับสถานี 2",
        btnNextS4: "เข้าเตาหลอม: สร้างการ์ดโครงการ →",
        cardBadgeForged: "หลอมเสร็จสิ้น",
        cardFieldPitch: "ข้อเสนอคุณค่าในประโยคเดียว (Pitch)",
        cardFieldLeverage: "พลังทวีจาก AI และโอเพนซอร์ส (ไม่ต้องลงทุนหนัก)",
        cardFieldMvp: "แผนปฏิบัติการพิสูจน์แนวคิดใน 72 ชั่วโมง (MVP)",
        cardFieldMonetization: "เส้นทางสร้างรายได้แรก",
        btnPrevS3: "← กลับสถานี 3",
        btnReforge: "🔨 ตีหลอมซ้ำ",
        btnCopyCard: "📋 คัดลอกการ์ดโครงการ",
        btnPrintCard: "🖨 พิมพ์การ์ดโครงการ",
        copyCardDomain: "ศาสตร์ที่เจาะเข้าทำ",
        copyCardPerspective: "มุมมองเฉพาะตัว",
        copyCardPitch: "ข้อเสนอคุณค่า",
        copyCardLeverage: "พลังทวีทางเทคโนโลยี",
        copyCardMvp: "แผน MVP 72 ชม.",
        copyCardMonetization: "เส้นทางรายได้",
        toastDomainFed: "ป้อน \"{0}\" เข้าสู่เครื่องบดหลักการพื้นฐานแล้ว!",
        toastCustomEmpty: "กรุณาพิมพ์ชื่อศาสตร์ที่สนใจก่อน (เช่น การแก้ไขข้อผิดพลาดควอนตัม, แบตเตอรี่โซลิดสเตต)",
        toastCustomCreated: "สร้างพิมพ์เขียวแปรธาตุแบบไดนามิกแล้ว: กำลังบดย่อย \"{0}\"",
        toastPerspSwitched: "สลับเลนส์มุมมองส่วนตัวแล้ว: [{0}]",
        toastPromptCopied: "คัดลอก Prompt เจาะลึกสำหรับ AI แล้ว!",
        toastReforged: "ค้อนไฮดรอลิกกระแทก! การ์ดโครงการผ่านการชุบแข็งเรียบร้อย",
        toastCardCopied: "คัดลอกข้อความการ์ดโครงการยูนิคอร์นคนเดียวแล้ว!",
        toastCopyFailed: "คัดลอกไม่สำเร็จ กรุณาเลือกข้อความเพื่อคัดลอกด้วยตนเอง"
      }
    }
  };

  function resolvePath(dict, key) {
    if (!dict || typeof key !== "string" || !key) return undefined;
    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      return dict[key];
    }
    const parts = key.split(".");
    let cur = dict;
    for (let i = 0; i < parts.length; i++) {
      if (cur == null || typeof cur !== "object") return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function formatString(template, args) {
    if (!args || args.length === 0) return template;
    if (args.length === 1 && args[0] && typeof args[0] === "object" && !Array.isArray(args[0])) {
      const vars = args[0];
      return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name) =>
        Object.prototype.hasOwnProperty.call(vars, name) && vars[name] != null ? String(vars[name]) : match
      );
    }
    return template.replace(/\{(\d+)\}/g, (match, idxStr) => {
      const idx = parseInt(idxStr, 10);
      return idx < args.length && args[idx] != null ? String(args[idx]) : match;
    });
  }

  function isValidLang(lang) {
    return typeof lang === "string" && VALID_LANGS.indexOf(lang) !== -1;
  }

  let currentLang = null;
  const listeners = [];

  function detect() {
    try {
      if (root.location && typeof root.location.search === "string") {
        const params = new URLSearchParams(root.location.search);
        const urlLang = (params.get("lang") || "").trim().toLowerCase();
        if (isValidLang(urlLang)) return urlLang;
      }
    } catch (e) {
      // Ignore URL parsing errors in non-browser contexts
    }

    try {
      if (root.localStorage) {
        const stored = (root.localStorage.getItem(STORAGE_KEY) || "").trim().toLowerCase();
        if (isValidLang(stored)) return stored;
      }
    } catch (e) {
      // Ignore storage access errors in restricted sandboxes
    }

    return DEFAULT_LANG;
  }

  function syncHtmlLang(lang) {
    if (typeof document !== "undefined" && document.documentElement) {
      document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
    }
  }

  function get() {
    if (!isValidLang(currentLang)) {
      currentLang = detect();
    }
    return currentLang;
  }

  function set(lang) {
    const normalized = typeof lang === "string" ? lang.trim().toLowerCase() : "";
    if (!isValidLang(normalized)) return get();

    const prev = get();
    currentLang = normalized;

    try {
      if (root.localStorage) {
        root.localStorage.setItem(STORAGE_KEY, normalized);
      }
    } catch (e) {
      // Ignore storage write restrictions
    }

    syncHtmlLang(normalized);

    if (prev !== normalized) {
      const snapshot = listeners.slice();
      for (let i = 0; i < snapshot.length; i++) {
        try {
          snapshot[i](normalized, prev);
        } catch (err) {
          // Keep notifying remaining subscribers even if one listener throws
        }
      }
    }

    return normalized;
  }

  function t(key) {
    const lang = get();
    const args = Array.prototype.slice.call(arguments, 1);

    let val = resolvePath(DEMO3_I18N[lang], key);
    if (val === undefined && lang !== "en") {
      val = resolvePath(DEMO3_I18N.en, key);
    }
    if (val === undefined && lang !== "zh") {
      val = resolvePath(DEMO3_I18N.zh, key);
    }
    if (val === undefined) return key;

    if (typeof val === "function") {
      return val.apply(null, args);
    }
    if (typeof val === "string") {
      return formatString(val, args);
    }
    return val;
  }

  function onChange(fn) {
    if (typeof fn !== "function") return function () {};
    if (listeners.indexOf(fn) === -1) {
      listeners.push(fn);
    }
    return function unsubscribe() {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }

  // Initialize language on load and listen for parent portal postMessage updates
  currentLang = detect();
  syncHtmlLang(currentLang);

  if (typeof root.addEventListener === "function") {
    root.addEventListener("message", (e) => {
      if (e && e.data && e.data.type === "SET_LANG") {
        set(e.data.lang);
      }
    });
    root.addEventListener("storage", (e) => {
      if (e && e.key === STORAGE_KEY && e.newValue) {
        set(e.newValue);
      }
    });
  }

  const DEMO3_LANG = {
    VALID_LANGS: VALID_LANGS.slice(),
    detect,
    get,
    set,
    t,
    onChange
  };

  root.DEMO3_I18N = DEMO3_I18N;
  root.DEMO3_LANG = DEMO3_LANG;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { DEMO3_I18N, DEMO3_LANG };
  }
})(typeof window !== "undefined" ? window : globalThis);
