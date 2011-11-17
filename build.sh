#!/bin/bash
# $ bash build.sh containerdir googleanalyticsacc

SRCDIR="$( cd "$( dirname "$0" )" && pwd )"
OUTDIR="$1/session-manager"
OUTZIP="$OUTDIR.zip"
GA=$2

rm -rf $OUTDIR $OUTZIP
cp -R $SRCDIR $OUTDIR
cd $OUTDIR

sed -i '' -e "s/##GA##/$GA/" background.html

find . -path '*/.*' -prune -o -type f -print | zip $OUTZIP -@