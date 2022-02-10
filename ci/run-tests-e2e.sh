#!/bin/bash
basename=$(basename $0)
ret=1
echo "# build api services (api) in prod mode"
time make build-e2e NPM_AUDIT_DRY_RUN=${NPM_AUDIT_DRY_RUN:-false} DC_BUILD_ARGS=$1
ret=$?
if [ "$ret" -gt 0 ] ; then
  echo "$basename build-e2e ERROR"
  exit $ret
fi
docker images
