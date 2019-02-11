#!/bin/bash
set -ex
# must fail
api_admin=/api/v2/auth/admin/token
# must success
api_candidat_link=/api/v2/auth/candidat/magic-link
api_candidat_preinscription=/api/v2/candidat/preinscription
echo "API candidat OK"
( curl -s -X POST -L localhost/candilib$api_candidat_link  || echo '{}' ) | jq -e 'if .success!=null then true else false end'
( curl -s -X POST -L localhost/candilib$api_candidat_preinscription  || echo '{}' ) | jq -e 'if .success!=null then true else false end'
echo "API admin disabled OK"
( curl -s -X POST -L localhost/candilib$api_admin -I |grep "^HTTP/.* 405" ) || exit $?

