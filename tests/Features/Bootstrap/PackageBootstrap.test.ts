import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(import.meta.dirname, '..', '..', '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as Record<string, any>;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);

    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

/** O pacote como quem instala o recebe. */
describe('package bootstrap', () => {
  it('never hardcodes the version — it comes from the git tag at release time', () => {
    expect(pkg['version']).toBe('0.0.0-development');
  });

  it('ships zero runtime dependencies', () => {
    expect(pkg['dependencies']).toBeUndefined();
  });

  it('keeps @nestjs/common as an optional peer', () => {
    expect(pkg['peerDependenciesMeta']['@nestjs/common']).toEqual({ optional: true });
  });

  it('exports types first, then import/require, for every entry point', () => {
    for (const entry of ['.', './nestjs', './testing']) {
      const conditions = pkg['exports'][entry];

      expect(Object.keys(conditions), entry).toEqual(['import', 'require']);
      expect(Object.keys(conditions.import), entry).toEqual(['types', 'default']);
      expect(Object.keys(conditions.require), entry).toEqual(['types', 'default']);
    }

    // Para TypeScript com moduleResolution "node" (NestJS clássico), que ignora `exports`.
    expect(pkg['main']).toBe('./dist/index.cjs');
    expect(pkg['types']).toBe('./dist/index.d.cts');
    expect(Object.keys(pkg['typesVersions']['*'])).toEqual(['nestjs', 'testing']);
  });

  it('documents every PUZL_ACCOUNT_* variable in .env.example, credentials empty', () => {
    const env = readFileSync(join(root, '.env.example'), 'utf8');

    for (const key of ['ISSUER', 'CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI', 'SCOPE', 'TOKEN_AUTH_METHOD', 'TIMEOUT', 'JWKS_CACHE_TTL', 'LEEWAY']) {
      expect(env).toMatch(new RegExp(`^PUZL_ACCOUNT_${key}=`, 'm'));
    }

    for (const key of ['ISSUER', 'CLIENT_ID', 'CLIENT_SECRET', 'REDIRECT_URI']) {
      expect(env).toMatch(new RegExp(`^PUZL_ACCOUNT_${key}=$`, 'm'));
    }
  });

  it('keeps secrets and the build out of git', () => {
    const gitignore = readFileSync(join(root, '.gitignore'), 'utf8');

    expect(gitignore).toMatch(/^\.env$/m);
    expect(gitignore).toMatch(/^\/dist\/$/m);
    expect(gitignore).toMatch(/^node_modules\/$/m);
  });

  it('keeps source files small and free of real hostnames', () => {
    for (const file of [...files(join(root, 'src')), ...files(join(root, 'tests', 'Unit'))]) {
      const contents = readFileSync(file, 'utf8');

      expect(contents.split('\n').length, file).toBeLessThanOrEqual(500);
      expect(contents, file).not.toMatch(/puzl\.place|puzltask\.com/);
    }
  });
});
