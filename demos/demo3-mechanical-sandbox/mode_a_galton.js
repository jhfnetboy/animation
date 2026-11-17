/**
 * 示范工程 3：模式 A - LLM 概率弹珠高尔顿板物理模拟引擎
 * 包含：Canvas 2D 弹性碰撞物理引擎、咬合黄铜齿轮、炉火/冰霜气流、
 *       Top-K 机械闸门、Softmax 实时计算、理论曲线对比、3 轮接龙与幻觉警报
 */
(function (root) {
  "use strict";

  const CANVAS_FONT_SANS =
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "Noto Sans Thai", "Sarabun", "Thonburi", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
  const CANVAS_FONT_MONO =
    '"JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, "Noto Sans Thai", "Sarabun", monospace';

  const ModeAGalton = {
    initialized: false,
    canvas: null,
    ctx: null,
    width: 820,
    height: 620,
    dpr: 1,
    rafId: null,
    lastTime: 0,

    // 核心实验状态
    scenarioId: "poem",
    roundIndex: 0, // 0, 1, 2
    temperature: 0.85,
    topK: 5,
    historyTokens: [], // [{ prefix, word, prob, risk, temp }]
    finished: false,

    // 统计与物理状态
    counts: [0, 0, 0, 0, 0, 0, 0, 0],
    totalDropped: 0,
    lastLandedBin: -1,
    pendingAdvanceOnLand: false, // 单颗采样投掷时，落地后自动推进下一轮
    marbles: [],
    pegs: [],
    sparks: [], // 撞击火花 + 炉火/冰霜气流粒子
    gearAngle: 0,
    gateProgress: 5, // 平滑插值到当前 topK

    // 计算缓存
    computedProbs: [], // [{ word, logit, rawProb, effectiveProb, risk, note, locked }]
    entropy: 0,
    onToast: null,

    init(options) {
      if (this.initialized) return;
      this.canvas = document.getElementById("galton-canvas");
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext("2d");
      this.onToast = (options && options.onToast) || function () {};

      this.bindUI();
      this.recomputeDistribution();
      this.resizeCanvas();
      this.buildPegs();

      window.addEventListener("resize", () => this.resizeCanvas());

      this.canvas.addEventListener("click", (e) => this.handleCanvasClick(e));
      this.initialized = true;
      this.lastTime = performance.now();
      this.renderAllUI();
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

    getScenario() {
      const list = root.SANDBOX_DATA.MODE_A_SCENARIOS;
      return list.find((s) => s.id === this.scenarioId) || list[0];
    },

    getCurrentRound() {
      const sc = this.getScenario();
      const idx = Math.min(this.roundIndex, sc.rounds.length - 1);
      return sc.rounds[idx];
    },

    renderScenarioPills() {
      const pillsWrap = document.getElementById("mode-a-scenarios");
      if (!pillsWrap) return;
      pillsWrap.innerHTML = "";
      root.SANDBOX_DATA.MODE_A_SCENARIOS.forEach((sc) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pill-btn" + (sc.id === this.scenarioId ? " active" : "");
        btn.dataset.scenarioId = sc.id;
        btn.innerHTML = `<span class="pill-title">${this.escapeHtml(sc.title)}</span><span class="pill-sub">${this.escapeHtml(sc.badge)}</span>`;
        btn.addEventListener("click", () => {
          this.selectScenario(sc.id);
        });
        pillsWrap.appendChild(btn);
      });
    },

    bindUI() {
      // 渲染场景切换按钮
      this.renderScenarioPills();

      // 温度滑杆
      const tempSlider = document.getElementById("temp-slider");
      if (tempSlider) {
        tempSlider.value = String(this.temperature);
        tempSlider.addEventListener("input", (e) => {
          this.temperature = parseFloat(e.target.value);
          this.recomputeDistribution();
          this.renderTelemetryOnly();
        });
      }

      // Top-K 滑杆
      const topkSlider = document.getElementById("topk-slider");
      if (topkSlider) {
        topkSlider.value = String(this.topK);
        topkSlider.addEventListener("input", (e) => {
          this.topK = parseInt(e.target.value, 10);
          this.recomputeDistribution();
          this.renderTelemetryOnly();
        });
      }

      // 投掷按钮
      const btnDrop1 = document.getElementById("btn-drop-1");
      const btnDrop10 = document.getElementById("btn-drop-10");
      const btnDrop50 = document.getElementById("btn-drop-50");
      const btnSampleNext = document.getElementById("btn-sample-next");
      const btnClearBins = document.getElementById("btn-clear-bins");

      if (btnDrop1) btnDrop1.addEventListener("click", () => this.spawnMarbles(1, false));
      if (btnDrop10) btnDrop10.addEventListener("click", () => this.spawnMarbles(10, false));
      if (btnDrop50) btnDrop50.addEventListener("click", () => this.spawnMarbles(50, false));
      if (btnSampleNext) {
        btnSampleNext.addEventListener("click", () => {
          if (this.finished) {
            this.resetScenarioState();
            return;
          }
          // 发射 1 颗带有“落地自动接龙”标记的高亮金色主弹珠
          this.spawnMarbles(1, true);
        });
      }
      if (btnClearBins) {
        btnClearBins.addEventListener("click", () => {
          this.clearCountsOnly();
          this.onToast(this.t("modeA.toastCleared"));
        });
      }
    },

    selectScenario(id) {
      this.scenarioId = id;
      this.resetScenarioState();
      const pills = document.querySelectorAll("#mode-a-scenarios .pill-btn");
      pills.forEach((p) => {
        p.classList.toggle("active", p.dataset.scenarioId === id);
      });
    },

    reset() {
      this.temperature = 0.85;
      this.topK = 5;
      const tempSlider = document.getElementById("temp-slider");
      const topkSlider = document.getElementById("topk-slider");
      if (tempSlider) tempSlider.value = "0.85";
      if (topkSlider) topkSlider.value = "5";
      this.resetScenarioState();
    },

    resetScenarioState() {
      this.roundIndex = 0;
      this.historyTokens = [];
      this.finished = false;
      this.clearCountsOnly();
      this.recomputeDistribution();
      this.renderAllUI();
    },

    clearCountsOnly() {
      this.counts = [0, 0, 0, 0, 0, 0, 0, 0];
      this.totalDropped = 0;
      this.lastLandedBin = -1;
      this.marbles = [];
      this.pendingAdvanceOnLand = false;
      this.renderTelemetryOnly();
    },

    /**
     * 核心数学：根据 Logits、Temperature 和 Top-K 实时计算 Softmax 概率与熵
     */
    recomputeDistribution() {
      const round = this.getCurrentRound();
      const cands = round.candidates;
      const T = Math.max(0.05, this.temperature);

      let maxLogit = -Infinity;
      for (let i = 0; i < cands.length; i++) {
        if (cands[i].logit > maxLogit) maxLogit = cands[i].logit;
      }

      const exps = cands.map((c) => Math.exp((c.logit - maxLogit) / T));
      const sumAll = exps.reduce((a, b) => a + b, 0) || 1;
      const rawProbs = exps.map((v) => v / sumAll);

      // 计算 Top-K 截断与重归一化（保持候选词在 0..7 槽的固定顺序，前 topK 个开放）
      let sumTopK = 0;
      for (let i = 0; i < cands.length; i++) {
        if (i < this.topK) sumTopK += rawProbs[i];
      }
      sumTopK = sumTopK || 1;

      let entropy = 0;
      this.computedProbs = cands.map((c, idx) => {
        const locked = idx >= this.topK;
        const effectiveProb = locked ? 0 : rawProbs[idx] / sumTopK;
        if (effectiveProb > 1e-9) {
          entropy -= effectiveProb * Math.log2(effectiveProb);
        }
        return {
          index: idx,
          word: c.word,
          logit: c.logit,
          risk: c.risk,
          note: c.note,
          rawProb: rawProbs[idx],
          effectiveProb,
          locked
        };
      });

      this.entropy = entropy;
    },

    /**
     * 按当前有效 Softmax+Top-K 分布抽样一个目标槽位索引
     */
    sampleTargetBin() {
      const r = Math.random();
      let acc = 0;
      for (let i = 0; i < this.computedProbs.length; i++) {
        acc += this.computedProbs[i].effectiveProb;
        if (r <= acc) return i;
      }
      return Math.max(0, this.topK - 1);
    },

    spawnMarbles(count, advanceOnLand) {
      if (this.finished && advanceOnLand) {
        this.resetScenarioState();
        return;
      }

      // 如果正在飞行太多，限制同屏最大物理粒子数防掉帧
      if (this.marbles.length > 120) {
        this.marbles.splice(0, this.marbles.length - 100);
      }

      const funnelX = this.width * 0.5;
      const funnelY = 66;

      for (let i = 0; i < count; i++) {
        const targetBin = this.sampleTargetBin();
        const isGoldenSampler = Boolean(advanceOnLand && i === 0);
        const jitterX = (Math.random() - 0.5) * 14;
        const delayFrames = count > 1 ? Math.floor(i * 1.4) : 0;

        this.marbles.push({
          x: funnelX + jitterX,
          y: funnelY - delayFrames * 4,
          vx: (Math.random() - 0.5) * (25 + this.temperature * 40),
          vy: 30 + Math.random() * 25,
          r: isGoldenSampler ? 7.2 : 5.4,
          targetBin,
          isGoldenSampler,
          delay: delayFrames * 0.016,
          landed: false,
          trail: []
        });
      }
    },

    /**
     * 选定某个槽位的词并推进 3 轮接龙
     */
    commitTokenSelection(binIndex, sourceKeyOrLabel) {
      if (this.finished) {
        this.onToast(this.t("modeA.toastAlreadyFinished"));
        return;
      }
      const item = this.computedProbs[binIndex];
      if (!item) return;

      const round = this.getCurrentRound();
      this.historyTokens.push({
        roundIdx: this.roundIndex,
        binIndex: binIndex,
        prefix: round.promptPrefix,
        word: item.word,
        prob: item.effectiveProb,
        rawProb: item.rawProb,
        risk: item.risk,
        temp: this.temperature,
        topK: this.topK
      });

      const sourceLabel =
        typeof sourceKeyOrLabel === "string" && sourceKeyOrLabel.indexOf("modeA.") === 0
          ? this.t(sourceKeyOrLabel)
          : sourceKeyOrLabel;

      const sc = this.getScenario();
      if (this.roundIndex < sc.rounds.length - 1) {
        this.roundIndex += 1;
        this.clearCountsOnly();
        this.recomputeDistribution();
        this.renderAllUI();
        this.onToast(this.t("modeA.toastRoundAdvanced", sourceLabel, item.word, this.roundIndex + 1));
      } else {
        this.finished = true;
        this.renderAllUI();
        if (item.risk >= 2 || this.historyTokens.some((t) => t.risk >= 2)) {
          this.onToast(this.t("modeA.toastDoneSnowball"));
        } else {
          this.onToast(this.t("modeA.toastDoneSuccess"));
        }
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
      this.buildPegs();
    },

    /**
     * 构建交错黄铜钉阵（7 行物理柱钉）
     */
    buildPegs() {
      this.pegs = [];
      const rows = 7;
      const topY = 126;
      const rowGap = 38;
      const marginX = 56;
      const usableW = this.width - marginX * 2;
      const binW = usableW / 8;

      for (let r = 0; r < rows; r++) {
        const isOdd = r % 2 === 1;
        const cols = isOdd ? 8 : 7;
        const startX = marginX + (isOdd ? binW * 0.5 : binW);
        for (let c = 0; c < cols; c++) {
          this.pegs.push({
            x: startX + c * binW,
            y: topY + r * rowGap,
            r: 5.5,
            hitGlow: 0
          });
        }
      }
    },

    getLayoutMetrics() {
      const marginX = 56;
      const usableW = this.width - marginX * 2;
      const binW = usableW / 8;
      const gateY = 408;
      const binTopY = 424;
      const binBottomY = 550;
      return { marginX, usableW, binW, gateY, binTopY, binBottomY };
    },

    handleCanvasClick(e) {
      if (!this.canvas) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { marginX, binW, binTopY } = this.getLayoutMetrics();

      // 点击底部 8 个收集槽或铭牌，可以直接选词接龙
      if (y >= binTopY - 12 && x >= marginX && x <= this.width - marginX) {
        const binIdx = Math.min(7, Math.max(0, Math.floor((x - marginX) / binW)));
        const cand = this.computedProbs[binIdx];
        if (cand && cand.locked) {
          this.onToast(this.t("modeA.toastGateBlocked", cand.word, this.topK));
          return;
        }
        this.commitTokenSelection(binIdx, "modeA.sourceClickBin");
        return;
      }

      // 点击上方钉阵区投掷 1 颗弹珠
      if (y < binTopY - 12) {
        this.spawnMarbles(1, false);
      }
    },

    startLoop() {
      const step = (now) => {
        const dt = Math.min(0.033, Math.max(0.004, (now - this.lastTime) / 1000));
        this.lastTime = now;

        // 只有在模式 A 激活时渲染物理帧，省电流畅
        const modeAEl = document.getElementById("mode-a-view");
        if (modeAEl && modeAEl.classList.contains("active")) {
          this.updatePhysics(dt);
          this.drawScene();
        }
        this.rafId = requestAnimationFrame(step);
      };
      this.rafId = requestAnimationFrame(step);
    },

    updatePhysics(dt) {
      const { marginX, usableW, binW, gateY, binTopY, binBottomY } = this.getLayoutMetrics();

      // 平滑 Top-K 闸门移动与黄铜齿轮转动
      this.gateProgress += (this.topK - this.gateProgress) * Math.min(1, dt * 10);
      const gearSpeed = 0.65 + this.temperature * 0.8 + Math.min(2.5, this.marbles.length * 0.08);
      this.gearAngle += dt * gearSpeed;

      // 钉子受击高光衰减
      for (let i = 0; i < this.pegs.length; i++) {
        if (this.pegs[i].hitGlow > 0) {
          this.pegs[i].hitGlow = Math.max(0, this.pegs[i].hitGlow - dt * 3.5);
        }
      }

      // 环境热气流 / 冰霜微粒生成
      if (this.temperature > 1.05 && Math.random() < (this.temperature - 0.9) * 0.55) {
        this.sparks.push({
          x: marginX + Math.random() * usableW,
          y: gateY - 8,
          vx: (Math.random() - 0.5) * 35,
          vy: -60 - Math.random() * 90 * (this.temperature * 0.6),
          life: 1,
          decay: 0.9 + Math.random() * 0.8,
          size: 2 + Math.random() * 2.5,
          kind: "fire"
        });
      } else if (this.temperature < 0.65 && Math.random() < 0.35) {
        this.sparks.push({
          x: marginX + Math.random() * usableW,
          y: 100 + Math.random() * 280,
          vx: (Math.random() - 0.5) * 10,
          vy: 12 + Math.random() * 18,
          life: 1,
          decay: 0.7 + Math.random() * 0.5,
          size: 2 + Math.random() * 2,
          kind: "ice"
        });
      }

      // 更新粒子
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const sp = this.sparks[i];
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.life -= sp.decay * dt;
        if (sp.life <= 0) this.sparks.splice(i, 1);
      }

      // 更新弹珠物理碰撞
      const gravity = 640;
      const thermalTurbulence = Math.max(0, this.temperature - 0.4) * 165;
      const gateEdgeX = marginX + this.gateProgress * binW;

      for (let i = this.marbles.length - 1; i >= 0; i--) {
        const m = this.marbles[i];
        if (m.delay > 0) {
          m.delay -= dt;
          continue;
        }

        // 记录短尾迹
        m.trail.push({ x: m.x, y: m.y });
        if (m.trail.length > 7) m.trail.shift();

        // 目标槽中心横坐标
        const targetX = marginX + (m.targetBin + 0.5) * binW;
        // 随着接近槽口，施加温和导流力，使大数定律自然收敛至 Softmax 概率曲线
        const progressY = Math.max(0, Math.min(1, (m.y - 95) / (gateY - 95)));
        const steerStrength = 1.6 + progressY * 7.2;
        const steerAx = (targetX - m.x) * steerStrength;

        // 温度越高，上升热对流随机横向颤动越强烈
        const noiseAx = (Math.random() - 0.5) * thermalTurbulence * (1 - progressY * 0.55);

        m.vx += (steerAx + noiseAx) * dt;
        m.vy += gravity * dt;

        // 空气阻尼
        m.vx *= Math.pow(0.45, dt);
        m.vy = Math.min(m.vy, 520);

        m.x += m.vx * dt;
        m.y += m.vy * dt;

        // 漏斗与左右侧黄铜壁面约束
        const leftWall = marginX + m.r + 2;
        const rightWall = this.width - marginX - m.r - 2;
        if (m.x < leftWall) {
          m.x = leftWall;
          m.vx = Math.abs(m.vx) * 0.65;
        } else if (m.x > rightWall) {
          m.x = rightWall;
          m.vx = -Math.abs(m.vx) * 0.65;
        }

        // 与黄铜柱钉进行真实圆形弹性碰撞
        if (m.y > 105 && m.y < gateY) {
          for (let p = 0; p < this.pegs.length; p++) {
            const peg = this.pegs[p];
            const dx = m.x - peg.x;
            const dy = m.y - peg.y;
            const minDist = m.r + peg.r;
            const distSq = dx * dx + dy * dy;
            if (distSq < minDist * minDist && distSq > 0.0001) {
              const dist = Math.sqrt(distSq);
              const nx = dx / dist;
              const ny = dy / dist;
              // 位置修正防穿透
              const overlap = minDist - dist;
              m.x += nx * overlap;
              m.y += ny * overlap;

              // 弹性反射（保留约 0.52 恢复系数）
              const vn = m.vx * nx + m.vy * ny;
              if (vn < 0) {
                const restitution = 0.48 + Math.min(0.25, this.temperature * 0.08);
                m.vx -= (1 + restitution) * vn * nx;
                m.vy -= (1 + restitution) * vn * ny;
                // 微小水平防卡死随机偏转
                m.vx += (Math.random() - 0.5) * (28 + this.temperature * 35);
                peg.hitGlow = 1;

                // 撞击火星（高温更明显）
                if (this.sparks.length < 180) {
                  this.sparks.push({
                    x: peg.x + nx * peg.r,
                    y: peg.y + ny * peg.r,
                    vx: nx * 55 + (Math.random() - 0.5) * 40,
                    vy: ny * 55 - 20,
                    life: 1,
                    decay: 3.2,
                    size: 1.8,
                    kind: this.temperature < 0.6 ? "ice" : "hit"
                  });
                }
              }
            }
          }
        }

        // Top-K 机械闸门物理防进入碰撞（如果某个弹珠由于剧烈噪音误撞右侧封锁门）
        if (m.y + m.r >= gateY - 4 && m.y < gateY + 12 && m.x > gateEdgeX - 2) {
          m.y = gateY - 4 - m.r;
          m.vy = -Math.abs(m.vy) * 0.55;
          m.vx -= 120; // 被斜板推回左侧开放区
        }

        // 槽内隔板碰撞（进入 binTopY 后约束在所属槽内垂直下落）
        if (m.y >= binTopY) {
          const curBin = Math.min(this.topK - 1, Math.max(0, Math.floor((m.x - marginX) / binW)));
          const binLeft = marginX + curBin * binW + m.r + 3;
          const binRight = marginX + (curBin + 1) * binW - m.r - 3;
          if (m.x < binLeft) {
            m.x = binLeft;
            m.vx = Math.abs(m.vx) * 0.4;
          } else if (m.x > binRight) {
            m.x = binRight;
            m.vx = -Math.abs(m.vx) * 0.4;
          }
        }

        // 到达槽底统计计数
        if (m.y >= binBottomY - 6) {
          let finalBin = Math.floor((m.x - marginX) / binW);
          finalBin = Math.min(this.topK - 1, Math.max(0, finalBin));
          this.counts[finalBin] += 1;
          this.totalDropped += 1;
          this.lastLandedBin = finalBin;

          const wasGolden = m.isGoldenSampler;
          this.marbles.splice(i, 1);
          this.renderTelemetryOnly();

          if (wasGolden) {
            this.commitTokenSelection(finalBin, "modeA.sourceMarbleSample");
          }
        }
      }
    },

    drawScene() {
      const ctx = this.ctx;
      const W = this.width;
      const H = this.height;
      const { marginX, usableW, binW, gateY, binTopY, binBottomY } = this.getLayoutMetrics();

      ctx.save();
      ctx.scale(this.dpr, this.dpr);
      ctx.clearRect(0, 0, W, H);

      // 1. 温度氛围背景光晕（低温冰霜蓝 / 高温炉火红）
      const tempGlow = ctx.createRadialGradient(W * 0.5, gateY * 0.7, 20, W * 0.5, gateY * 0.7, W * 0.62);
      if (this.temperature < 0.65) {
        const strength = (0.65 - this.temperature) * 0.35;
        tempGlow.addColorStop(0, `rgba(56, 189, 248, ${strength})`);
        tempGlow.addColorStop(1, "rgba(10, 17, 26, 0)");
      } else if (this.temperature > 1.1) {
        const strength = Math.min(0.28, (this.temperature - 1.1) * 0.22);
        tempGlow.addColorStop(0, `rgba(239, 68, 68, ${strength})`);
        tempGlow.addColorStop(1, "rgba(10, 17, 26, 0)");
      } else {
        tempGlow.addColorStop(0, "rgba(211, 159, 66, 0.08)");
        tempGlow.addColorStop(1, "rgba(10, 17, 26, 0)");
      }
      ctx.fillStyle = tempGlow;
      ctx.fillRect(0, 0, W, H);

      // 2. 工业蓝图底格线
      ctx.strokeStyle = "rgba(72, 219, 232, 0.06)";
      ctx.lineWidth = 1;
      for (let gx = marginX; gx <= W - marginX; gx += binW) {
        ctx.beginPath();
        ctx.moveTo(gx, 80);
        ctx.lineTo(gx, binBottomY);
        ctx.stroke();
      }

      // 3. 顶部左右咬合黄铜齿轮组 + 进料漏斗 + 蓝图图例
      this.drawGear(ctx, W * 0.5 - 88, 42, 28, 12, this.gearAngle, "#b98329", "#f4d078");
      this.drawGear(ctx, W * 0.5 - 44, 42, 18, 8, -this.gearAngle * 1.5 + 0.28, "#936218", "#d39f42");
      this.drawGear(ctx, W * 0.5 + 88, 42, 28, 12, -this.gearAngle, "#b98329", "#f4d078");
      this.drawGear(ctx, W * 0.5 + 44, 42, 18, 8, this.gearAngle * 1.5 + 0.12, "#936218", "#d39f42");

      const leftSpaceW = W * 0.5 - 122 - marginX;
      if (leftSpaceW >= 100) {
        ctx.save();
        ctx.textAlign = "left";
        // 理论曲线图例
        ctx.strokeStyle = "#f4d078";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(marginX, 27);
        ctx.lineTo(marginX + 16, 27);
        ctx.stroke();
        ctx.fillStyle = "#f4d078";
        ctx.beginPath();
        ctx.arc(marginX + 8, 27, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#cbd5e1";
        this.drawFittedText(ctx, this.t("modeA.legendTheory"), marginX + 22, 31, leftSpaceW - 24, 10.5, 8.5, "", CANVAS_FONT_SANS);

        // 实测直方图图例
        const histGrad = ctx.createLinearGradient(marginX, 41, marginX + 16, 51);
        histGrad.addColorStop(0, "rgba(72, 219, 232, 0.9)");
        histGrad.addColorStop(1, "rgba(211, 159, 66, 0.7)");
        ctx.fillStyle = histGrad;
        ctx.fillRect(marginX + 2, 41, 12, 9);
        ctx.fillStyle = "#94a3b8";
        this.drawFittedText(ctx, this.t("modeA.legendHistogram"), marginX + 22, 49, leftSpaceW - 24, 10.5, 8.5, "", CANVAS_FONT_SANS);
        ctx.restore();
      }

      // 漏斗本体
      ctx.fillStyle = "#1b283a";
      ctx.strokeStyle = "#d39f42";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W * 0.5 - 32, 14);
      ctx.lineTo(W * 0.5 + 32, 14);
      ctx.lineTo(W * 0.5 + 14, 68);
      ctx.lineTo(W * 0.5 - 14, 68);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 温度指示条徽章
      ctx.fillStyle = this.temperature < 0.65 ? "#7dd3fc" : this.temperature > 1.25 ? "#fca5a5" : "#f4d078";
      ctx.textAlign = "center";
      const modeStateLabel =
        this.temperature < 0.65
          ? this.t("modeA.tempStateFrost")
          : this.temperature > 1.25
          ? this.t("modeA.tempStateFurnace")
          : this.t("modeA.tempStateBalanced");
      this.drawFittedText(
        ctx,
        this.t("modeA.tempBadge", this.temperature.toFixed(2), modeStateLabel),
        W * 0.5,
        86,
        usableW,
        11,
        9,
        "bold",
        CANVAS_FONT_MONO
      );

      // 4. 机器外框挡板
      ctx.strokeStyle = "rgba(211, 159, 66, 0.55)";
      ctx.lineWidth = 3;
      ctx.strokeRect(marginX - 4, 96, usableW + 8, binBottomY - 92);

      // 5. 炉火 / 冰霜气流粒子层
      for (let i = 0; i < this.sparks.length; i++) {
        const sp = this.sparks[i];
        ctx.globalAlpha = Math.max(0, sp.life * 0.85);
        if (sp.kind === "fire") {
          ctx.fillStyle = sp.life > 0.5 ? "#fb923c" : "#ef4444";
        } else if (sp.kind === "ice") {
          ctx.fillStyle = "#7dd3fc";
        } else {
          ctx.fillStyle = "#fde68a";
        }
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 6. 黄铜物理柱钉阵
      for (let i = 0; i < this.pegs.length; i++) {
        const p = this.pegs[i];
        if (p.hitGlow > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 6 * p.hitGlow, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(72, 219, 232, ${p.hitGlow * 0.45})`;
          ctx.fill();
        }
        const grad = ctx.createRadialGradient(p.x - 1.5, p.y - 1.5, 1, p.x, p.y, p.r);
        grad.addColorStop(0, "#fff2c6");
        grad.addColorStop(0.55, "#d39f42");
        grad.addColorStop(1, "#5c3f0e");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. 底部 8 个透明收集槽 + 实测直方图 + 理论 Softmax 曲线
      const maxBarH = binBottomY - binTopY - 8;
      const total = Math.max(1, this.totalDropped);
      const curvePoints = [];

      for (let b = 0; b < 8; b++) {
        const bx = marginX + b * binW;
        const cand = this.computedProbs[b];
        const locked = cand && cand.locked;
        const empRatio = this.totalDropped > 0 ? this.counts[b] / total : 0;
        const barH = empRatio * maxBarH;

        // 槽背景
        ctx.fillStyle = locked
          ? "rgba(5, 8, 12, 0.72)"
          : b === this.lastLandedBin
          ? "rgba(72, 219, 232, 0.12)"
          : "rgba(15, 25, 38, 0.55)";
        ctx.fillRect(bx + 2, binTopY, binW - 4, binBottomY - binTopY);

        // 实测落入柱状图（黄铜/青色或幻觉红色）
        if (barH > 1) {
          const isRisk = cand && cand.risk >= 2;
          const barGrad = ctx.createLinearGradient(0, binBottomY - barH, 0, binBottomY);
          if (isRisk) {
            barGrad.addColorStop(0, "rgba(239, 68, 68, 0.85)");
            barGrad.addColorStop(1, "rgba(127, 29, 29, 0.75)");
          } else {
            barGrad.addColorStop(0, "rgba(72, 219, 232, 0.85)");
            barGrad.addColorStop(1, "rgba(211, 159, 66, 0.55)");
          }
          ctx.fillStyle = barGrad;
          ctx.fillRect(bx + 6, binBottomY - barH, binW - 12, barH);
        }

        // 槽内计数数字
        if (this.counts[b] > 0) {
          ctx.fillStyle = "#e2e8f0";
          ctx.font = `bold 11px ${CANVAS_FONT_MONO}`;
          ctx.textAlign = "center";
          ctx.fillText(String(this.counts[b]), bx + binW * 0.5, binBottomY - 6);
        }

        // 收集槽分隔线
        ctx.strokeStyle = "rgba(211, 159, 66, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, binTopY);
        ctx.lineTo(bx, binBottomY);
        ctx.stroke();

        // 收集理论 Softmax 曲线点
        const theoP = cand ? cand.effectiveProb : 0;
        const theoY = binBottomY - theoP * maxBarH;
        curvePoints.push({ x: bx + binW * 0.5, y: theoY, locked, p: theoP });

        // 底部候选词铭牌
        const labelY = binBottomY + 18;
        ctx.fillStyle = locked ? "#475569" : cand && cand.risk >= 2 ? "#fca5a5" : "#f4d078";
        ctx.textAlign = "center";
        this.drawFittedText(
          ctx,
          cand ? cand.word : "",
          bx + binW * 0.5,
          labelY,
          binW - 8,
          12,
          9.2,
          "bold",
          CANVAS_FONT_SANS
        );

        ctx.fillStyle = locked ? "#475569" : "#94a3b8";
        this.drawFittedText(
          ctx,
          locked ? this.t("modeA.binLocked") : `${(theoP * 100).toFixed(1)}%`,
          bx + binW * 0.5,
          labelY + 16,
          binW - 6,
          11,
          8.5,
          "",
          CANVAS_FONT_MONO
        );

        if (cand && cand.risk >= 2 && !locked) {
          ctx.fillStyle = "#ef4444";
          this.drawFittedText(
            ctx,
            this.t("modeA.binHallucinationTag"),
            bx + binW * 0.5,
            labelY + 31,
            binW - 6,
            10,
            8.2,
            "",
            CANVAS_FONT_SANS
          );
        } else if (!locked) {
          ctx.fillStyle = "rgba(72, 219, 232, 0.65)";
          this.drawFittedText(
            ctx,
            this.t("modeA.binClickChainTag"),
            bx + binW * 0.5,
            labelY + 31,
            binW - 6,
            10,
            8.2,
            "",
            CANVAS_FONT_SANS
          );
        }
      }

      // 8. 绘制理论 Softmax 发光折线
      ctx.save();
      ctx.strokeStyle = "#f4d078";
      ctx.lineWidth = 2.4;
      ctx.shadowColor = "rgba(244, 208, 120, 0.6)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let i = 0; i < curvePoints.length; i++) {
        const pt = curvePoints[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      for (let i = 0; i < curvePoints.length; i++) {
        const pt = curvePoints[i];
        ctx.fillStyle = pt.locked ? "#475569" : "#f4d078";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 9. Top-K 机械滑轨闸门动画（覆盖在第 K+1 到 第 8 个槽位上方）
      const gateLeftX = marginX + this.gateProgress * binW;
      const gateRightX = marginX + usableW;
      if (gateRightX - gateLeftX > 4) {
        ctx.save();
        ctx.fillStyle = "rgba(180, 120, 35, 0.88)";
        ctx.strokeStyle = "#f4d078";
        ctx.lineWidth = 2;
        ctx.fillRect(gateLeftX, gateY - 6, gateRightX - gateLeftX, 14);
        ctx.strokeRect(gateLeftX, gateY - 6, gateRightX - gateLeftX, 14);

        // 工业斜纹警戒线
        ctx.beginPath();
        ctx.rect(gateLeftX, gateY - 6, gateRightX - gateLeftX, 14);
        ctx.clip();
        ctx.strokeStyle = "rgba(15, 23, 42, 0.65)";
        ctx.lineWidth = 4;
        for (let sx = gateLeftX - 16; sx < gateRightX + 16; sx += 14) {
          ctx.beginPath();
          ctx.moveTo(sx, gateY - 8);
          ctx.lineTo(sx + 10, gateY + 10);
          ctx.stroke();
        }
        ctx.restore();

        // 机械把手与锁止文字
        ctx.fillStyle = "#f4d078";
        ctx.beginPath();
        ctx.arc(gateLeftX, gateY + 1, 7, 0, Math.PI * 2);
        ctx.fill();
        const gateW = gateRightX - gateLeftX;
        if (gateW > 65) {
          ctx.fillStyle = "#fef3c7";
          ctx.textAlign = "center";
          this.drawFittedText(
            ctx,
            this.t("modeA.gateLockedCanvas", this.topK),
            (gateLeftX + gateRightX) * 0.5,
            gateY - 11,
            gateW - 10,
            10,
            8.2,
            "bold",
            CANVAS_FONT_MONO
          );
        }
      }

      // 10. 飞行中的弹珠及其尾迹
      for (let i = 0; i < this.marbles.length; i++) {
        const m = this.marbles[i];
        if (m.delay > 0) continue;

        if (m.trail.length > 1) {
          for (let t = 0; t < m.trail.length; t++) {
            const pt = m.trail[t];
            ctx.globalAlpha = ((t + 1) / m.trail.length) * 0.35;
            ctx.fillStyle = m.isGoldenSampler ? "#f4d078" : this.temperature < 0.65 ? "#7dd3fc" : "#48dbe8";
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, m.r * 0.65, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }

        const ballGrad = ctx.createRadialGradient(m.x - 2, m.y - 2, 1, m.x, m.y, m.r);
        if (m.isGoldenSampler) {
          ballGrad.addColorStop(0, "#ffffff");
          ballGrad.addColorStop(0.45, "#fde047");
          ballGrad.addColorStop(1, "#b45309");
        } else if (this.temperature < 0.65) {
          ballGrad.addColorStop(0, "#ffffff");
          ballGrad.addColorStop(0.5, "#7dd3fc");
          ballGrad.addColorStop(1, "#0284c7");
        } else if (this.temperature > 1.25) {
          ballGrad.addColorStop(0, "#fef08a");
          ballGrad.addColorStop(0.5, "#fb923c");
          ballGrad.addColorStop(1, "#dc2626");
        } else {
          ballGrad.addColorStop(0, "#ecfeff");
          ballGrad.addColorStop(0.5, "#48dbe8");
          ballGrad.addColorStop(1, "#0e7490");
        }
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    },

    drawGear(ctx, cx, cy, r, teeth, angle, fill, stroke) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.6;

      ctx.beginPath();
      const outerR = r + 5;
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
      ctx.arc(0, 0, r * 0.36, 0, Math.PI * 2);
      ctx.fillStyle = "#0b111a";
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    },

    renderAllUI() {
      this.renderContextScroll();
      this.renderTelemetryOnly();
    },

    onLangChange() {
      if (!this.initialized) return;
      const sc = this.getScenario();
      if (this.historyTokens.length > 0 && sc && Array.isArray(sc.rounds)) {
        this.historyTokens = this.historyTokens.map((tok, i) => {
          const rIdx = typeof tok.roundIdx === "number" ? tok.roundIdx : i;
          const round = sc.rounds[rIdx];
          if (!round) return tok;
          const cand =
            typeof tok.binIndex === "number" && round.candidates[tok.binIndex]
              ? round.candidates[tok.binIndex]
              : null;
          return {
            ...tok,
            prefix: round.promptPrefix,
            word: cand ? cand.word : tok.word,
            risk: cand ? cand.risk : tok.risk
          };
        });
      }
      this.renderScenarioPills();
      this.recomputeDistribution();
      this.renderAllUI();
      const modeAEl = document.getElementById("mode-a-view");
      if (modeAEl && modeAEl.classList.contains("active")) {
        this.drawScene();
      }
    },

    renderContextScroll() {
      const box = document.getElementById("mode-a-context-scroll");
      if (!box) return;
      const sc = this.getScenario();
      const round = this.getCurrentRound();

      const progressStr = this.finished
        ? this.t("modeA.roundDone3")
        : this.t("modeA.roundCurrent", this.roundIndex + 1);

      let html = `<div class="context-round-meta"><span>${this.escapeHtml(
        this.t("modeA.currentScenarioLabel")
      )} <b>${this.escapeHtml(sc.title)}</b></span><span>${this.escapeHtml(
        this.t("modeA.chainProgressLabel")
      )} ${this.escapeHtml(progressStr)}</span></div>`;

      let sentenceHtml = "";
      for (let i = 0; i < this.historyTokens.length; i++) {
        const tok = this.historyTokens[i];
        const riskCls = tok.risk >= 2 ? " risk" : "";
        const tooltip = this.t("modeA.tokenTooltip", (tok.prob * 100).toFixed(1), tok.temp);
        sentenceHtml += `<span>${this.escapeHtml(tok.prefix)}</span><span class="token-generated${riskCls}" title="${this.escapeHtml(
          tooltip
        )}">${this.escapeHtml(tok.word)}</span>`;
      }

      if (!this.finished) {
        sentenceHtml += `<span>${this.escapeHtml(round.promptPrefix)}</span><span class="token-cursor">${this.escapeHtml(
          this.t("modeA.pendingToken")
        )}</span>`;
      }

      html += `<div>${sentenceHtml}</div>`;
      html += `<div style="margin-top:7px;font-size:11.5px;color:#9bb0c7;">💡 ${this.escapeHtml(
        this.finished ? this.t("modeA.finishedHint") : round.hint
      )}</div>`;

      box.innerHTML = html;

      const btnSample = document.getElementById("btn-sample-next");
      if (btnSample) {
        btnSample.textContent = this.finished
          ? this.t("modeA.btnReplay")
          : this.t("modeA.btnSampleNext");
      }
    },

    renderTelemetryOnly() {
      // 更新数值徽章
      const tempVal = document.getElementById("temp-value");
      const topkVal = document.getElementById("topk-value");
      const statsLabel = document.getElementById("galton-stats-label");
      if (tempVal) tempVal.textContent = this.temperature.toFixed(2);
      if (topkVal) topkVal.textContent = this.t("modeA.topkBadge", this.topK);
      if (statsLabel) {
        statsLabel.textContent = this.t(
          "modeA.statsLabel",
          this.totalDropped,
          this.entropy.toFixed(2)
        );
      }

      // 更新 AI 幻觉警告灯
      this.updateHallucinationLamp();

      // 更新 Softmax 概率明细表
      const tableWrap = document.getElementById("prob-table-wrap");
      if (!tableWrap) return;

      const total = Math.max(1, this.totalDropped);
      let rowsHtml = "";
      for (let i = 0; i < this.computedProbs.length; i++) {
        const item = this.computedProbs[i];
        const empPct = this.totalDropped > 0 ? ((this.counts[i] / total) * 100).toFixed(1) : "0.0";
        const theoPct = (item.effectiveProb * 100).toFixed(1);
        const riskTag =
          item.risk >= 2
            ? `<span class="risk-tag">${this.escapeHtml(this.t("modeA.riskHallucination"))}</span>`
            : item.risk === 1
            ? `<span class="risk-tag" style="background:rgba(245,158,11,0.2);color:#fde68a;border-color:rgba(245,158,11,0.45);">${this.escapeHtml(
                this.t("modeA.riskDrift")
              )}</span>`
            : "";

        rowsHtml += `
          <div class="prob-row${item.locked ? " locked" : ""}" title="${this.escapeHtml(item.note)}">
            <span class="prob-rank">${i + 1}</span>
            <div class="prob-word-cell">
              <div class="prob-word-line">${this.escapeHtml(item.word)} ${riskTag}</div>
              <div class="prob-bar-bg"><div class="prob-bar-fill" style="width:${theoPct}%"></div></div>
            </div>
            <span class="prob-mono">${item.logit.toFixed(1)}</span>
            <span class="prob-mono" style="color:#f4d078;">${
              item.locked ? this.escapeHtml(this.t("modeA.tableLocked")) : theoPct + "%"
            }</span>
            <button type="button" class="btn btn-sm" data-pick-bin="${i}" ${item.locked || this.finished ? "disabled" : ""}>
              ${this.totalDropped > 0 && !item.locked ? empPct + "%" : this.escapeHtml(this.t("modeA.btnChain"))}
            </button>
          </div>
        `;
      }
      tableWrap.innerHTML = rowsHtml;

      tableWrap.querySelectorAll("button[data-pick-bin]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.pickBin, 10);
          this.commitTokenSelection(idx, "modeA.sourceTablePick");
        });
      });
    },

    updateHallucinationLamp() {
      const lamp = document.getElementById("hallucination-lamp");
      const titleEl = document.getElementById("hallucination-title");
      const descEl = document.getElementById("hallucination-desc");
      if (!lamp || !titleEl || !descEl) return;

      const hasDangerToken = this.historyTokens.some((t) => t.risk >= 2);
      const hasWarnToken = this.historyTokens.some((t) => t.risk === 1);
      const tailProb = this.computedProbs
        .filter((c) => c.risk >= 2 && !c.locked)
        .reduce((sum, c) => sum + c.effectiveProb, 0);

      lamp.classList.remove("warn", "danger");

      if (hasDangerToken) {
        lamp.classList.add("danger");
        titleEl.textContent = this.t("modeA.lampTriggeredTitle");
        descEl.textContent = this.t("modeA.lampTriggeredDesc");
      } else if (tailProb > 0.14 || (this.temperature >= 1.5 && this.topK >= 5)) {
        lamp.classList.add("danger");
        titleEl.textContent = this.t("modeA.lampHighRiskTitle");
        descEl.textContent = this.t("modeA.lampHighRiskDesc", (tailProb * 100).toFixed(1));
      } else if (hasWarnToken || this.temperature >= 1.05 || this.entropy >= 1.75) {
        lamp.classList.add("warn");
        titleEl.textContent = this.t("modeA.lampWarnTitle");
        descEl.textContent = this.t("modeA.lampWarnDesc", this.entropy.toFixed(2));
      } else {
        titleEl.textContent = this.t("modeA.lampSafeTitle");
        descEl.textContent = this.t("modeA.lampSafeDesc");
      }
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
    module.exports = ModeAGalton;
  }
  if (root) {
    root.ModeAGalton = ModeAGalton;
  }
})(typeof window !== "undefined" ? window : globalThis);
