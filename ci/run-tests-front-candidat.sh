#!/bin/bash
basename=$(basename $0)
ret=1
echo "# build-front-candidat services (api) in prod mode"
time make build-front-candidat NPM_AUDIT_DRY_RUN=${NPM_AUDIT_DRY_RUN:-false}
ret=$?
if [ "$ret" -gt 0 ] ; then
  echo "$basename build-front-candidat ERROR"
  exit $ret
fi
docker images
