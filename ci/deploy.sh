#!/bin/bash
set -ex
echo "Deploy $0 $@"
DEPLOY_ENV="$1"
BRANCH="$2"

# env config
# DISABLE_DEPLOY=true # disable this script and exit 0
# DISABLE_DEPLOY_HEROKU=true # skip heroku deployment
# DISABLE_DEPLOY_NETLIFY=true # skip netlify deployment
# HEROKU_EMAIL
# HEROKU_TOKEN
# HEROKU_APP_TEST
# HEROKU_APP_QUALIF
# HEROKU_APP_DEV
# NETLIFY_AUTH_TOKEN
# NETLIFY_SITE based on HEROKU_APP.netlify.com

if [ -n "$DISABLE_DEPLOY" -a "$DISABLE_DEPLOY" == "true" ]; then
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

#
# Deploy API on heroku
#
if [ -n "${DISABLE_DEPLOY_HEROKU}" -a "${DISABLE_DEPLOY_HEROKU}" == "true" ]; then
  echo "Disable heroku deploy"
else
echo "# Deploy API"
if [ -z "$HEROKU_EMAIL" -o -z "$HEROKU_TOKEN" ]; then
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
echo "$(heroku auth:token)" | docker login --username=_ --password-stdin registry.heroku.com
APP_VERSION="$(./ci/version.sh)"
docker tag candilib_api:$APP_VERSION registry.heroku.com/$HEROKU_APP/web
docker push registry.heroku.com/$HEROKU_APP/web
heroku container:release web --app $HEROKU_APP
# first time : setup DB
BRANCH_DIR=$(echo $BRANCH |tr '/' '-')
heroku run --no-tty -a $HEROKU_APP "( cd /app && wget  -L https://github.com/LAB-MI/candilibV2/archive/${BRANCH}.tar.gz -O - |tar zxvf - --strip-components=2 candilibV2-${BRANCH_DIR}/server/dev-setup ) && npm run dev-setup"
# TODO: variable REPO

rm -rf ~/.netrc
fi

#
# Deploy FRONT on netlify
#
if [ -n "${DISABLE_DEPLOY_NETLIFY}" -a "${DISABLE_DEPLOY_NETLIFY}" == "true" ]; then
  echo "Disable netlify deploy"
else

echo "# Deploy front"
export NETLIFY_SITE_ID=$HEROKU_APP.netlify.com

if [ -z "$NETLIFY_AUTH_TOKEN" -o -z "$NETLIFY_SITE_ID" ]; then
  echo "ERROR: empty variable NETLIFY_AUTH_TOKEN, NETLIFY_SITE_ID"
  echo "No deployment"
  exit 1
fi

# Install netlify-cli
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs
npm --version
sudo npm install -g netlify-cli

# Extract front files from previously docker images
make export-front-all
APP_VERSION="$(./ci/version.sh)"

cd candilibV2-$APP_VERSION-dist

# Generate route files (/api -> http://API/)
cat > dist/_redirects <<EOF
/candilib/api/* https://$HEROKU_APP.herokuapp.com/api/:splat 200
/candilib-repartiteur/api/* https://$HEROKU_APP.herokuapp.com/api/:splat 200
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
netlify deploy --prod --dir=dist --message "Deploy $APP_VERSION" --json | tee -a netlify.json

deploy_id="$(cat netlify.json |jq -re '.deploy_id')"

curl_args="--fail --retry 10 --retry-delay 5 --retry-max-time 60 --connect-timeout 10 "
# lock deployment
curl ${curl_args} -o /dev/null -X POST -H "Content-Type: application/json" \
  -d '{}' \
  https://api.netlify.com/api/v1/deploys/${deploy_id}/lock?access_token=${NETLIFY_AUTH_TOKEN} \
  || exit $?
echo "lock: $?"

# publish file
curl ${curl_args} -o /dev/null -X POST -H "Content-Type: application/json" \
  -d '{}' \
  https://api.netlify.com/api/v1/deploys/${deploy_id}/restore?access_token=${NETLIFY_AUTH_TOKEN} \
  || exit $?
echo "Publish: $?"

fi

exit 0
