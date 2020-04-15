#!/bin/bash
set -ex

# env config (can be overrided in travis Environment Variables)
# DISABLE_DEPLOY=true # disable this script and exit 0
# DISABLE_DEPLOY_HEROKU=true # skip heroku deployment
# DISABLE_DEPLOY_NETLIFY=true # skip netlify deployment
# DISABLE_SLACK_NOTIFICATION=true # disable slack notification
# HEROKU_EMAIL
# HEROKU_TOKEN
# HEROKU_APP_TEST
# HEROKU_APP_QUALIF
# HEROKU_APP_DEV
# NETLIFY_AUTH_TOKEN
# NETLIFY_SITE_ID is based on HEROKU_APP.netlify.com

function clean {
  ret=$?
  if [ "$ret" -gt 0 ]; then
    echo "ERROR: $0 $ret"
    slack_post_failure
  else
    echo "SUCCESS: $0 $ret"
    slack_post_success
  fi
  exit $ret
}

function slack_post_failure {
  if [ -n "$DISABLE_SLACK_NOTIFICATION" ] && [ "$DISABLE_SLACK_NOTIFICATION" == "true" ]; then
    echo "Disable slack notification"
  else
    (
    SHORT_COMMIT=$(echo "$TRAVIS_COMMIT" |cut -c 1-7)
    cat <<EOF | ci/slackpost.sh "$SLACK_WEBHOOK" "$SLACK_CHANNEL" "Travis CI" ERROR
Deploy <$TRAVIS_BUILD_WEB_URL|#$TRAVIS_BUILD_NUMBER> (<https://github.com/$TRAVIS_REPO_SLUG/commit/$TRAVIS_COMMIT|$SHORT_COMMIT>) on $TRAVIS_BRANCH failed !
EOF
    ) || true
  fi
}

function slack_post_success {
  if [ -n "$DISABLE_SLACK_NOTIFICATION" ] && [ "$DISABLE_SLACK_NOTIFICATION" == "true" ]; then
    echo "Disable slack notification"
  else
    (
    SHORT_COMMIT=$(echo "$TRAVIS_COMMIT" |cut -c 1-7)
    cat <<EOF | ci/slackpost.sh "$SLACK_WEBHOOK" "$SLACK_CHANNEL" "Travis CI" INFO
Deploy <$TRAVIS_BUILD_WEB_URL|#$TRAVIS_BUILD_NUMBER> (<https://github.com/$TRAVIS_REPO_SLUG/commit/$TRAVIS_COMMIT|$SHORT_COMMIT>) on $TRAVIS_BRANCH passed.
:arrow_right: You can connect to the <https://$NETLIFY_SITE_ID|$DEPLOY_ENV environment> !
EOF
    ) || true
  fi
}

# trap exit code and call clean function
trap clean EXIT QUIT

#
echo "Deploy $0 $*"
DEPLOY_ENV="$1"
BRANCH="$2"

if [ -n "$DISABLE_DEPLOY" ] && [ "$DISABLE_DEPLOY" == "true" ]; then
  DISABLE_SLACK_NOTIFICATION=true
  echo "Disable deploy"
  exit 0
fi

# for each ENV get heroku target app
case "$DEPLOY_ENV" in
  test)    HEROKU_APP=$HEROKU_APP_TEST ;;
  qualif)  HEROKU_APP=$HEROKU_APP_QUALIF ;;
  develop) HEROKU_APP=$HEROKU_APP_DEV ;;
  *)       HEROKU_APP="" ;;
esac

if [ -z "$HEROKU_APP" ] ;then
  echo "ERROR: empty HEROKU_APP for ${DEPLOY_ENV}"
  echo "No deployment target available"
  exit 1
fi

export NETLIFY_SITE_ID=${NETLIFY_SITE_ID:-$HEROKU_APP.netlify.com}

#
# Deploy API on heroku
#
if [ -n "${DISABLE_DEPLOY_HEROKU}" ] && [ "${DISABLE_DEPLOY_HEROKU}" == "true" ]; then
  echo "Disable heroku deploy"
else
echo "# Deploy API"
if [ -z "$HEROKU_EMAIL" ] || [ -z "$HEROKU_TOKEN" ]; then
  echo "ERROR: empty variable HEROKU_EMAIL, HEROKU_TOKEN and HEROKU_APP"
  echo "No deployment"
  exit 1
fi

# install heroku cli
sudo apt-get update -qqy
sudo apt-get install -qqy curl git gnupg
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
heroku version
docker images

