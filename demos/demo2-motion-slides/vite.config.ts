import {defineConfig} from 'vite';
import motionCanvasPkg from '@motion-canvas/vite-plugin';

// 兼容 ESM ("type": "module") 与 CommonJS 默认导出互操作
const motionCanvas =
  typeof motionCanvasPkg === 'function'
    ? motionCanvasPkg
    : (motionCanvasPkg as unknown as {default: typeof motionCanvasPkg}).default;

// Vite + Motion Canvas 标准配置文件
// 运行 `pnpm dev` 启动 Motion Canvas Studio 编辑器，实时预览和渲染三个教学场景
export default defineConfig({
  plugins: [
    motionCanvas({
      project: './src/project.ts',
    }),
  ],
});
