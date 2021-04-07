#!/bin/bash
set -e -o pipefail
test -f $(dirname $0)/lib-common.sh && source $(dirname $0)/lib-common.sh
trap clean EXIT QUIT KILL

scriptname=$(basename $0 .sh)
slack_notification "0" "$scriptname Started"

source_dir=$(pwd)

version=$( cd ${source_dir} && ( bash ci/version.sh || cat VERSION) )
[ -z "$version" ] && { echo "ERROR Version not found" ; exit 1 ;}

if [ -n "$DOCKER_LOGIN" -a -n "$DOCKER_PWD" ] ; then
  echo "$DOCKER_PWD" | docker login --username $DOCKER_LOGIN --password-stdin
fi

echo "# Build (${source_dir}) in progress"
( set -e ;  cd ${source_dir} && make LATEST_VERSION="${LATEST_VERSION:-latest}" build-dir build-archive build-all save-images || false ) || exit $?

echo "# Build results (${source_dir})"
( cd ${source_dir} && find *-build/ -type f -ls )

if [ -n "$DOCKER_LOGIN" -a -n "$DOCKER_PWD" ] ; then
  docker logout
fi
