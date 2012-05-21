#!/bin/bash
# $ bash build.sh outdir ga-id ec-id

SRCDIR="$( cd "$( dirname "$0" )" && pwd )"
OUTDIR=$1
GAID=$2
ECID=$3

rm -rf $OUTDIR
cp -R $SRCDIR $OUTDIR
cd $OUTDIR

rm build.sh
rm -rf .git

sed -i '' -e "s/##GA##/$GAID/" scripts/background.js
sed -i '' -e "s/##EC##/$ECID/" scripts/errors.js

find . -path '*/.*' -prune -o -type f -print | zip session-manager.zip -@