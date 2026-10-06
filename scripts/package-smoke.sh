#!/usr/bin/env bash
# Instala o pacote empacotado em consumidores isolados e prova que ele
# funciona como um produto o usaria. Uso:
#
#   scripts/package-smoke.sh <arquivo.tgz> [cenario...]
#
# Cenários: cjs esm ts-node10 ts-nodenext nest-cjs nest-esm (padrão: todos).
# NEST_VERSION escolhe a versão do NestJS do nest-cjs (padrão: 11).
set -euo pipefail

TARBALL="$(realpath "$1")"
shift
SCENARIOS=("${@:-cjs esm ts-node10 ts-nodenext nest-cjs nest-esm}")
read -r -a SCENARIOS <<< "${SCENARIOS[*]}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

TS_DEPS=(typescript@5 @types/node@20)

for scenario in "${SCENARIOS[@]}"; do
  echo "::group::$scenario (node $(node --version))"
  dir="$WORK/$scenario"
  cp -r "$ROOT/tests/package/$scenario" "$dir"
  cd "$dir"

  case "$scenario" in
    cjs)
      npm install --no-audit --no-fund --silent "$TARBALL"
      node index.cjs
      ;;
    esm)
      npm install --no-audit --no-fund --silent "$TARBALL"
      node index.mjs
      ;;
    ts-node10 | ts-nodenext)
      # Importam também o /nestjs, cujos tipos vêm do @nestjs/common.
      npm install --no-audit --no-fund --silent "$TARBALL" "${TS_DEPS[@]}" @nestjs/common@11 reflect-metadata rxjs
      npx tsc -p tsconfig.json
      echo "$scenario: ok"
      ;;
    nest-cjs)
      version="${NEST_VERSION:-11}"
      npm install --no-audit --no-fund --silent "$TARBALL" "${TS_DEPS[@]}" \
        "@nestjs/common@$version" "@nestjs/core@$version" reflect-metadata rxjs
      npx tsc -p tsconfig.json
      node dist/main.js
      ;;
    nest-esm)
      npm install --no-audit --no-fund --silent "$TARBALL" "${TS_DEPS[@]}" \
        "@nestjs/common@${NEST_VERSION:-12}" "@nestjs/core@${NEST_VERSION:-12}" reflect-metadata rxjs
      npx tsc -p tsconfig.json
      node dist/main.js
      ;;
    *)
      echo "cenário desconhecido: $scenario" >&2
      exit 1
      ;;
  esac

  cd "$ROOT"
  echo "::endgroup::"
done
