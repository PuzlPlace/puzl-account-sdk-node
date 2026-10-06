#!/usr/bin/env bash
# Monta o commit de release e a tag, a partir do pacote JÁ TESTADO pelo CI:
#
#   scripts/release-commit.sh <arquivo.tgz> <vX.Y.Z>
#
# O commit fica fora da branch (só a tag aponta para ele) e leva:
#   - o dist/ do .tgz — o mesmo artefato que os consumidores de fumaça usaram;
#   - a versão real no package.json;
#   - nenhum script nem devDependency: o npm, ao instalar um pacote via Git,
#     roda um `npm install` completo dentro dele se houver script de build.
#
# Não faz push: quem chama decide (o workflow empurra só a tag).
set -euo pipefail

TARBALL="$(realpath "$1")"
TAG="$2"
VERSION="${TAG#v}"

if ! [[ "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "tag inválida: $TAG (esperado vX.Y.Z)" >&2
  exit 1
fi

EXTRACT="$(mktemp -d)"
trap 'rm -rf "$EXTRACT"' EXIT
tar -xzf "$TARBALL" -C "$EXTRACT"

rm -rf dist
cp -r "$EXTRACT/package/dist" dist

npm pkg set version="$VERSION"
npm pkg delete scripts devDependencies

BOT=(-c user.name="github-actions[bot]" -c user.email="41898282+github-actions[bot]@users.noreply.github.com")

git add -f dist package.json
git "${BOT[@]}" commit --quiet --no-verify -m "release: $TAG"
git "${BOT[@]}" tag -a "$TAG" -m "$TAG"

echo "release $TAG pronta em $(git rev-parse --short "$TAG")"
