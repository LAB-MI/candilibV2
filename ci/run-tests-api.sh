#!/bin/bash
basename=$(basename $0)
ret=1
echo "# build api services (api) in prod mode"
time make build-api NPM_AUDIT_DRY_RUN=${NPM_AUDIT_DRY_RUN:-false}
ret=$?
if [ "$ret" -gt 0 ] ; then
  echo "$basename build-api ERROR"
  exit $ret
fi
docker images
