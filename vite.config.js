import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: funciona em ziddeira.github.io/estagia e em qualquer outro endereço
export default defineConfig({
  plugins: [react()],
  base: './'
});
