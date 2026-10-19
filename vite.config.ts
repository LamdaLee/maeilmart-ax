import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// shaula.kr/maeilmart-ax 에서도 같은 화면이 뜨도록 모든 주소를 /maeilmart-ax/ 아래에 둔다.
// 빌드 결과도 dist/maeilmart-ax/ 에 넣어, Vercel에서 같은 경로로 바로 찾게 한다.
export default defineConfig({
  base: '/maeilmart-ax/',
  build: { outDir: 'dist/maeilmart-ax', emptyOutDir: true },
  plugins: [react()],
  test: { environment: 'node' },
});