# configure heroku cli
cat >~/.netrc <<EOF
machine api.heroku.com
  login $HEROKU_EMAIL
  password $HEROKU_TOKEN
machine git.heroku.com
  login $HEROKU_EMAIL
  password $HEROKU_TOKEN
EOF
chmod 600 ~/.netrc

## deploy app using remote git
# git checkout -b netlify
# heroku git:remote --app $HEROKU_APP
# git push heroku netlify:master -f

## or deploy app using docker registry
HEROKU_REGISTRY="registry.heroku.com"
heroku auth:token 2>&- | docker login --username=_ --password-stdin "${HEROKU_REGISTRY}"
APP_VERSION="$(./ci/version.sh)"
docker tag "candilib_api:$APP_VERSION" "${HEROKU_REGISTRY}/$HEROKU_APP/web"
docker push "${HEROKU_REGISTRY}/$HEROKU_APP/web"
heroku container:release web --app $HEROKU_APP

# first time : setup DB
BRANCH_DIR=$(echo "$BRANCH" |tr '/' '-')
GIT_REMOTE_URL=$(git config --get remote.origin.url | sed -e 's/.git$//g')
echo "Start db setup init"
heroku run --no-tty -a $HEROKU_APP "set -ex ; ( cd /app && node ci/wget.js ${GIT_REMOTE_URL}/archive/${BRANCH}.tar.gz && tar -zxvf $(basename ${BRANCH}.tar.gz) --strip-components=2 candilibV2-${BRANCH_DIR}/server/dev-setup ) && npm run dev-setup"
res=$?
echo "End db setup init"
# TODO: variable REPO
if  [ "$res" -gt 0 ] ; then
   exit $res
fi
rm -rf ~/.netrc
fi

#
# Deploy FRONT on netlify
#
if [ -n "${DISABLE_DEPLOY_NETLIFY}" ] && [ "${DISABLE_DEPLOY_NETLIFY}" == "true" ]; then
  echo "Disable netlify deploy"
else

echo "# Deploy front"

if [ -z "$NETLIFY_AUTH_TOKEN" ] || [ -z "$NETLIFY_SITE_ID" ]; then
  echo "ERROR: empty variable NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID"
  echo "No deployment"
  exit 1
fi

# Install netlify-cli
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
npm --version
sudo npm install -g netlify-cli@2.24.0

# Extract front files from previously docker images
make export-front-all

APP_VERSION="$(./ci/version.sh)"
(
cd "candilibV2-$APP_VERSION-dist"

# Generate route files (/api -> http://API/)
API_URL="https://$HEROKU_APP.herokuapp.com/api/"

cat > dist/_redirects <<EOF
/candilib/api/* ${API_URL}:splat 200
/candilib-repartiteur/api/* ${API_URL}:splat 200
/candilib/* /candilib/index.html 200
/candilib-repartiteur/* /candilib-repartiteur/index.html 200
EOF

# Generate simple index for testing site
cat > dist/index.html <<EOF
<H1>CandilibV2 $APP_VERSION</H1>
<ul>
  <li><a href="/candilib">Candidat</a></li>
  <li><a href="/candilib-repartiteur">Admin</a></li>
</ul>
EOF

# deploy files
json=$(netlify deploy --timeout 30 --prod --dir=./dist --message "Deploy $APP_VERSION" --json)
echo "$json" > netlify.json
cat netlify.json

deploy_id="$(jq -re '.deploy_id' < netlify.json)"
if [ "$?" -gt 0 ] || [ -z "$deploy_id" ] ; then
   echo "Netlify error: deploy_id empty"
   exit 1
fi
curl_args="--fail --retry 10 --retry-delay 5 --retry-max-time 60 --connect-timeout 10 "
# lock deployment
curl ${curl_args} -o /dev/null -X POST -H "Content-Type: application/json" \
  -d '{}' \
  "https://api.netlify.com/api/v1/deploys/${deploy_id}/lock?access_token=${NETLIFY_AUTH_TOKEN}" \
  || exit $?
echo "lock: $?"

# publish file
curl ${curl_args} -o /dev/null -X POST -H "Content-Type: application/json" \
  -d '{}' \
  "https://api.netlify.com/api/v1/deploys/${deploy_id}/restore?access_token=${NETLIFY_AUTH_TOKEN}" \
  || exit $?
echo "Publish: $?"
)

fi

exit 0
