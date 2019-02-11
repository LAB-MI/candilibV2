#!/bin/bash
#
# test candilib
#
set -e

basename=$(basename $0)
echo "# $basename ${APP} ${APP_VERSION}"

ret=0

echo "# Test ${APP} up"
set +e
timeout=120;
test_result=1
dirname=$(dirname $0)
until [ "$timeout" -le 0 -o "$test_result" -eq "0" ] ; do
        curl --fail --retry-max-time 120 --retry-delay 1  --retry 1  http://localhost:80
	test_result=$?
	echo "Wait $timeout seconds: ${APP} up $test_result";
	(( timeout-- ))
	sleep 1
done
if [ "$test_result" -gt "0" ] ; then
	ret=$test_result
	echo "ERROR: ${APP} en erreur"
	exit $ret
fi

exit $ret
