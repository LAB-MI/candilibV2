#!/bin/bash 
set -e
if [ -n "${DOCKER_PWD}" -a -n "${DOCKER_LOGIN}" ] ; then
  echo "$DOCKER_PWD" | docker login --username $DOCKER_LOGIN --password-stdin
fi
