#######################
# Step 1: Base target #
#######################
FROM node:12.13.1-slim as base
ARG http_proxy
ARG https_proxy
ARG npm_registry
ARG no_proxy

# Base dir /app
WORKDIR /app
# Expose the listening port of your app
EXPOSE 8090

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo "Europe/Paris" > /etc/timezone ; \
# use proxy & private npm registry
    if [ ! -z "$http_proxy" ] ; then \
        npm config delete proxy; \
        npm config set proxy $http_proxy; \
        npm config set https-proxy $https_proxy; \
        npm config set no-proxy $no_proxy; \
   fi ; \
   [ -z "$npm_registry" ] || npm config set registry=$npm_registry

################################
# Step 2: "development" target #
################################
FROM base as development
ARG APP_VERSION
COPY app.js index.js ./
COPY package.json package-lock.json ./
# Install app dependencies
RUN npm --no-git-tag-version version ${APP_VERSION} ; npm install

CMD ["npm", "start"]