import {Circle, Grid, Layout, Line, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  PlopSpring,
  SmoothSpring,
  all,
  beginSlide,
  createRef,
  createSignal,
  easeInOutCubic,
  easeOutBack,
  sequence,
  spring,
  tween,
  waitFor,
} from '@motion-canvas/core';

/** 单个 Token 积木数据结构 */
interface TokenItem {
  text: string;
  id: string;
  color: string;
  targetX: number;
}

/** 语义维度数据 */
interface DimensionBar {
  label: string;
  kingValue: number;
  queenValue: number;
  aiValue: number;
  color: string;
}

export default makeScene2D(function* (view) {
  // 舞台底色与全局科技网格
  view.fill('#0B0F19');

  const gridRef = createRef<Grid>();
  const titleGroup = createRef<Layout>();
  const stageStepLabel = createSignal('Step 1 · Tokenizer 激光切割机');

  // Step 1 相关引用
  const step1Layer = createRef<Layout>();
  const rawSentenceBox = createRef<Rect>();
  const cutterFrame = createRef<Rect>();
  const laserLine = createRef<Line>();
  const tokenRefs = [
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
  ];

  // Step 2 相关引用
  const step2Layer = createRef<Layout>();
  const barRefs = [
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
  ];
  const barQueenRefs = [
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
  ];

  // Step 3 相关引用
  const step3Layer = createRef<Layout>();
  const vecKing = createRef<Line>();
  const vecMinusMan = createRef<Line>();
  const vecPlusWoman = createRef<Line>();
  const queenTarget = createRef<Circle>();
  const formulaBadge = createRef<Rect>();

  const tokens: TokenItem[] = [
    {text: 'AI', id: '#2048', color: '#38BDF8', targetX: -390},
    {text: '改变', id: '#4102', color: '#818CF8', targetX: -130},
    {text: '未来', id: '#7891', color: '#34D399', targetX: 130},
    {text: '的世界', id: '#5310', color: '#F472B6', targetX: 390},
  ];

  const dimensions: DimensionBar[] = [
    {label: '科技感', kingValue: 0.12, queenValue: 0.14, aiValue: 0.96, color: '#38BDF8'},
    {label: '生命感', kingValue: 0.88, queenValue: 0.89, aiValue: 0.18, color: '#34D399'},
    {label: '皇室度', kingValue: 0.95, queenValue: 0.94, aiValue: 0.05, color: '#FBBF24'},
    {label: '性别度(女)', kingValue: 0.08, queenValue: 0.93, aiValue: 0.50, color: '#F472B6'},
  ];

  view.add(
    <>
      <Grid
        ref={gridRef}
        width={1920}
        height={1080}
        spacing={60}
        stroke={'#1E293B'}
        lineWidth={1}
        opacity={0.45}
      />

      {/* 顶部课程标题栏 */}
      <Layout ref={titleGroup} y={-440} layout direction={'column'} alignItems={'center'} gap={10}>
        <Txt
          text={'第 1 课 · Tokenizer 切割机与 Embedding 向量天平'}
          fill={'#F8FAFC'}
          fontSize={44}
          fontWeight={700}
          fontFamily={'PingFang SC, Microsoft YaHei, sans-serif'}
        />
        <Rect fill={'#1E293B'} stroke={'#38BDF8'} lineWidth={1.5} radius={20} padding={[8, 24]}>
          <Txt
            text={() => stageStepLabel()}
            fill={'#38BDF8'}
            fontSize={24}
            fontWeight={600}
            fontFamily={'PingFang SC, sans-serif'}
          />
        </Rect>
      </Layout>

      {/* ==================== Step 1: Tokenizer 切割机 ==================== */}
      <Layout ref={step1Layer} opacity={1}>
        {/* 激光切割机腔体 */}
        <Rect
          ref={cutterFrame}
          y={40}
          width={1220}
          height={320}
          radius={24}
          fill={'#0F172A'}
          stroke={'#334155'}
          lineWidth={3}
        >
          <Txt
            text={'TOKENIZER 激光分块腔体'}
            y={-125}
            fill={'#64748B'}
            fontSize={20}
            letterSpacing={4}
            fontWeight={600}
          />
        </Rect>

        {/* 原始待切分句子 */}
        <Rect
          ref={rawSentenceBox}
          x={-1100}
          y={40}
          width={760}
          height={120}
          radius={18}
          fill={'#1E293B'}
          stroke={'#38BDF8'}
          lineWidth={3}
        >
          <Txt
            text={'AI改变未来的世界'}
            fill={'#F8FAFC'}
            fontSize={54}
            fontWeight={700}
            fontFamily={'PingFang SC, sans-serif'}
          />
        </Rect>

        {/* 激光扫描刀线 */}
        <Line
          ref={laserLine}
          points={[
            [-420, -110],
            [-420, 190],
          ]}
          stroke={'#22D3EE'}
          lineWidth={5}
          shadowColor={'#22D3EE'}
          shadowBlur={24}
          opacity={0}
        />

        {/* 切分后的彩色 Token 乐高积木 */}
        {tokens.map((item, idx) => (
          <Rect
            key={`tok-${idx}`}
            ref={tokenRefs[idx]}
            x={item.targetX}
            y={40}
            width={220}
            height={130}
            radius={18}
            fill={'#111827'}
            stroke={item.color}
            lineWidth={3}
            scale={0}
            opacity={0}
          >
            <Txt
              text={item.text}
              y={-14}
              fill={'#F8FAFC'}
              fontSize={42}
              fontWeight={700}
              fontFamily={'PingFang SC, sans-serif'}
            />
            <Rect y={38} width={136} height={32} radius={10} fill={item.color} opacity={0.2}>
              <Txt text={`ID ${item.id}`} fill={item.color} fontSize={20} fontWeight={700} />
            </Rect>
          </Rect>
        ))}
      </Layout>

      {/* ==================== Step 2: 4 维属性天平 ==================== */}
      <Layout ref={step2Layer} opacity={0} y={40}>
        <Rect
          width={1360}
          height={540}
          radius={24}
          fill={'#0F172A'}
          stroke={'#334155'}
          lineWidth={2}
        >
          <Txt
            text={'把汉字投射进宇宙坐标：4 维语义特征天平（对比 [国王] vs [女王]）'}
            y={-215}
            fill={'#E2E8F0'}
            fontSize={30}
            fontWeight={600}
          />
          <Layout y={-165} layout direction={'row'} gap={48}>
            <Txt text={'■ 金色柱：[国王]'} fill={'#FBBF24'} fontSize={24} fontWeight={600} />
            <Txt text={'■ 粉红柱：[女王]'} fill={'#F472B6'} fontSize={24} fontWeight={600} />
          </Layout>
        </Rect>

        {dimensions.map((dim, idx) => {
          const baseX = -450 + idx * 300;
          return (
            <Layout key={`dim-${idx}`} x={baseX} y={70}>
              {/* 轨道底框 */}
              <Rect width={150} height={260} radius={12} fill={'#1E293B'} />
              {/* 国王柱 */}
              <Rect
                ref={barRefs[idx]}
                x={-30}
                y={130}
                width={44}
                height={0}
                radius={8}
                fill={'#FBBF24'}
                offset={[0, 1]}
              />
              {/* 女王柱 */}
              <Rect
                ref={barQueenRefs[idx]}
                x={30}
                y={130}
                width={44}
                height={0}
                radius={8}
                fill={'#F472B6'}
                offset={[0, 1]}
              />
              <Txt text={dim.label} y={168} fill={dim.color} fontSize={24} fontWeight={700} />
            </Layout>
          );
        })}
      </Layout>

      {/* ==================== Step 3: 向量魔法算式 ==================== */}
      <Layout ref={step3Layer} opacity={0} y={50}>
        <Rect
          width={1260}
          height={560}
          radius={24}
          fill={'#0F172A'}
          stroke={'#334155'}
          lineWidth={2}
        >
          <Grid width={1180} height={480} spacing={60} stroke={'#1E293B'} lineWidth={1} />
          {/* 坐标轴 */}
          <Line points={[[-540, 200], [540, 200]]} stroke={'#475569'} lineWidth={2} endArrow arrowSize={12} />
          <Line points={[[-440, 240], [-440, -220]]} stroke={'#475569'} lineWidth={2} endArrow arrowSize={12} />
          <Txt text={'语义维度 X（性别偏移）'} x={340} y={226} fill={'#94A3B8'} fontSize={20} />
          <Txt text={'语义维度 Y（皇室尊贵度）'} x={-290} y={-200} fill={'#94A3B8'} fontSize={20} />
        </Rect>

        {/* [国王] 向量箭头 */}
        <Line
          ref={vecKing}
          points={[
            [-440, 200],
            [-80, -140],
          ]}
          stroke={'#FBBF24'}
          lineWidth={6}
          endArrow
          arrowSize={16}
          end={0}
        />
        <Txt text={'[国王]'} x={-110} y={-172} fill={'#FBBF24'} fontSize={28} fontWeight={700} />

        {/* - [男人] 向量箭头 */}
        <Line
          ref={vecMinusMan}
          points={[
            [-80, -140],
            [110, -40],
          ]}
          stroke={'#38BDF8'}
          lineWidth={5}
          lineDash={[12, 8]}
          endArrow
          arrowSize={14}
          end={0}
        />
        <Txt text={'- [男人]'} x={30} y={-125} fill={'#38BDF8'} fontSize={24} fontWeight={700} />

        {/* + [女人] 向量箭头 */}
        <Line
          ref={vecPlusWoman}
          points={[
            [110, -40],
            [290, -145],
          ]}
          stroke={'#F472B6'}
          lineWidth={6}
          endArrow
          arrowSize={16}
          end={0}
        />
        <Txt text={'+ [女人]'} x={225} y={-60} fill={'#F472B6'} fontSize={24} fontWeight={700} />

        {/* 目标节点 [女王] */}
        <Circle
          ref={queenTarget}
          x={290}
          y={-145}
          size={36}
          fill={'#F472B6'}
          stroke={'#FDF2F8'}
          lineWidth={4}
          scale={0}
        />
        <Txt text={'= [女王] ★'} x={380} y={-145} fill={'#F472B6'} fontSize={32} fontWeight={700} />

        {/* 魔法公式徽章 */}
        <Rect
          ref={formulaBadge}
          y={250}
          width={760}
          height={64}
          radius={16}
          fill={'#1E293B'}
          stroke={'#F472B6'}
          lineWidth={2}
          opacity={0}
        >
          <Txt
            text={'向量魔法：Vector(国王) - Vector(男人) + Vector(女人) ≈ Vector(女王)'}
            fill={'#F8FAFC'}
            fontSize={24}
            fontWeight={700}
          />
        </Rect>
      </Layout>
    </>,
  );

  // ========== 时间轴阶段 1：Tokenizer 切割机 ==========
  yield* rawSentenceBox().position.x(0, 0.9, easeInOutCubic);
  yield* laserLine().opacity(1, 0.2);

  // 激光从左扫到右
  yield* all(
    laserLine().points(
      [
        [420, -110],
        [420, 190],
      ],
      0.85,
      easeInOutCubic,
    ),
    rawSentenceBox().opacity(0.15, 0.85),
  );
  yield* laserLine().opacity(0, 0.2);
  rawSentenceBox().opacity(0);

  // 咔嚓弹出彩色 Token 积木
  yield* sequence(
    0.12,
    ...tokenRefs.map(ref =>
      all(
        ref().opacity(1, 0.2),
        spring(PlopSpring, 0, 1, v => ref().scale(v)),
      ),
    ),
  );
  yield* beginSlide('Step1-Tokenizer切割完成');

  // ========== 时间轴阶段 2：4 维属性天平 ==========
  stageStepLabel('Step 2 · 4 维语义坐标天平');
  yield* all(
    step1Layer().opacity(0, 0.5),
    step1Layer().position.y(-80, 0.5),
    step2Layer().opacity(1, 0.6),
  );

  yield* sequence(
    0.15,
    ...dimensions.map((dim, idx) =>
      all(
        tween(0.8, value => {
          const eased = easeOutBack(value);
          barRefs[idx]().height(230 * dim.kingValue * eased);
        }),
        tween(0.8, value => {
          const eased = easeOutBack(value);
          barQueenRefs[idx]().height(230 * dim.queenValue * eased);
        }),
      ),
    ),
  );
  yield* beginSlide('Step2-属性天平对比完成');

  // ========== 时间轴阶段 3：向量魔法算式 ==========
  stageStepLabel('Step 3 · 向量空间魔法算式');
  yield* all(
    step2Layer().opacity(0, 0.5),
    step3Layer().opacity(1, 0.6),
  );

  yield* vecKing().end(1, 0.9, easeInOutCubic);
  yield* vecMinusMan().end(1, 0.8, easeInOutCubic);
  yield* vecPlusWoman().end(1, 0.8, easeInOutCubic);
  yield* all(
    spring(SmoothSpring, 0, 1.15, v => queenTarget().scale(v)),
    formulaBadge().opacity(1, 0.5),
  );
  yield* waitFor(0.8);
  yield* beginSlide('Step3-向量算式演示完成');
});
