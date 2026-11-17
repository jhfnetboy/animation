import {makeProject} from '@motion-canvas/core';

import lesson1Embedding from './scenes/lesson1_embedding?scene';
import lesson2Attention from './scenes/lesson2_attention?scene';
import lesson3Agent from './scenes/lesson3_agent?scene';

/**
 * Motion Canvas 主工程入口
 * 包含三节初高中 AI 科普微课的场景时间轴脚本：
 * 1. Tokenizer 切割机与 Embedding 向量天平
 * 2. Self-Attention 探照灯对比
 * 3. AI Agent 钢铁侠战甲闭环
 */
export default makeProject({
  name: 'AI科普微课程序化动画工坊',
  scenes: [lesson1Embedding, lesson2Attention, lesson3Agent],
});
