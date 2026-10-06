import { defineConfig } from 'tsdown';

// Um build, três entradas e dois formatos. As entradas compartilham chunks
// dentro de cada formato, então `PzAccountSdkClient` é a MESMA classe no
// pacote principal, no `/nestjs` e no `/testing` — o que o NestJS precisa
// para usar a classe como token de injeção.
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    nestjs: 'src/NestJs/index.ts',
    testing: 'src/Testing/index.ts',
  },
  format: ['esm', 'cjs'],
  platform: 'node',
  target: 'node18',
  dts: true,
  clean: true,
  sourcemap: false,
  fixedExtension: false,
  // `@nestjs/common` só aparece em `import type`: não pode virar require().
  deps: { neverBundle: ['@nestjs/common'] },
});
