import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: 'localhost',
      },
      plugins: [react()],
      // Vite는 자동으로 VITE_ 접두사가 있는 환경 변수를 import.meta.env에 주입합니다
      // 추가 define은 필요 없습니다
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
