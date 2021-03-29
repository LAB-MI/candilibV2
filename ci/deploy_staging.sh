#!/bin/bash
set -e -o pipefail
test -f $(dirname $0)/lib-common.sh && source $(dirname $0)/lib-common.sh
trap clean EXIT QUIT KILL

scriptname=$(basename $0 .sh)
slack_notification "0" "$scriptname Started"

source_dir=$(pwd)

ret=1
if [ -n "$PLATEFORME" -a -n "$PLATEFORME_BRANCH" -a -n "$CI_PIPELINE_TOKEN" -a -n "$CI_PIPELINE_WEBHOOK" ] ; then 
  echo "# Staging $PLATEFORME"
  curl -sk -X POST -F token="$CI_PIPELINE_TOKEN" -F ref="$PLATEFORME_BRANCH" -F "variables[PLATEFORME]=$PLATEFORME"  "$CI_PIPELINE_WEBHOOK"
  ret=$?
fi
exit $ret
