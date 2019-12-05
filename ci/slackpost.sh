#!/bin/bash
set -x

# Usage: slackpost "<webhook_url>" "<channel>" "<username>" "<level>" "<message>"
# also (echo $RANDOM; echo $RANDOM) |slackpost "<channel>" "<username>"

# ------------
webhook_url=$1
if [[ $webhook_url == "" ]]; then
        echo "No webhook_url specified"
        exit 1
fi

# ------------
shift
channel=$1
if [[ $channel == "" ]]; then
        echo "No channel specified"
        exit 1
fi

# ------------
shift
username=$1
if [[ $username == "" ]]; then
        echo "No username specified"
        exit 1
fi

# ------------
shift
level=$1
if [[ $level == "" ]]; then
        echo "No level specified"
        exit 1
fi

case "$level" in
  INFO)
    SLACK_ICON=':white_check_mark:'
    SLACK_COLOR='good'
    ;;
  WARNING)
    SLACK_ICON=':warning:'
    SLACK_COLOR='warning'
    ;;
  ERROR)
    SLACK_ICON=':bangbang:'
    SLACK_COLOR='danger'
    ;;
  *)
    SLACK_ICON=':slack:'
    SLACK_COLOR='grey'
    ;;
esac

# ------------
shift

text=$*

if [[ $text == "" ]]; then
while IFS= read -r line; do
  #printf '%s\n' "$line"
  text="$text$line\n"
done
fi


if [[ $text == "" ]]; then
        echo "No text specified"
        exit 1
fi

escapedText=$(echo "$text" | sed 's/"/\"/g' | sed "s/'/\'/g" )

json="{\"channel\": \"$channel\", \"username\":\"$username\", \"attachments\":[{\"color\":\"$SLACK_COLOR\" , \"text\": \" $SLACK_ICON $escapedText\"}]}"

curl -s -d "payload=$json" "$webhook_url"
