# Consumidores de fumaça

Projetos mínimos que instalam o pacote **empacotado** (`npm pack`) e o usam
como um produto usaria. Rodam no CI (`scripts/package-smoke.sh`) antes de
qualquer release — e localmente com:

```bash
npm run build && npm pack && scripts/package-smoke.sh ./puzl-account-sdk-0.0.0-development.tgz
```

| Pasta | Prova que funciona com |
|---|---|
| `cjs/` | `require()` em JavaScript puro (CommonJS) |
| `esm/` | `import` em JavaScript puro (ESM) |
| `ts-node10/` | TypeScript com `moduleResolution: node` (NestJS clássico) |
| `ts-nodenext/` | TypeScript com `moduleResolution: nodenext` |
| `nest-cjs/` | App NestJS 10/11 em CommonJS, com decorators e DI pela classe |
| `nest-esm/` | App NestJS 12 em ESM |
