#!/bin/bash
curl -s --fail -X POST -L  localhost/candilib/api/v2/auth/admin/token | jq '.success' ; echo $?

