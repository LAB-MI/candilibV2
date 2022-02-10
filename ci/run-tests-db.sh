#!/bin/bash
basename=$(basename $0)
ret=1
echo "# build-db services (api) in prod mode"
time make build-db NPM_AUDIT_DRY_RUN=${NPM_AUDIT_DRY_RUN:-false}
ret=$?
if [ "$ret" -gt 0 ] ; then
  echo "$basename build-db ERROR"
  exit $ret
fi
docker images
