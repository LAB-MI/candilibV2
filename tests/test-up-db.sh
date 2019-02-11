#!/bin/bash
#
# test db
#
set -e

basename=$(basename $0)
echo "# $basename ${APP} ${APP_VERSION}"

ret=0
container_name=db

echo "# Test ${APP}-$container_name up"
set +e
timeout=120;
test_result=1
dirname=$(dirname $0)
until [ "$timeout" -le 0 -o "$test_result" -eq "0" ] ; do
	## TODO:
	${DC} -f ${DC_APP_DB_RUN_PROD} exec ${DC_USE_TTY} $container_name mongo --quiet  --eval "JSON.stringify(db.serverStatus({}));"
	test_result=$?
	echo "Wait $timeout seconds: ${APP}-$container_name up $test_result";
	(( timeout-- ))
	sleep 1
done
if [ "$test_result" -gt "0" ] ; then
	ret=$test_result
	echo "ERROR: ${APP}-$container_name en erreur"
	exit $ret
fi

exit $ret
