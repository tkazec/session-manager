#!/bin/bash
# $ bash build.sh outdir ga-id

SRCDIR="$( cd "$( dirname "$0" )" && pwd )"
OUTDIR=$1
GAID=$2

rm -rf $OUTDIR
cp -R $SRCDIR $OUTDIR
cd $OUTDIR

rm build.sh
rm -rf .git

sed -i '' -e "s/##GA##/$GAID/" js/background.js

find . -path '*/.*' -prune -o -type f -print | zip session-manager.zip -@