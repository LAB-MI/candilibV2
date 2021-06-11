#!/bin/bash
set -e
set -o pipefail
test -f $(dirname $0)/lib-common.sh && source $(dirname $0)/lib-common.sh
trap clean EXIT QUIT KILL

scriptname=$(basename $0 .sh)
slack_notification "0" "$scriptname Started"

source_dir=$(pwd)

echo "# Check build folder (${source_dir})"
( ls -lah ${source_dir}/*-build/ )

echo "# Publish in progress (${source_dir})"
( cd ${source_dir} &&
  echo "# generate token"
  export no_proxy="$no_proxy"
  eval $(openstack --insecure token issue -f shell -c id)
  OS_AUTH_TOKEN=${id:-}
  [ -z "$OS_STORAGE_URL" -o -z "$OS_AUTH_TOKEN" ] && exit 1

  make publish clean-images clean-archive \
     LATEST_VERSION="${LATEST_VERSION:-latest}" \
     PUBLISH_AUTH_TOKEN=$OS_AUTH_TOKEN \
     PUBLISH_URL=$OS_STORAGE_URL
) || exit $?
