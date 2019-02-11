#!/bin/bash
set -ex
echo "Build archive: ${APP}-${LATEST_VERSION}"
echo "${APP_VERSION}" > VERSION
cp VERSION ${BUILD_DIR}/${APP}-VERSION
tar -zcvf ${BUILD_DIR}/${FILE_ARCHIVE_APP_VERSION} --exclude $(basename ${BUILD_DIR}) $( git ls-files ) VERSION
cp ${BUILD_DIR}/${FILE_ARCHIVE_APP_VERSION} ${BUILD_DIR}/${FILE_ARCHIVE_LATEST_VERSION}
