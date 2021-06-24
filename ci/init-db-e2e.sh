#!/bin/bash
SETUP_DIR=server/dev-setup
SRC_DIR=server/src
MONGO_URL=$(docker exec -i ${DOCKER_USE_TTY} candilib_api bash -c 'echo $MONGO_URL')
candilib_api_image=$(docker inspect candilib_api --format "{{.Image}}")
candilib_api_network=$(docker inspect candilib_api --format "{{.HostConfig.NetworkMode}}")
docker run -i ${DOCKER_USE_TTY} -v $(pwd)/${SETUP_DIR}:/app/dev-setup -v $(pwd)/${SRC_DIR}:/app/src -e MONGO_URL=$MONGO_URL --network ${candilib_api_network} --rm --link candilib_api:api_init ${candilib_api_image}  /bin/bash -c '( unset NODE_ENV && cd /app && export MONGO_URL && npm i @babel/register && npm i dotenv && npm run dev-setup ) '
# recreation index
docker restart candilib_api
