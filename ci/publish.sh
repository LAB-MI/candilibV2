#!/bin/bash
set -e

basename=$(basename $0)
export SRC=${1:? $basename SRC DST VERSION}
export DST=${2:? $basename SRC DST VERSION}
export VERSION=${3:? $basename SRC DST VERSION}

curl_opt="--retry 10 --retry-delay 5 --retry-max-time 60 --connect-timeout 10 --fail "

echo "Publish $SRC $DST ${VERSION} artifacts"
if [ -z "${PUBLISH_URL}" -o -z "${PUBLISH_AUTH_TOKEN}" ] ; then
  echo "PUBLISH_URL et PUBLISH_AUTH_TOKEN vide"
  exit 1
fi
( cd ${BUILD_DIR} && [ -f "$SRC" ] && curl $curl_opt -k -X PUT -T $SRC -H "X-Auth-Token:${PUBLISH_AUTH_TOKEN}" ${PUBLISH_URL}/${PUBLISH_URL_BASE}/${VERSION}/$DST --progress-bar --write "Uploaded %{url_effective} %{size_upload} bytes in %{time_connect} seconds (%{speed_download} bytes/s)\n"
)

exit $?
