#!/bin/bash
# must fail
api_admin=/api/v2/auth/admin/token
# must success
api_candidat_link=/api/v2/auth/candidat/magic-link
api_candidat_preinscription=/api/v2/candidat/preinscription
#echo "API candidat OK"
#( curl -s -X POST -L localhost/candilib$api_candidat_link  || echo '{}' ) | jq -e 'if .success!=null then true else false end'
#( curl -s -X POST -L localhost/candilib$api_candidat_preinscription  || echo '{}' ) | jq -e 'if .success!=null then true else false end'
#echo "API admin disabled OK"
#( curl -s -X POST -L localhost/candilib$api_admin -I |grep "^HTTP/.* 405" ) || exit $?


set -e

basename=$(basename $0)
APP=${APP:-candilib}
echo "# $basename ${APP} ${APP_VERSION}"

ret=0
container_name=front_admin
public_path=/candilibV2-repartiteur

echo "# Test ${APP}-$container_name up"
dirname=$(dirname $0)

timeout=120;
curl_args=" --retry-max-time 120 --retry-delay 1  --retry 1 "

echo "Check $container_name: API magick link $api_candidat_link available"
test_result=1
until [ "$timeout" -le 0 -o "$test_result" -eq "0" ] ; do
        set +e
        ( curl -s -X POST -L http://localhost:${FRONT_ADMIN_PORT:-80}${public_path}$api_candidat_link  || echo '{}' ) | jq -e 'if .success!=null then true else false end'
	test_result=$?
	echo "Wait $timeout seconds: ${APP}-$container_name up $test_result";
	(( timeout-- ))
	sleep 1
done
set -e
if [ "$test_result" -gt "0" ] ; then
	ret=$test_result
	echo "ERROR: ${APP}-$container_name en erreur"
	exit $ret
fi

echo "Check $container_name: API preinscription available $api_candidat_preinscription"
test_result=1
until [ "$timeout" -le 0 -o "$test_result" -eq "0" ] ; do
        set +e
        ( curl -s -X POST -L http://localhost:${FRONT_ADMIN_PORT:-80}${public_path}$api_candidat_preinscription  || echo '{}' ) | jq -e 'if .success!=null then true else false end'
	test_result=$?
	echo "Wait $timeout seconds: ${APP}-$container_name up $test_result";
	(( timeout-- ))
	sleep 1
done
set -e
if [ "$test_result" -gt "0" ] ; then
	ret=$test_result
	echo "ERROR: ${APP}-$container_name en erreur"
	exit $ret
fi

echo "Check $container_name: API admin enable $api_admin code 401"
test_result=1
until [ "$timeout" -le 0 -o "$test_result" -eq "0" ] ; do
        set +e
        ( curl -s -X POST -L http://localhost:${FRONT_ADMIN_PORT:-80}${public_path}$api_admin -I |grep "^HTTP/.* 401" )
	test_result=$?
	echo "Wait $timeout seconds: ${APP}-$container_name up $test_result";
	(( timeout-- ))
	sleep 1
done
set -e
if [ "$test_result" -gt "0" ] ; then
	ret=$test_result
	echo "ERROR: ${APP}-$container_name en erreur"
	exit $ret
fi

exit $ret
