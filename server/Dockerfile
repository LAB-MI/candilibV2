#######################
# Step 1: Base target #
#######################
FROM node:16.14.2-stretch-slim as base
ARG http_proxy
ARG https_proxy
ARG npm_registry
ARG no_proxy

# Base dir /app
WORKDIR /app
RUN chown node:node /app
# Expose the listening port of your app
EXPOSE 8000

# use proxy & private npm registry
# With internal npm repo (autosigned) disable strict ssl : strict-ssl false
# ENV TZ="Europe/Paris" #Ne Pas mettre à cause des sources existant developpé sans TZ
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo "Europe/Paris" > /etc/timezone ;
RUN if [ ! -z "$http_proxy" ] ; then \
        npm config delete proxy; \
        npm config set proxy $http_proxy; \
        npm config set https-proxy $https_proxy ; \
        npm config set no-proxy $no_proxy; \
   fi ; \
   [ -z "$npm_registry" ] || npm config set registry=$npm_registry ; \
   [ -z "$npm_registry" ] || npm config set strict-ssl false

################################
# Step 2: "development" target #
################################
FROM base as development
ARG MIRROR_DEBIAN
ARG APP_VERSION
ARG MONGOMS_VERSION

RUN (set -x && [ -z "$MIRROR_DEBIAN" ] || sed -i.orig -e "s|http://deb.debian.org\([^[:space:]]*\)|$MIRROR_DEBIAN/debian9|g ; s|http://security.debian.org\([^[:space:]]*\)|$MIRROR_DEBIAN/debian9-security|g" /etc/apt/sources.list) ; \
      buildPkgs="libcurl3 libssl1.1" ; \
      apt-get update && apt-get install -y --no-install-recommends $buildPkgs

COPY src src/
COPY babel.config.js package.json package-lock.json ./
# Install package utils for development
# Install app dependencies
RUN npm --no-git-tag-version version ${APP_VERSION} ; npm ci
ENV NODE_ICU_DATA="/app/node_modules/full-icu"
USER node
#CMD ["npm", "start"]
CMD ["npm","run",  "dev"]

##########################
# Step 3: "build" target #
##########################
FROM development as build
ARG MONGOMS_VERSION
ENV NPM_CONFIG_LOGLEVEL warn
# Transpile the code with babel
RUN npm run build

USER root
RUN buildPkgs="libcurl3 libssl1.1" ; \
      apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false $buildPkgs ; \
      rm -rf /var/lib/apt/lists/* # remove the cached files



###############################
# Step 4: "production" target #
###############################

FROM build as production
ARG NPM_AUDIT_DRY_RUN
ENV NODE_ENV=production
ARG APP_VERSION

COPY package.json package-lock.json ./
COPY ci ci/
# Copy the pm2 config
COPY ecosystem.config.js .
# Copy the transpiled code to use in production (in /app)
COPY --from=build /app/dist ./dist
# Install production dependencies and clean cache
RUN unset NODE_ICU_DATA && \
    npm --no-git-tag-version version ${APP_VERSION} && \
    npm ci --production && \
    npm config set audit-level moderate && \
    npm audit --json --registry=https://registry.npmjs.org --production || ${NPM_AUDIT_DRY_RUN:-false} && \
    npm cache clean --force ; \
    npm install pm2 -g
ENV NODE_ICU_DATA="/app/node_modules/full-icu"

CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "production" ]
