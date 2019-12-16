#!/bin/bash
#
# configuration nginx
#
set -e
APP=candilib
# Set Front env variables at run time
if [ -n "${LINE_DELAY}" ] ;then
  (
  cd /usr/share/nginx/html
  if [ -f config-candilib.json ] ;then
    cat > config-candilib.json <<EOF
{
  "lineDelay": ${LINE_DELAY}
}
EOF
  fi
  )
fi

# Set nginx env variables
[ -z "${APP}" -o -z "${API_HOST}" -o -z "${API_PORT}" ] && exit 1
(
 cat /etc/nginx/conf.d/default.template | \
 sed "s/<APP>/${APP}/g;s/<API_HOST>/${API_HOST}/g;s/<API_PORT>/${API_PORT}/g;" |
 sed "/^server {/a\
error_log /dev/stderr warn;\
access_log /dev/stdout main;
" > /etc/nginx/conf.d/default.conf
cat /etc/nginx/nginx.template > /etc/nginx/nginx.conf
) && nginx -g "daemon off;"
