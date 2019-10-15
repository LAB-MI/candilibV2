#!/bin/bash
#
# configuration nginx
#
set -e
APP=candilib
[ -z "${APP}" -o -z "${API_HOST}" -o -z "${API_PORT}" ] && exit 1
date="@$(date '+%Y-%m-%d %H:%M:%S')"
#export FAKETIME="${FAKETIME:-$date}"
export FAKETIME="@2020-12-24 20:30:00"
(
 cat /etc/nginx/conf.d/default.template | \
 sed "s/<APP>/${APP}/g;s/<API_HOST>/${API_HOST}/g;s/<API_PORT>/${API_PORT}/g;" |
 sed "/^server {/a\
error_log /dev/stderr warn;\
access_log /dev/stdout main;
" > /etc/nginx/conf.d/default.conf
cat /etc/nginx/nginx.template > /etc/nginx/nginx.conf
) && LD_PRELOAD=/usr/lib/x86_64-linux-gnu/faketime/libfaketime.so.1 \
   nginx -g "daemon off;"
