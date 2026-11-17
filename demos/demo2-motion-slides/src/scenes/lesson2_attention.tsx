import {CubicBezier, Grid, Layout, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  SmoothSpring,
  all,
  beginSlide,
  createRef,
  createSignal,
  easeInOutCubic,
  spring,
  waitFor,
} from '@motion-canvas/core';

/** 词元位置配置 */
interface WordNode {
  word: string;
  x: number;
  role?: string;
}

export default makeScene2D(function* (view) {
  view.fill('#0B0F19');

  const subtitle = createSignal('情景 A：因为【它】太饿了 -> 探照灯锁定“小狗”（88%）');
  const tailWord = createSignal('太饿了。');

  const dogBox = createRef<Rect>();
  const boneBox = createRef<Rect>();
  const itBox = createRef<Rect>();
  const tailBox = createRef<Rect>();

  const beamToDog = createRef<CubicBezier>();
  const beamToBone = createRef<CubicBezier>();

  const dogWeightBar = createRef<Rect>();
  const boneWeightBar = createRef<Rect>();
  const dogWeightLabel = createSignal('88%');
  const boneWeightLabel = createSignal('12%');

  const qkvCard = createRef<Rect>();
  const qkvText = createSignal('Query(“它”在找谁？) × Key(谁能“饿”？) => Value(小狗特征注入)');

  const words: WordNode[] = [
    {word: '追着', x: -370},
    {word: '跑，', x: 50},
    {word: '因为', x: 240},
  ];

  view.add(
    <>
      <Grid width={1920} height={1080} spacing={60} stroke={'#1E293B'} lineWidth={1} opacity={0.45} />

      {/* 顶部标题 */}
      <Layout y={-430} layout direction={'column'} alignItems={'center'} gap={12}>
        <Txt
          text={'第 2 课 · Self-Attention 探照灯：为什么“它”知道自己是谁？'}
          fill={'#F8FAFC'}
          fontSize={42}
          fontWeight={700}
          fontFamily={'PingFang SC, Microsoft YaHei, sans-serif'}
        />
        <Rect fill={'#1E293B'} stroke={'#FBBF24'} lineWidth={1.5} radius={20} padding={[8, 28]}>
          <Txt text={() => subtitle()} fill={'#FBBF24'} fontSize={24} fontWeight={600} />
        </Rect>
      </Layout>

      {/* 贝塞尔注意力探照灯光束（弧线拱起在句子上方） */}
      <CubicBezier
        ref={beamToDog}
        p0={[430, -90]}
        p1={[260, -340]}
        p2={[-420, -340]}
        p3={[-590, -90]}
        stroke={'#FBBF24'}
        lineWidth={14}
        shadowColor={'#FBBF24'}
        shadowBlur={28}
        endArrow
        arrowSize={20}
        end={0}
      />

      <CubicBezier
        ref={beamToBone}
        p0={[430, -90]}
        p1={[320, -290]}
        p2={[-60, -290]}
        p3={[-160, -90]}
        stroke={'#22D3EE'}
        lineWidth={3}
        shadowColor={'#22D3EE'}
        shadowBlur={26}
        endArrow
        arrowSize={18}
        end={0}
        opacity={0.4}
      />

      {/* 句子词元卡片行 */}
      <Layout y={-30}>
        {/* 核心词：小狗 */}
        <Rect
          ref={dogBox}
          x={-590}
          width={190}
          height={110}
          radius={18}
          fill={'#1E293B'}
          stroke={'#FBBF24'}
          lineWidth={4}
        >
          <Txt text={'小狗'} fill={'#F8FAFC'} fontSize={38} fontWeight={700} />
          <Txt text={'Key: 动物'} y={40} fill={'#FBBF24'} fontSize={16} fontWeight={600} />
        </Rect>

        {/* 中间常规词元 */}
        {words.map((item, idx) => (
          <Rect
            key={`w-${idx}`}
            x={item.x}
            width={150}
            height={100}
            radius={16}
            fill={'#0F172A'}
            stroke={'#334155'}
            lineWidth={2}
          >
            <Txt text={item.word} fill={'#94A3B8'} fontSize={34} fontWeight={600} />
          </Rect>
        ))}

        {/* 核心词：骨头 */}
        <Rect
          ref={boneBox}
          x={-160}
          width={190}
          height={110}
          radius={18}
          fill={'#0F172A'}
          stroke={'#334155'}
          lineWidth={2}
        >
          <Txt text={'骨头'} fill={'#E2E8F0'} fontSize={38} fontWeight={700} />
          <Txt text={'Key: 食物'} y={40} fill={'#38BDF8'} fontSize={16} fontWeight={600} />
        </Rect>

        {/* 代词核心：它 */}
        <Rect
          ref={itBox}
          x={430}
          width={170}
          height={116}
          radius={20}
          fill={'#312E81'}
          stroke={'#A78BFA'}
          lineWidth={4}
        >
          <Txt text={'【它】'} fill={'#F8FAFC'} fontSize={40} fontWeight={700} />
          <Txt text={'Query 探照灯'} y={42} fill={'#C4B5FD'} fontSize={16} fontWeight={600} />
        </Rect>

        {/* 语境触发词：太饿了 / 太香了 */}
        <Rect
          ref={tailBox}
          x={650}
          width={210}
          height={110}
          radius={18}
          fill={'#1E293B'}
          stroke={'#F472B6'}
          lineWidth={3}
        >
          <Txt text={() => tailWord()} fill={'#F472B6'} fontSize={36} fontWeight={700} />
        </Rect>
      </Layout>

      {/* 注意力连线强度仪表盘 */}
      <Rect y={185} width={1160} height={190} radius={20} fill={'#0F172A'} stroke={'#334155'} lineWidth={2}>
        <Txt text={'词元注意力权重实时分配条'} y={-62} fill={'#CBD5E1'} fontSize={22} fontWeight={600} />

        {/* 小狗权重条 */}
        <Txt text={'指向 [小狗]'} x={-420} y={-5} fill={'#FBBF24'} fontSize={24} fontWeight={700} />
        <Rect x={40} y={-5} width={680} height={28} radius={14} fill={'#1E293B'} />
        <Rect
          ref={dogWeightBar}
          x={-300}
          y={-5}
          width={0}
          height={28}
          radius={14}
          fill={'#FBBF24'}
          offset={[-1, 0]}
        />
        <Txt text={() => dogWeightLabel()} x={440} y={-5} fill={'#FBBF24'} fontSize={26} fontWeight={700} />

        {/* 骨头权重条 */}
        <Txt text={'指向 [骨头]'} x={-420} y={48} fill={'#22D3EE'} fontSize={24} fontWeight={700} />
        <Rect x={40} y={48} width={680} height={28} radius={14} fill={'#1E293B'} />
        <Rect
          ref={boneWeightBar}
          x={-300}
          y={48}
          width={0}
          height={28}
          radius={14}
          fill={'#22D3EE'}
          offset={[-1, 0]}
        />
        <Txt text={() => boneWeightLabel()} x={440} y={48} fill={'#22D3EE'} fontSize={26} fontWeight={700} />
      </Rect>

      {/* 底部 Q-K-V 锁钥匹配说明卡 */}
      <Rect
        ref={qkvCard}
        y={375}
        width={1160}
        height={84}
        radius={16}
        fill={'#1E293B'}
        stroke={'#818CF8'}
        lineWidth={2}
      >
        <Txt text={() => qkvText()} fill={'#E2E8F0'} fontSize={26} fontWeight={600} />
      </Rect>
    </>,
  );

  // ========== 情景 A：因为【它】太饿了 ==========
  yield* all(
    beamToDog().end(1, 0.9, easeInOutCubic),
    beamToBone().end(1, 0.9, easeInOutCubic),
    dogWeightBar().width(680 * 0.88, 0.9, easeInOutCubic),
    boneWeightBar().width(680 * 0.12, 0.9, easeInOutCubic),
    spring(SmoothSpring, 1, 1.08, v => dogBox().scale(v)),
  );
  yield* beginSlide('情景A-太饿了聚焦小狗');

  // ========== 情景 B：一字之差 -> 太香了 ==========
  tailWord('太香了。');
  subtitle('情景 B：一字之差【太香了】 -> 探照灯瞬间切向“骨头”（92%）');
  qkvText('Query(“它”在找谁？) × Key(谁能“香”？) => Value(骨头特征注入)');
  dogWeightLabel('8%');
  boneWeightLabel('92%');

  yield* all(
    spring(SmoothSpring, 1, 1.12, v => tailBox().scale(v)),
    dogBox().scale(1, 0.4),
    dogBox().stroke('#334155', 0.4),
    dogBox().lineWidth(2, 0.4),
    boneBox().scale(1.08, 0.5),
    boneBox().stroke('#22D3EE', 0.4),
    boneBox().lineWidth(4, 0.4),
    beamToDog().lineWidth(3, 0.6, easeInOutCubic),
    beamToDog().opacity(0.3, 0.6),
    beamToBone().lineWidth(15, 0.6, easeInOutCubic),
    beamToBone().opacity(1, 0.6),
    dogWeightBar().width(680 * 0.08, 0.7, easeInOutCubic),
    boneWeightBar().width(680 * 0.92, 0.7, easeInOutCubic),
  );
  yield* tailBox().scale(1, 0.3);
  yield* waitFor(0.8);
  yield* beginSlide('情景B-太香了聚焦骨头');
});
