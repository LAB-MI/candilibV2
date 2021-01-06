#!/bin/bash 
set -e
if [ -z "${DOCKER_PWD}" -a -z "${DOCKER_LOGIN}" ] ; then 
  echo "DOCKER_PWD et DOCKER_LOGIN vide"
  exit 1
fi
echo "Docker access"
echo $DOCKER_PWD | docker login --username $DOCKER_LOGIN --password-stdin
