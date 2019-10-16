#######################
# Step 1: Base target #
#######################
FROM node:12.3.1-slim as base
ARG http_proxy
ARG https_proxy
ARG npm_registry
ARG no_proxy

# Base dir /app
WORKDIR /app
# Expose the listening port of your app
EXPOSE 8000

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo "Europe/Paris" > /etc/timezone
# use proxy & private npm registry
RUN if [ ! -z "$http_proxy" ] ; then \
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
COPY src src/
COPY package.json package-lock.json ecosystem.config.js ./
# Install app dependencies
RUN npm --no-git-tag-version version ${APP_VERSION} ; npm install
ENV NODE_ICU_DATA="/app/node_modules/full-icu"

#CMD ["npm", "start"]
CMD ["npm","run",  "dev"]

###############################
# Step 3: "production" target #
###############################

FROM development as production
ARG NPM_AUDIT_DRY_RUN
ENV NODE_ENV=production
ARG APP_VERSION
# Install production dependencies and clean cache
RUN npm --no-git-tag-version version ${APP_VERSION} && \
    npm install --production && \
    npm config set audit-level moderate && \
    npm audit --json --registry=https://registry.npmjs.org || ${NPM_AUDIT_DRY_RUN:-false} && \
    npm cache clean --force

# Install pm2
RUN npm install pm2 -g
# Copy the pm2 config
COPY ecosystem.config.js .

CMD [ "pm2-runtime", "start", "ecosystem.config.js", "--env", "production" ]
