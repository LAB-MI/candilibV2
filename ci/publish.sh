#!/bin/bash
set -ex
if [ -z "${PUBLISH_URL}" -o -z "${PUBLISH_AUTH_TOKEN}" ] ; then exit 1 ; fi
( cd ${BUILD_DIR}
  ls -alrt
  for file in \
    "${APP}-VERSION ${APP}-VERSION" \
    ${FILE_ARCHIVE_APP_VERSION} \
    ${FILE_IMAGE_WEB_APP_VERSION} \
    ${FILE_IMAGE_API_APP_VERSION} \
    ${FILE_IMAGE_DB_APP_VERSION} \
  ; do
     curl -k -X PUT -T $$file -H 'X-Auth-Token: ${PUBLISH_AUTH_TOKEN}' ${PUBLISH_URL}/${PUBLISH_URL_APP_VERSION}/$$file 
  done
  curl -k -H 'X-Auth-Token: ${PUBLISH_AUTH_TOKEN}' "${PUBLISH_URL}/${PUBLISH_URL_BASE}?prefix=${APP_VERSION}/&format=json" -s --fail
  )
exit $?
