#!/usr/bin/env bash
# Prova o caminho que os produtos usam de verdade: release em um repositório
# Git, depois `npm install git+...#semver:^1.0.0` num projeto vazio.
#
#   scripts/git-install-smoke.sh <arquivo.tgz>
#
# Confere que o pacote chega compilado, que nenhuma dependência de
# desenvolvimento do SDK é instalada, e que require/import funcionam.
set -euo pipefail

TARBALL="$(realpath "$1")"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

git clone --quiet --no-tags "$ROOT" "$WORK/repo"
(cd "$WORK/repo" && "$ROOT/scripts/release-commit.sh" "$TARBALL" v1.0.0)

mkdir "$WORK/app"
cd "$WORK/app"
npm init -y > /dev/null
npm install --no-audit --no-fund "git+file://$WORK/repo#semver:^1.0.0"

installed="$(ls node_modules | grep -v '^\.' | grep -v '^@puzl$' || true)"
if [ -n "$installed" ]; then
  echo "o install via Git trouxe pacotes além do SDK: $installed" >&2
  exit 1
fi

test -f node_modules/@puzl/account-sdk/dist/index.cjs
test "$(node -p "require('@puzl/account-sdk/package.json').version")" = "1.0.0"

cp "$ROOT/tests/package/cjs/index.cjs" "$ROOT/tests/package/esm/index.mjs" .
node index.cjs
node index.mjs
echo "git-install: ok"
