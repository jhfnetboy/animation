/**
 * 示范工程 3：模式 B - 认知炼金炉工作台（Canvas 2D 机械流水线 + 4 工位流转引擎）
 * 包含：机械传送带、第一性原理粉碎双齿轮、Socratic 探照灯与共振线圈、
 *       液压立项卡锻造反应釜动画、4 工位深度交互与一键复制/打印
 */
(function (root) {
  "use strict";

  const CANVAS_FONT_SANS =
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans Thai", "Sarabun", "Thonburi", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
  const CANVAS_FONT_MONO =
    '"JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, "Noto Sans Thai", "Sarabun", monospace';

  const ModeBAlchemy = {
    initialized: false,
    canvas: null,
    ctx: null,
    width: 820,
    height: 620,
    dpr: 1,
    rafId: null,
    lastTime: 0,

    // 炼金炉核心状态
    domainId: "synthetic_bio",
    customDomainText: "",
    isCustomDomain: false,
    perspectiveId: "designer",
    activeStation: 1, // 1..4
    litSocraticCount: 3, // 点亮的追问步数 (1..3)

    // 动画状态
    beltOffset: 0,
    crusherSpeed: 1.6,
    crusherBoost: 0,
    forgeImpact: 0, // 0..1 液压锻锤击打进度
    hammerY: 0, // 锤头偏移
    searchlightAngle: 0,
    particles: [], // 蒸汽云、粉碎火花、探照灯微尘
    stationRects: [], // 用于 Canvas 点击识别 4 个工位区域
    onToast: null,

    init(options) {
      if (this.initialized) return;
      this.canvas = document.getElementById("alchemy-canvas");
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext("2d");
      this.onToast = (options && options.onToast) || function () {};

      this.bindUI();
      this.resizeCanvas();

      window.addEventListener("resize", () => this.resizeCanvas());
      this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));

      this.initialized = true;
      this.lastTime = performance.now();
      this.renderStationUI();
      this.startLoop();
    },

    t(key) {
      if (root.DEMO3_LANG && typeof root.DEMO3_LANG.t === "function") {
        return root.DEMO3_LANG.t.apply(root.DEMO3_LANG, arguments);
      }
      return key;
    },

    drawFittedText(ctx, text, x, y, maxW, baseSize, minSize, weight, fontFamily) {
      const str = String(text || "");
      let size = baseSize;
      ctx.font = `${weight ? weight + " " : ""}${size}px ${fontFamily}`;
      let measured = ctx.measureText(str).width;
      if (measured > maxW && maxW > 0) {
        size = Math.max(minSize, Math.floor(baseSize * (maxW / measured) * 10) / 10);
        ctx.font = `${weight ? weight + " " : ""}${size}px ${fontFamily}`;
        measured = ctx.measureText(str).width;
      }
      let out = str;
      if (measured > maxW && maxW > 12) {
        let lo = 1;
        let hi = out.length;
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2);
          if (ctx.measureText(out.slice(0, mid) + "…").width <= maxW) {
            lo = mid;
          } else {
            hi = mid - 1;
          }
        }
        out = out.slice(0, Math.max(1, lo)) + "…";
      }
      ctx.fillText(out, x, y, maxW);
    },

    getCurrentBlueprint() {
      const data = root.SANDBOX_DATA;
      if (this.isCustomDomain && this.customDomainText.trim()) {
        return data.generateCustomDomainBlueprint(this.customDomainText, this.perspectiveId);
      }
      return data.getPresetBlueprint(this.domainId, this.perspectiveId);
    },

    getPerspective() {
      return (
        root.SANDBOX_DATA.MODE_B_PERSPECTIVES.find((p) => p.id === this.perspectiveId) ||
        root.SANDBOX_DATA.MODE_B_PERSPECTIVES[0]
      );
    },

    renderDomainChips() {
      const data = root.SANDBOX_DATA;
      const domainWrap = document.getElementById("mode-b-domains");
      if (!domainWrap) return;
      domainWrap.innerHTML = "";
      data.MODE_B_DOMAINS.forEach((d) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pill-btn" + (!this.isCustomDomain && d.id === this.domainId ? " active" : "");
        btn.dataset.domainId = d.id;
        btn.innerHTML = `<span class="pill-title">${this.escapeHtml(d.name)}</span><span class="pill-sub">${this.escapeHtml(d.short)}</span>`;
        btn.addEventListener("click", () => {
          this.isCustomDomain = false;
          this.domainId = d.id;
          this.triggerCrushEffect();
          this.syncSelectorActiveStates();
          this.renderStationUI();
          this.onToast(this.t("modeB.toastDomainFed", d.name));
        });
        domainWrap.appendChild(btn);
      });
    },

    renderPerspectiveChips() {
      const data = root.SANDBOX_DATA;
      const perspWrap = document.getElementById("mode-b-perspectives");
      if (!perspWrap) return;
      perspWrap.innerHTML = "";
      data.MODE_B_PERSPECTIVES.forEach((p) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pill-btn" + (p.id === this.perspectiveId ? " active" : "");
        btn.dataset.perspectiveId = p.id;
        btn.innerHTML = `<span class="pill-title">${this.escapeHtml(p.name)}</span><span class="pill-sub">${this.escapeHtml(p.tag)}</span>`;
        btn.addEventListener("click", () => {
          this.perspectiveId = p.id;
          this.triggerForgeEffect();
          this.syncSelectorActiveStates();
          this.renderStationUI();
          this.onToast(this.t("modeB.toastPerspSwitched", p.name));
        });
        perspWrap.appendChild(btn);
      });
    },

    bindUI() {
      // 渲染 4 个硬核陌生领域芯片
      this.renderDomainChips();

      // 自定义领域输入
      const customInput = document.getElementById("custom-domain-input");
      const customBtn = document.getElementById("btn-crush-custom");
      const applyCustom = () => {
        if (!customInput) return;
        const val = customInput.value.trim();
        if (!val) {
          this.onToast(this.t("modeB.toastCustomEmpty"));
          return;
        }
        this.customDomainText = val;
        this.isCustomDomain = true;
        this.activeStation = 1;
        this.triggerCrushEffect();
        this.syncSelectorActiveStates();
        this.renderStationUI();
        this.onToast(this.t("modeB.toastCustomCreated", val));
      };

      if (customBtn) customBtn.addEventListener("click", applyCustom);
      if (customInput) {
        customInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") applyCustom();
        });
      }

      // 渲染 4 种个人视角芯片
      this.renderPerspectiveChips();

      // 绑定 4 工位导航按钮
      document.querySelectorAll(".station-tab[data-station]").forEach((tab) => {
        tab.addEventListener("click", () => {
          const st = parseInt(tab.dataset.station, 10);
          this.setStation(st);
        });
      });
    },

    syncSelectorActiveStates() {
      document.querySelectorAll("#mode-b-domains .pill-btn").forEach((el) => {
        el.classList.toggle("active", !this.isCustomDomain && el.dataset.domainId === this.domainId);
      });
      document.querySelectorAll("#mode-b-perspectives .pill-btn").forEach((el) => {
        el.classList.toggle("active", el.dataset.perspectiveId === this.perspectiveId);
      });
      document.querySelectorAll(".station-tab[data-station]").forEach((el) => {
        el.classList.toggle("active", parseInt(el.dataset.station, 10) === this.activeStation);
      });
    },

    setStation(st) {
      this.activeStation = Math.min(4, Math.max(1, st));
      if (this.activeStation === 1) this.triggerCrushEffect();
      if (this.activeStation === 4) this.triggerForgeEffect();
      this.syncSelectorActiveStates();
      this.renderStationUI();
    },

    reset() {
      this.domainId = "synthetic_bio";
      this.isCustomDomain = false;
      this.customDomainText = "";
      this.perspectiveId = "designer";
      this.activeStation = 1;
      this.litSocraticCount = 3;
      const customInput = document.getElementById("custom-domain-input");
      if (customInput) customInput.value = "";
      this.triggerCrushEffect();
      this.syncSelectorActiveStates();
      this.renderStationUI();
    },

    triggerCrushEffect() {
      this.crusherBoost = 1.8;
      // 迸发粉碎金色火花
      const cx = this.width * 0.16;
      const cy = 195;
      for (let i = 0; i < 24; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 45 + Math.random() * 110;
        this.particles.push({
          x: cx + (Math.random() - 0.5) * 26,
          y: cy + (Math.random() - 0.5) * 18,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 20,
          life: 1,
          decay: 1.4 + Math.random() * 0.9,
          size: 2 + Math.random() * 2.5,
          kind: "spark"
        });
      }
    },

    triggerForgeEffect() {
      this.forgeImpact = 1;
      const fx = this.width * 0.72;
      const fy = 450;
      for (let i = 0; i < 26; i++) {
        this.particles.push({
          x: fx + (Math.random() - 0.5) * 80,
          y: fy - 15,
          vx: (Math.random() - 0.5) * 140,
          vy: -40 - Math.random() * 110,
          life: 1,
          decay: 1.0 + Math.random() * 0.8,
          size: i % 2 === 0 ? 6 + Math.random() * 6 : 2.5,
          kind: i % 2 === 0 ? "steam" : "spark"
        });
      }
    },

    resizeCanvas() {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width < 10) return;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = rect.width;
      this.height = 620;
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
    },

    handleCanvasClick(e) {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = 0; i < this.stationRects.length; i++) {
        const box = this.stationRects[i];
        if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
          this.setStation(box.station);
          return;
        }
      }
    },

    startLoop() {
      const step = (now) => {
        const dt = Math.min(0.033, Math.max(0.004, (now - this.lastTime) / 1000));
        this.lastTime = now;

        const modeBEl = document.getElementById("mode-b-view");
        if (modeBEl && modeBEl.classList.contains("active")) {
          this.updateAlchemyPhysics(dt);
          this.drawAlchemyScene();
        }
        this.rafId = requestAnimationFrame(step);
      };
      this.rafId = requestAnimationFrame(step);
    },

    updateAlchemyPhysics(dt) {
      this.crusherBoost = Math.max(0, this.crusherBoost - dt * 1.4);
      const speedMul = 1 + this.crusherBoost * 1.8;
      this.beltOffset = (this.beltOffset + dt * 52 * speedMul) % 36;
      this.searchlightAngle += dt * 1.6;

      if (this.forgeImpact > 0) {
        this.forgeImpact = Math.max(0, this.forgeImpact - dt * 1.6);
        // 快速落下再缓慢回升的液压锤曲线
        this.hammerY = Math.sin(this.forgeImpact * Math.PI) * 34;
      } else {
        this.hammerY = 0;
      }

      // 反应釜持续冒出轻微白蒸汽
      if (Math.random() < 0.22 && this.particles.length < 150) {
        this.particles.push({
          x: this.width * 0.84 + (Math.random() - 0.5) * 14,
          y: 356,
          vx: (Math.random() - 0.5) * 18,
          vy: -35 - Math.random() * 35,
          life: 1,
          decay: 0.75,
          size: 5 + Math.random() * 5,
          kind: "steam"
        });
      }

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.kind === "spark") p.vy += 160 * dt;
        else p.size += dt * 7;
        p.life -= p.decay * dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
    },

    drawAlchemyScene() {
      const ctx = this.ctx;
      const W = this.width;
      const H = this.height;
      const bp = this.getCurrentBlueprint();
      const persp = this.getPerspective();

      ctx.save();
      ctx.scale(this.dpr, this.dpr);
      ctx.clearRect(0, 0, W, H);

      const col1X = W * 0.17;
      const col2X = W * 0.5;
      const col3X = W * 0.83;
      const beltY = 300;
      const lowerBeltY = 515;

      // 记录 4 个可点击工位热区
      this.stationRects = [
        { station: 1, x: 16, y: 24, w: W * 0.31, h: 270 },
        { station: 2, x: W * 0.34, y: 24, w: W * 0.32, h: 270 },
        { station: 3, x: W * 0.67, y: 24, w: W * 0.31, h: 270 },
        { station: 4, x: 30, y: 330, w: W - 60, h: 270 }
      ];

      // 1. 绘制顶部工作区背景框架与当前激活高光
      this.drawStationHighlightBox(ctx, 16, 22, W * 0.31, 266, this.activeStation === 1, this.t("modeB.canvasStation1"));
      this.drawStationHighlightBox(ctx, W * 0.345, 22, W * 0.31, 266, this.activeStation === 2, this.t("modeB.canvasStation2"));
      this.drawStationHighlightBox(ctx, W * 0.675, 22, W * 0.305, 266, this.activeStation === 3, this.t("modeB.canvasStation3"));
      this.drawStationHighlightBox(ctx, 24, 342, W - 48, 258, this.activeStation === 4, this.t("modeB.canvasStation4"));

      // 2. 工位 1：原料漏斗 + 概念粉碎双齿轮
      ctx.fillStyle = "#1a283b";
      ctx.strokeStyle = "#d39f42";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(col1X - 54, 64);
      ctx.lineTo(col1X + 54, 64);
      ctx.lineTo(col1X + 26, 128);
      ctx.lineTo(col1X - 26, 128);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 漏斗中显示的陌生领域原料名
      ctx.fillStyle = "#f4d078";
      ctx.textAlign = "center";
      this.drawFittedText(ctx, bp.name, col1X, 95, 84, 12, 8.8, "bold", CANVAS_FONT_SANS);

      const gearSpin = (performance.now() * 0.0018) * (1 + this.crusherBoost * 2);
      this.drawGear(ctx, col1X - 30, 178, 29, 10, gearSpin, "#9b6b1e", "#f4d078");
      this.drawGear(ctx, col1X + 30, 178, 29, 10, -gearSpin + 0.31, "#825512", "#d39f42");

      // 下落本质块标签
      const essenceBoxW = Math.max(116, Math.min(152, W * 0.25));
      ctx.fillStyle = "rgba(72, 219, 232, 0.16)";
      ctx.strokeStyle = "#48dbe8";
      ctx.lineWidth = 1.4;
      ctx.fillRect(col1X - essenceBoxW * 0.5, 232, essenceBoxW, 26);
      ctx.strokeRect(col1X - essenceBoxW * 0.5, 232, essenceBoxW, 26);
      ctx.fillStyle = "#a5f3fc";
      this.drawFittedText(
        ctx,
        this.t("modeB.canvasEssencePill"),
        col1X,
        249,
        essenceBoxW - 10,
        11,
        8.5,
        "bold",
        CANVAS_FONT_SANS
      );

      // 3. 工位 2：Socratic 共振线圈 + 3 级追问能源管
      for (let s = 0; s < 3; s++) {
        const tubeX = col2X - 56 + s * 42;
        const isLit = s < this.litSocraticCount;
        ctx.fillStyle = isLit ? "rgba(72, 219, 232, 0.25)" : "#0b111a";
        ctx.strokeStyle = isLit ? "#48dbe8" : "#475569";
        ctx.lineWidth = 2;
        ctx.fillRect(tubeX, 92, 28, 128);
        ctx.strokeRect(tubeX, 92, 28, 128);

        if (isLit) {
          const pulseH = 70 + Math.sin(performance.now() * 0.004 + s * 1.4) * 28;
          const grad = ctx.createLinearGradient(0, 220 - pulseH, 0, 220);
          grad.addColorStop(0, "#48dbe8");
          grad.addColorStop(1, "#0284c7");
          ctx.fillStyle = grad;
          ctx.fillRect(tubeX + 4, 220 - pulseH, 20, pulseH - 4);
        }

        ctx.fillStyle = isLit ? "#f4d078" : "#64748b";
        ctx.font = `bold 11px ${CANVAS_FONT_MONO}`;
        ctx.textAlign = "center";
        ctx.fillText(`Q${s + 1}`, tubeX + 14, 82);
      }

      ctx.fillStyle = "#cbd5e1";
      this.drawFittedText(
        ctx,
        this.t("modeB.canvasSocraticCap"),
        col2X,
        248,
        W * 0.28,
        11,
        8.5,
        "",
        CANVAS_FONT_SANS
      );

      // 4. 工位 3：人类痛点探照灯 + 扇形光束
      const lampX = col3X;
      const lampY = 82;
      const sweep = this.activeStation === 3 ? Math.sin(this.searchlightAngle) * 0.14 : Math.sin(this.searchlightAngle * 0.6) * 0.22;

      ctx.save();
      ctx.translate(lampX, lampY);
      ctx.rotate(sweep);
      // 扇形光锥
      const beamGrad = ctx.createLinearGradient(0, 12, 0, 185);
      beamGrad.addColorStop(0, "rgba(244, 208, 120, 0.42)");
      beamGrad.addColorStop(1, "rgba(72, 219, 232, 0.02)");
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(-12, 12);
      ctx.lineTo(-82, 182);
      ctx.lineTo(82, 182);
      ctx.lineTo(12, 12);
      ctx.closePath();
      ctx.fill();

      // 黄铜探照灯头
      ctx.fillStyle = "#d39f42";
      ctx.strokeStyle = "#fde68a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 16, Math.PI, 0);
      ctx.lineTo(22, 16);
      ctx.lineTo(-22, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 被探照灯照亮的个人视角靶心
      const painBoxW = Math.max(132, Math.min(176, W * 0.27));
      ctx.fillStyle = "rgba(211, 159, 66, 0.18)";
      ctx.strokeStyle = "#f4d078";
      ctx.lineWidth = 1.6;
      ctx.fillRect(col3X - painBoxW * 0.5, 224, painBoxW, 34);
      ctx.strokeRect(col3X - painBoxW * 0.5, 224, painBoxW, 34);
      ctx.fillStyle = "#f4d078";
      ctx.textAlign = "center";
      this.drawFittedText(
        ctx,
        this.t("modeB.canvasPainTarget", persp.name),
        col3X,
        245,
        painBoxW - 10,
        11.5,
        8.5,
        "bold",
        CANVAS_FONT_SANS
      );

      // 5. 上层水平机械传送带（从工位 1 -> 工位 2 -> 工位 3 -> 垂落管道进反应釜）
      this.drawConveyorBelt(ctx, 36, beltY, W - 72, 24, this.beltOffset);

      // 传送带上流转的能量原料包
      const packetX1 = 70 + ((performance.now() * 0.06) % (W - 180));
      const packetX2 = 70 + (((performance.now() * 0.06) + (W - 180) * 0.5) % (W - 180));
      this.drawConveyorPayload(ctx, packetX1, beltY - 12, this.t("modeB.canvasPayloadEssence"));
      this.drawConveyorPayload(ctx, packetX2, beltY - 12, persp.name);

      // 右侧垂直导入管道通向反应釜
      ctx.fillStyle = "#162436";
      ctx.strokeStyle = "#d39f42";
      ctx.lineWidth = 2;
      ctx.fillRect(W - 92, beltY + 24, 24, 96);
      ctx.strokeRect(W - 92, beltY + 24, 24, 96);

      // 6. 工位 4：下方大型蒸汽反应釜 + 液压锻造重锤 + 立项卡输出
      const vatX = W * 0.25;
      const vatY = 445;

      // 左侧融合反应釜罐体
      const vatGrad = ctx.createLinearGradient(vatX - 80, vatY - 60, vatX + 80, vatY + 60);
      vatGrad.addColorStop(0, "#1d2f45");
      vatGrad.addColorStop(0.5, "#283e59");
      vatGrad.addColorStop(1, "#111b29");
      ctx.fillStyle = vatGrad;
      ctx.strokeStyle = "#d39f42";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(vatX - 86, vatY - 56, 172, 110, 18);
      ctx.fill();
      ctx.stroke();

      // 反应釜视窗内部沸腾液体
      ctx.fillStyle = "rgba(72, 219, 232, 0.22)";
      ctx.strokeStyle = "#48dbe8";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(vatX, vatY, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#f4d078";
      ctx.textAlign = "center";
      this.drawFittedText(
        ctx,
        this.t("modeB.canvasVatLine1"),
        vatX,
        vatY - 3,
        62,
        10.5,
        8,
        "bold",
        CANVAS_FONT_SANS
      );
      ctx.fillStyle = "#48dbe8";
      this.drawFittedText(
        ctx,
        this.t("modeB.canvasVatLine2"),
        vatX,
        vatY + 13,
        62,
        10.5,
        8,
        "bold",
        CANVAS_FONT_SANS
      );

      // 中央连接管道与液压锻锤
      ctx.strokeStyle = "#d39f42";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(vatX + 86, vatY + 10);
      ctx.lineTo(W * 0.62, vatY + 10);
      ctx.stroke();

      const anvilX = W * 0.7;
      const anvilY = 488;
      // 锻锤支架与上下移动锻头
      ctx.fillStyle = "#1c2b3d";
      ctx.fillRect(anvilX - 46, 376, 92, 14);
      ctx.fillStyle = "#b98329";
      ctx.strokeStyle = "#f4d078";
      ctx.lineWidth = 2;
      ctx.fillRect(anvilX - 34, 392 + this.hammerY, 68, 34);
      ctx.strokeRect(anvilX - 34, 392 + this.hammerY, 68, 34);

      // 成品立项卡展示台
      this.drawConveyorBelt(ctx, anvilX - 150, lowerBeltY, 300, 22, this.beltOffset);

      ctx.save();
      ctx.fillStyle = this.activeStation === 4 ? "rgba(211, 159, 66, 0.24)" : "rgba(22, 34, 51, 0.92)";
      ctx.strokeStyle = "#f4d078";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(244, 208, 120, 0.35)";
      ctx.shadowBlur = this.activeStation === 4 ? 16 : 6;
      ctx.beginPath();
      ctx.roundRect(anvilX - 122, 444, 244, 62, 8);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#48dbe8";
      ctx.font = `bold 10.5px ${CANVAS_FONT_MONO}`;
      ctx.textAlign = "center";
      ctx.fillText(bp.unicornCard.code, anvilX, 464, 228);

      ctx.fillStyle = "#f4d078";
      this.drawFittedText(
        ctx,
        bp.unicornCard.name,
        anvilX,
        486,
        228,
        12.5,
        9.2,
        "bold",
        CANVAS_FONT_SANS
      );

      // 7. 粒子特效层（蒸汽、火花）
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        ctx.globalAlpha = Math.max(0, p.life * 0.78);
        if (p.kind === "spark") {
          ctx.fillStyle = "#fde047";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = "rgba(226, 232, 240, 0.45)";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      ctx.restore();
    },

    drawStationHighlightBox(ctx, x, y, w, h, active, title) {
      ctx.save();
      ctx.fillStyle = active ? "rgba(211, 159, 66, 0.08)" : "rgba(11, 18, 28, 0.45)";
      ctx.strokeStyle = active ? "#f4d078" : "rgba(72, 219, 232, 0.22)";
      ctx.lineWidth = active ? 2 : 1;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = active ? "#f4d078" : "#94a3b8";
      ctx.textAlign = "left";
      this.drawFittedText(ctx, title, x + 10, y + 18, w - 20, 11.5, 8.8, "bold", CANVAS_FONT_SANS);
      ctx.restore();
    },

    drawConveyorBelt(ctx, x, y, w, h, offset) {
      ctx.save();
      ctx.fillStyle = "#111b27";
      ctx.strokeStyle = "#8a6220";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, h * 0.5);
      ctx.fill();
      ctx.stroke();

      // 传送带运动刻度线
      ctx.beginPath();
      ctx.roundRect(x + 8, y + 2, w - 16, h - 4, h * 0.4);
      ctx.clip();
      ctx.strokeStyle = "rgba(211, 159, 66, 0.45)";
      ctx.lineWidth = 2;
      for (let gx = x - 36 + offset; gx < x + w + 36; gx += 22) {
        ctx.beginPath();
        ctx.moveTo(gx, y);
        ctx.lineTo(gx + 8, y + h);
        ctx.stroke();
      }
      ctx.restore();

      // 左右滚轮
      this.drawGear(ctx, x + 12, y + h * 0.5, 9, 6, offset * 0.12, "#8a6220", "#f4d078");
      this.drawGear(ctx, x + w - 12, y + h * 0.5, 9, 6, offset * 0.12, "#8a6220", "#f4d078");
    },

    drawConveyorPayload(ctx, x, y, text) {
      ctx.save();
      ctx.font = `10px ${CANVAS_FONT_SANS}`;
      const textW = ctx.measureText(String(text || "")).width;
      const pillW = Math.min(144, Math.max(72, textW + 18));
      ctx.fillStyle = "#17273c";
      ctx.strokeStyle = "#48dbe8";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(x - pillW * 0.5, y - 10, pillW, 20, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e2e8f0";
      ctx.textAlign = "center";
      this.drawFittedText(ctx, text, x, y + 4, pillW - 10, 10, 8.2, "", CANVAS_FONT_SANS);
      ctx.restore();
    },

    drawGear(ctx, cx, cy, r, teeth, angle, fill, stroke) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      const outerR = r + 4;
      const innerR = r - 1;
      for (let i = 0; i < teeth; i++) {
        const a0 = (i / teeth) * Math.PI * 2;
        const a1 = ((i + 0.35) / teeth) * Math.PI * 2;
        const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
        const a3 = ((i + 0.85) / teeth) * Math.PI * 2;
        if (i === 0) ctx.moveTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR);
        ctx.lineTo(Math.cos(a0) * outerR, Math.sin(a0) * outerR);
        ctx.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
        ctx.lineTo(Math.cos(a2) * innerR, Math.sin(a2) * innerR);
        ctx.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = "#0b111a";
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    },

    onLangChange() {
      if (!this.initialized) return;
      this.renderDomainChips();
      this.renderPerspectiveChips();
      this.renderStationUI();
      const modeBEl = document.getElementById("mode-b-view");
      if (modeBEl && modeBEl.classList.contains("active")) {
        this.drawAlchemyScene();
      }
    },

    renderStationUI() {
      const container = document.getElementById("mode-b-station-content");
      if (!container) return;

      const bp = this.getCurrentBlueprint();
      const persp = this.getPerspective();
      this.syncSelectorActiveStates();

      if (this.activeStation === 1) {
        const jargonsHtml = bp.jargons
          .map((j) => `<span class="jargon-pill" title="${this.escapeHtml(j.plain)}">🔨 ${this.escapeHtml(j.term)} → ${this.escapeHtml(j.plain)}</span>`)
          .join("");
        const essHtml = bp.essences
          .map((e) => `<div class="essence-item"><strong>${this.escapeHtml(e.title)}</strong><div>${this.escapeHtml(e.body)}</div></div>`)
          .join("");

        container.innerHTML = `
          <div class="station-card">
            <h3><span>${this.escapeHtml(this.t("modeB.s1Title"))}</span><span class="panel-badge">${this.escapeHtml(bp.name)}</span></h3>
            <div style="font-size:12px;color:#9bb0c7;margin-bottom:8px;">${this.escapeHtml(this.t("modeB.s1Intro"))}</div>
            <div class="jargon-pill-row">${jargonsHtml}</div>
            <div class="essence-list">${essHtml}</div>
            <div class="station-footer-nav">
              <button type="button" class="btn btn-sm" id="btn-recrush">${this.escapeHtml(this.t("modeB.btnRecrush"))}</button>
              <button type="button" class="btn btn-brass btn-sm" id="btn-next-s2">${this.escapeHtml(this.t("modeB.btnNextS2"))}</button>
            </div>
          </div>
        `;
        document.getElementById("btn-recrush").addEventListener("click", () => this.triggerCrushEffect());
        document.getElementById("btn-next-s2").addEventListener("click", () => this.setStation(2));
        return;
      }

      if (this.activeStation === 2) {
        const stepsHtml = bp.socraticSteps
          .map((st, idx) => {
            const lit = idx < this.litSocraticCount;
            return `
              <div class="socratic-step${lit ? " lit" : ""}" data-socratic-idx="${idx}">
                <div class="socratic-head"><span>${this.escapeHtml(st.q)}</span><span>${this.escapeHtml(
              lit ? this.t("modeB.s2Resonated") : this.t("modeB.s2ClickLight")
            )}</span></div>
                <div style="color:#cbd5e1;">${this.escapeHtml(st.a)}</div>
              </div>
            `;
          })
          .join("");

        container.innerHTML = `
          <div class="station-card">
            <h3><span>${this.escapeHtml(this.t("modeB.s2Title"))}</span><span class="panel-badge">${this.escapeHtml(persp.name)}</span></h3>
            <div class="essence-list">${stepsHtml}</div>
            <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:12px;color:#f4d078;font-weight:700;">${this.escapeHtml(this.t("modeB.s2PromptHeading"))}</span>
              <button type="button" class="btn btn-cyan btn-sm" id="btn-copy-prompt">${this.escapeHtml(this.t("modeB.btnCopyPrompt"))}</button>
            </div>
            <pre class="prompt-preview" id="station2-prompt-box">${this.escapeHtml(bp.promptText)}</pre>
            <div class="station-footer-nav">
              <button type="button" class="btn btn-sm" id="btn-prev-s1">${this.escapeHtml(this.t("modeB.btnPrevS1"))}</button>
              <button type="button" class="btn btn-brass btn-sm" id="btn-next-s3">${this.escapeHtml(this.t("modeB.btnNextS3"))}</button>
            </div>
          </div>
        `;

        container.querySelectorAll(".socratic-step").forEach((el) => {
          el.addEventListener("click", () => {
            const idx = parseInt(el.dataset.socraticIdx, 10);
            this.litSocraticCount = idx + 1;
            this.renderStationUI();
          });
        });

        document.getElementById("btn-copy-prompt").addEventListener("click", () => {
          this.copyText(bp.promptText, this.t("modeB.toastPromptCopied"));
        });
        document.getElementById("btn-prev-s1").addEventListener("click", () => this.setStation(1));
        document.getElementById("btn-next-s3").addEventListener("click", () => this.setStation(3));
        return;
      }

      if (this.activeStation === 3) {
        const painsHtml = bp.pains
          .map((pain) => {
            const isMatch = pain.forId === this.perspectiveId;
            return `
              <div class="pain-item${isMatch ? " highlight" : ""}">
                <strong>${isMatch ? this.escapeHtml(this.t("modeB.s3MatchTag")) : ""}${this.escapeHtml(pain.title)}</strong>
                <div>${this.escapeHtml(pain.body)}</div>
              </div>
            `;
          })
          .join("");

        container.innerHTML = `
          <div class="station-card">
            <h3><span>${this.escapeHtml(this.t("modeB.s3Title"))}</span><span class="panel-badge">${this.escapeHtml(
          this.t("modeB.s3BadgeLens", persp.name)
        )}</span></h3>
            <div style="font-size:12px;color:#9bb0c7;margin-bottom:8px;">${this.escapeHtml(this.t("modeB.s3Intro"))}</div>
            <div class="pain-list">${painsHtml}</div>
            <div class="station-footer-nav">
              <button type="button" class="btn btn-sm" id="btn-prev-s2">${this.escapeHtml(this.t("modeB.btnPrevS2"))}</button>
              <button type="button" class="btn btn-brass btn-sm" id="btn-next-s4">${this.escapeHtml(this.t("modeB.btnNextS4"))}</button>
            </div>
          </div>
        `;
        document.getElementById("btn-prev-s2").addEventListener("click", () => this.setStation(2));
        document.getElementById("btn-next-s4").addEventListener("click", () => this.setStation(4));
        return;
      }

      // 工位 4：一人独角兽项目立项卡锻造
      const card = bp.unicornCard;
      container.innerHTML = `
        <div class="station-card">
          <div class="unicorn-card">
            <div class="unicorn-header">
              <div>
                <div class="unicorn-code">${this.escapeHtml(card.code)} · ${this.escapeHtml(bp.name)} × ${this.escapeHtml(persp.name)}</div>
                <h4 class="unicorn-title">${this.escapeHtml(card.name)}</h4>
              </div>
              <span class="panel-badge" style="background:rgba(61,214,140,0.16);border-color:#3dd68c;color:#86efac;">${this.escapeHtml(
                this.t("modeB.cardBadgeForged")
              )}</span>
            </div>
            <div class="unicorn-field"><b>${this.escapeHtml(this.t("modeB.cardFieldPitch"))}</b>${this.escapeHtml(card.pitch)}</div>
            <div class="unicorn-field"><b>${this.escapeHtml(this.t("modeB.cardFieldLeverage"))}</b>${this.escapeHtml(card.leverage)}</div>
            <div class="unicorn-field"><b>${this.escapeHtml(this.t("modeB.cardFieldMvp"))}</b>${this.escapeHtml(card.mvp72h)}</div>
            <div class="unicorn-field" style="margin-bottom:0;"><b>${this.escapeHtml(this.t("modeB.cardFieldMonetization"))}</b>${this.escapeHtml(card.monetization)}</div>
          </div>
          <div class="station-footer-nav no-print" style="flex-wrap:wrap;">
            <button type="button" class="btn btn-sm" id="btn-prev-s3">${this.escapeHtml(this.t("modeB.btnPrevS3"))}</button>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="btn btn-sm" id="btn-reforge">${this.escapeHtml(this.t("modeB.btnReforge"))}</button>
              <button type="button" class="btn btn-cyan btn-sm" id="btn-copy-card">${this.escapeHtml(this.t("modeB.btnCopyCard"))}</button>
              <button type="button" class="btn btn-brass btn-sm" id="btn-print-card">${this.escapeHtml(this.t("modeB.btnPrintCard"))}</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById("btn-prev-s3").addEventListener("click", () => this.setStation(3));
      document.getElementById("btn-reforge").addEventListener("click", () => {
        this.triggerForgeEffect();
        this.onToast(this.t("modeB.toastReforged"));
      });
      document.getElementById("btn-copy-card").addEventListener("click", () => {
        const mdText = [
          `# ${card.name} (${card.code})`,
          `- ${this.t("modeB.copyCardDomain")}：${bp.name}`,
          `- ${this.t("modeB.copyCardPerspective")}：${persp.name} (${persp.tag})`,
          `- ${this.t("modeB.copyCardPitch")}：${card.pitch}`,
          `- ${this.t("modeB.copyCardLeverage")}：${card.leverage}`,
          `- ${this.t("modeB.copyCardMvp")}：${card.mvp72h}`,
          `- ${this.t("modeB.copyCardMonetization")}：${card.monetization}`
        ].join("\n");
        this.copyText(mdText, this.t("modeB.toastCardCopied"));
      });
      document.getElementById("btn-print-card").addEventListener("click", () => {
        window.print();
      });
    },

    copyText(text, successMsg) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(() => this.onToast(successMsg))
          .catch(() => this.fallbackCopy(text, successMsg));
      } else {
        this.fallbackCopy(text, successMsg);
      }
    },

    fallbackCopy(text, successMsg) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        this.onToast(successMsg);
      } catch (err) {
        this.onToast(this.t("modeB.toastCopyFailed"));
      }
      document.body.removeChild(ta);
    },

    escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = ModeBAlchemy;
  }
  if (root) {
    root.ModeBAlchemy = ModeBAlchemy;
  }
})(typeof window !== "undefined" ? window : globalThis);
