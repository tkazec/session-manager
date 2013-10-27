#!/bin/bash
# $ bash build.sh outdir gaid rbid

SRCDIR="$( cd "$( dirname "$0" )" && pwd )"
OUTDIR="$1"
GAID="$2"
RBID="$3"

rm -rf "$OUTDIR"
cp -R "$SRCDIR" "$OUTDIR"
cd "$OUTDIR"

rm build.sh
rm -rf .git

sed -i '' -e "s/##GAID##/$GAID/" js/background.js
sed -i '' -e "s/##RBID##/$RBID/" js/errors.js

find . -path '*/.*' -prune -o -type f -print | zip session-manager.zip -@