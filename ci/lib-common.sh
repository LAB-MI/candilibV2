function clean() {
  ret=$?
  scriptname=$(basename $0 .sh)
  if [ "$ret" -gt 0 ] ; then
     slack_notification "$ret" "$scriptname Error :boom:"
  fi
  if [ "$ret" -eq 0 ] ;then
     slack_notification "$ret" "$scriptname Success :heavy_check_mark:"
  fi
  exit $ret
}

function slack_notification(){
ret=$1
log=$2

 set +e
date="$(TZ=Europe/Paris date)"
curl_opt="--retry 5 --retry-delay 5 --max-time 10 --retry-max-time 30 --connect-timeout 5"
wget_opt=" -T 5 -t 5 --connect-timeout 5"

if [ -z "$ret" -o -z "$log" -o -z "$WEBHOOK_SLACK_URL" ] ; then
  echo "# slack_notification disabled"
else
  message="[ $CI_PROJECT_NAME $CI_JOB_STAGE $CI_JOB_NAME #$CI_PIPELINE_ID ]: *$log ($ret)*"

  read -d '' json << EOF_SLACK
{
 "text": "_${date}_ *notification ci*: $message"
}
EOF_SLACK

#  if ! wget $wget_opt --quiet --method POST --header 'content-type: application/json' --body-data "$json" $WEBHOOK_SLACK_URL ; then
#        echo "ERROR slack_notification ($?)"
#  fi
#
  if ! curl $curl_opt -s -k -L \
    -X POST -H 'Content-type: application/json' $WEBHOOK_SLACK_URL \
   -d "${json}" ; then
    echo "ERROR slack_notification ($?)"
  fi
  set -e
fi
}
