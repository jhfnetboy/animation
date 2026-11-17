import {Circle, Grid, Layout, Line, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  PlopSpring,
  SmoothSpring,
  all,
  beginSlide,
  createRef,
  createSignal,
  easeInOutCubic,
  spring,
  waitFor,
} from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  view.fill('#0B0F19');

  const phaseText = createSignal('Step 1 · 接收任务，中枢大脑启动 ReAct 规划循环');
  const statusLog = createSignal('指令：“帮我规划周六带爷爷去公园的方案，要防晒且看天气”');

  const coreBrain = createRef<Circle>();
  const gearRing = createRef<Circle>();
  const alertBadge = createRef<Rect>();
  const resultCard = createRef<Rect>();

  const weatherNode = createRef<Rect>();
  const ragNode = createRef<Rect>();
  const mapNode = createRef<Rect>();
  const reflectNode = createRef<Rect>();

  const lineWeather = createRef<Line>();
  const lineReflect = createRef<Line>();
  const lineRag = createRef<Line>();
  const lineMap = createRef<Line>();
  const lineOut = createRef<Line>();

  view.add(
    <>
      <Grid width={1920} height={1080} spacing={60} stroke={'#1E293B'} lineWidth={1} opacity={0.45} />

      {/* 顶部标题与状态条 */}
      <Layout y={-440} layout direction={'column'} alignItems={'center'} gap={10}>
        <Txt
          text={'第 3 课 · AI Agent 钢铁侠战甲：感知-规划-记忆-工具闭环'}
          fill={'#F8FAFC'}
          fontSize={40}
          fontWeight={700}
          fontFamily={'PingFang SC, Microsoft YaHei, sans-serif'}
        />
        <Rect fill={'#1E293B'} stroke={'#38BDF8'} lineWidth={1.5} radius={20} padding={[8, 26]}>
          <Txt text={() => phaseText()} fill={'#38BDF8'} fontSize={22} fontWeight={600} />
        </Rect>
      </Layout>

      {/* 用户指令栏 */}
      <Rect y={-325} width={1180} height={72} radius={16} fill={'#0F172A'} stroke={'#475569'} lineWidth={2}>
        <Txt text={() => statusLog()} fill={'#E2E8F0'} fontSize={24} fontWeight={600} />
      </Rect>

      {/* 连接线（大脑到各战甲组件） */}
      <Line ref={lineWeather} points={[[-120, -20], [-460, -140]]} stroke={'#38BDF8'} lineWidth={5} endArrow arrowSize={14} end={0} />
      <Line ref={lineReflect} points={[[-460, -60], [-140, 20]]} stroke={'#F97316'} lineWidth={5} lineDash={[10, 8]} endArrow arrowSize={14} end={0} />
      <Line ref={lineRag} points={[[120, -20], [460, -140]]} stroke={'#A78BFA'} lineWidth={5} endArrow arrowSize={14} end={0} />
      <Line ref={lineMap} points={[[120, 60], [460, 170]]} stroke={'#34D399'} lineWidth={5} endArrow arrowSize={14} end={0} />
      <Line ref={lineOut} points={[[0, 130], [0, 250]]} stroke={'#FBBF24'} lineWidth={6} endArrow arrowSize={16} end={0} />

      {/* 中枢大脑：ReAct 战甲核心 */}
      <Circle
        ref={gearRing}
        y={20}
        size={250}
        stroke={'#38BDF8'}
        lineWidth={4}
        lineDash={[22, 14]}
        opacity={0.85}
      />
      <Circle
        ref={coreBrain}
        y={20}
        size={190}
        fill={'#0F172A'}
        stroke={'#38BDF8'}
        lineWidth={5}
        shadowColor={'#38BDF8'}
        shadowBlur={30}
      >
        <Txt text={'LLM 核心大脑'} y={-16} fill={'#F8FAFC'} fontSize={26} fontWeight={700} />
        <Txt text={'ReAct 规划引擎'} y={20} fill={'#38BDF8'} fontSize={18} fontWeight={600} />
      </Circle>

      {/* 外设 1：天气 API 机械臂 */}
      <Rect
        ref={weatherNode}
        x={-590}
        y={-140}
        width={330}
        height={130}
        radius={18}
        fill={'#0F172A'}
        stroke={'#38BDF8'}
        lineWidth={3}
        opacity={0.45}
      >
        <Txt text={'[工具] 天气 API 机械臂'} y={-26} fill={'#38BDF8'} fontSize={24} fontWeight={700} />
        <Txt text={'周六下午：雷阵雨 ⛈️ 29℃'} y={20} fill={'#CBD5E1'} fontSize={20} />
      </Rect>

      {/* 外设 2：反思 Correction 警报 */}
      <Rect
        ref={reflectNode}
        x={-590}
        y={165}
        width={330}
        height={130}
        radius={18}
        fill={'#2A1215'}
        stroke={'#F97316'}
        lineWidth={3}
        opacity={0.35}
      >
        <Txt text={'[反思] Correction 警报'} y={-26} fill={'#FB923C'} fontSize={24} fontWeight={700} />
        <Txt text={'原室外公园受阻 -> 切换室内'} y={20} fill={'#FED7AA'} fontSize={20} />
      </Rect>

      {/* 外设 3：RAG 记忆图书馆 */}
      <Rect
        ref={ragNode}
        x={590}
        y={-140}
        width={330}
        height={130}
        radius={18}
        fill={'#0F172A'}
        stroke={'#A78BFA'}
        lineWidth={3}
        opacity={0.45}
      >
        <Txt text={'[记忆] RAG 记忆图书馆'} y={-26} fill={'#A78BFA'} fontSize={24} fontWeight={700} />
        <Txt text={'爷爷：膝盖怕潮 · 喜欢下棋'} y={20} fill={'#E2E8F0'} fontSize={20} />
      </Rect>

      {/* 外设 4：地图导航工具 */}
      <Rect
        ref={mapNode}
        x={590}
        y={165}
        width={330}
        height={130}
        radius={18}
        fill={'#0F172A'}
        stroke={'#34D399'}
        lineWidth={3}
        opacity={0.45}
      >
        <Txt text={'[工具] 地图无障碍导航'} y={-26} fill={'#34D399'} fontSize={24} fontWeight={700} />
        <Txt text={'推荐：园博古风茶馆（直达电梯）'} y={20} fill={'#D1FAE5'} fontSize={20} />
      </Rect>

      {/* 反思警报悬浮标识 */}
      <Rect
        ref={alertBadge}
        y={-130}
        width={420}
        height={54}
        radius={14}
        fill={'#7C2D12'}
        stroke={'#F97316'}
        lineWidth={2}
        scale={0}
      >
        <Txt text={'⚠️ 触发反思：室外淋雨风险！重规划中...'} fill={'#FFEDD5'} fontSize={22} fontWeight={700} />
      </Rect>

      {/* 最终行动方案输出卡 */}
      <Rect
        ref={resultCard}
        y={355}
        width={1180}
        height={145}
        radius={20}
        fill={'#064E3B'}
        stroke={'#34D399'}
        lineWidth={3}
        opacity={0}
      >
        <Txt text={'✅ Agent 最终方案：周六上午晴朗逛园防晒 + 下午雷雨转入茶馆下棋（无障碍直梯）'} y={-24} fill={'#ECFDF5'} fontSize={26} fontWeight={700} />
        <Txt text={'闭环完成：Think → Tool(Weather) → Reflect → Memory(RAG) → Tool(Map) → Answer'} y={26} fill={'#6EE7B7'} fontSize={20} fontWeight={600} />
      </Rect>
    </>,
  );

  // ========== Phase 1: 调用天气 API 机械臂 ==========
  yield* all(
    gearRing().rotation(120, 1.0, easeInOutCubic),
    lineWeather().end(1, 0.7, easeInOutCubic),
    weatherNode().opacity(1, 0.5),
    spring(PlopSpring, 1, 1.06, v => weatherNode().scale(v)),
  );
  yield* weatherNode().scale(1, 0.3);
  yield* beginSlide('Step1-天气API检测雷阵雨');

  // ========== Phase 2: 触发反思 Correction 警报 ==========
  phaseText('Step 2 · 检测到周六下午雷阵雨 -> 触发 Correction 反思纠偏');
  statusLog('反思中：原定“全天公园防晒游”遇到暴雨冲突，主动放弃旧路线！');
  yield* all(
    gearRing().rotation(240, 0.9, easeInOutCubic),
    lineReflect().end(1, 0.6),
    reflectNode().opacity(1, 0.4),
    spring(SmoothSpring, 0, 1, v => alertBadge().scale(v)),
  );
  yield* beginSlide('Step2-触发反思纠偏');

  // ========== Phase 3: 检索 RAG 记忆图书馆 ==========
  phaseText('Step 3 · 检索 RAG 长期记忆图书馆 -> 匹配长辈偏好与身体情况');
  statusLog('记忆命中：爷爷膝盖怕潮湿 + 喜欢安静下象棋 -> 寻找干燥室内茶社');
  yield* all(
    alertBadge().scale(0, 0.3),
    gearRing().rotation(360, 0.9, easeInOutCubic),
    lineRag().end(1, 0.6, easeInOutCubic),
    ragNode().opacity(1, 0.5),
    spring(PlopSpring, 1, 1.06, v => ragNode().scale(v)),
  );
  yield* ragNode().scale(1, 0.3);
  yield* beginSlide('Step3-RAG记忆检索');

  // ========== Phase 4: 地图工具 + 输出完美闭环方案 ==========
  phaseText('Step 4 · 调用地图工具核验无障碍设施 -> 输出最终可靠方案');
  statusLog('行动完成：结合天气、健康与爱好，生成动静结合避雨防晒方案！');
  yield* all(
    gearRing().rotation(480, 1.0, easeInOutCubic),
    lineMap().end(1, 0.6, easeInOutCubic),
    mapNode().opacity(1, 0.5),
    lineOut().end(1, 0.7, easeInOutCubic),
    resultCard().opacity(1, 0.7),
  );
  yield* waitFor(0.8);
  yield* beginSlide('Step4-闭环方案生成');
});
