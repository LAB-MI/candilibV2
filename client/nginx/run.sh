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
[ -z "${APP}" -o -z "${API_HOST}" -o -z "${API_PORT}" \
  -o -z "${APP_USER_LIMIT_RATE}"  \
  -o -z "${API_USER_SCOPE}" \
  -o -z "${API_USER_GET_LIMIT_RATE}" -o -z "${API_USER_GET_BURST}" \
  -o -z "${API_USER_POST_LIMIT_RATE}" -o -z "${API_USER_POST_BURST}" \
  -o -z "${API_USER_PATCH_LIMIT_RATE}" -o -z "${API_USER_PATCH_BURST}"  \
  -o -z "${API_USER_PUT_LIMIT_RATE}" -o -z "${API_USER_PUT_BURST}"  \
  -o -z "${API_USER_HEAD_LIMIT_RATE}" -o -z "${API_USER_HEAD_BURST}"  \
  -o -z "${API_USER_DELETE_LIMIT_RATE}" -o -z "${API_USER_DELETE_BURST}" \
  -o -z "${API_USER_OPTIONS_LIMIT_RATE}" -o -z "${API_USER_OPTIONS_BURST}" ] \
  && exit 1
(
 cat /etc/nginx/conf.d/default.template | \
 sed "s#<APP>#${APP}#g;s#<API_HOST>#${API_HOST}#g;s#<API_PORT>#${API_PORT}#g;" |
 sed "s#<APP_USER_LIMIT_RATE>#${APP_USER_LIMIT_RATE}#g;s#<APP_USER_BURST>#${APP_USER_BURST}#g;" |
 sed "s#<API_USER_SCOPE>#${API_USER_SCOPE}#g" |
 sed "s#<API_USER_GET_LIMIT_RATE>#${API_USER_GET_LIMIT_RATE}#g;s#<API_USER_GET_BURST>#${API_USER_GET_BURST}#g;" |
 sed "s#<API_USER_POST_LIMIT_RATE>#${API_USER_POST_LIMIT_RATE}#g;s#<API_USER_POST_BURST>#${API_USER_POST_BURST}#g;" |
 sed "s#<API_USER_PATCH_LIMIT_RATE>#${API_USER_PATCH_LIMIT_RATE}#g;s#<API_USER_PATCH_BURST>#${API_USER_PATCH_BURST}#g;" |
 sed "s#<API_USER_PUT_LIMIT_RATE>#${API_USER_PUT_LIMIT_RATE}#g;s#<API_USER_PUT_BURST>#${API_USER_PUT_BURST}#g;" |
 sed "s#<API_USER_HEAD_LIMIT_RATE>#${API_USER_HEAD_LIMIT_RATE}#g;s#<API_USER_HEAD_BURST>#${API_USER_HEAD_BURST}#g;" |
 sed "s#<API_USER_DELETE_LIMIT_RATE>#${API_USER_DELETE_LIMIT_RATE}#g;s#<API_USER_DELETE_BURST>#${API_USER_DELETE_BURST}#g;" |
 sed "s#<API_USER_OPTIONS_LIMIT_RATE>#${API_USER_OPTIONS_LIMIT_RATE}#g;s#<API_USER_OPTIONS_BURST>#${API_USER_OPTIONS_BURST}#g;" |
 sed "/^server {/a\
error_log /dev/stderr warn;\
access_log /dev/stdout main;
" > /etc/nginx/conf.d/default.conf
cat /etc/nginx/nginx.template |
 sed "s#<APP>#${APP}#g;s#<API_HOST>#${API_HOST}#g;s#<API_PORT>#${API_PORT}#g;" |
 sed "s#<APP_USER_LIMIT_RATE>#${APP_USER_LIMIT_RATE}#g;s#<APP_USER_BURST>#${APP_USER_BURST}#g;" |
 sed "s#<API_USER_SCOPE>#${API_USER_SCOPE}#g" |
 sed "s#<API_USER_GET_LIMIT_RATE>#${API_USER_GET_LIMIT_RATE}#g;s#<API_USER_GET_BURST>#${API_USER_GET_BURST}#g;" |
 sed "s#<API_USER_POST_LIMIT_RATE>#${API_USER_POST_LIMIT_RATE}#g;s#<API_USER_POST_BURST>#${API_USER_POST_BURST}#g;" |
 sed "s#<API_USER_PATCH_LIMIT_RATE>#${API_USER_PATCH_LIMIT_RATE}#g;s#<API_USER_PATCH_BURST>#${API_USER_PATCH_BURST}#g;" |
 sed "s#<API_USER_PUT_LIMIT_RATE>#${API_USER_PUT_LIMIT_RATE}#g;s#<API_USER_PUT_BURST>#${API_USER_PUT_BURST}#g;" |
 sed "s#<API_USER_HEAD_LIMIT_RATE>#${API_USER_HEAD_LIMIT_RATE}#g;s#<API_USER_HEAD_BURST>#${API_USER_HEAD_BURST}#g;" |
 sed "s#<API_USER_DELETE_LIMIT_RATE>#${API_USER_DELETE_LIMIT_RATE}#g;s#<API_USER_DELETE_BURST>#${API_USER_DELETE_BURST}#g;" |
 sed "s#<API_USER_OPTIONS_LIMIT_RATE>#${API_USER_OPTIONS_LIMIT_RATE}#g;s#<API_USER_OPTIONS_BURST>#${API_USER_OPTIONS_BURST}#g;" \
 > /etc/nginx/nginx.conf

) && nginx -g "daemon off;"
