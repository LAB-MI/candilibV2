#######################
# Step 1: Base target #
#######################
FROM node:10-slim as base
ARG http_proxy
ARG https_proxy
ARG npm_registry
ARG sass_registry
ARG no_proxy

# Base dir /app
WORKDIR /app

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo "Europe/Paris" > /etc/timezone
# use proxy & private npm registry
RUN if [ ! -z "$http_proxy" ] ; then \
        npm config delete proxy; \
        npm config set proxy $http_proxy; \
        npm config set https-proxy $https_proxy ; \
        npm config set no-proxy $no_proxy; \
   fi ; \
   [ -z "$npm_registry" ] || npm config set registry=$npm_registry ; \
   [ -z "$sass_registry" ] || npm config set sass_binary_site=$sass_registry

################################
# Step 2: "development" target #
################################
FROM base as development
ARG CYPRESS_DOWNLOAD_MIRROR
ENV CI=1
COPY public ./public
COPY src ./src
COPY tests ./tests
COPY .env.candidat .env.admin ./
COPY babel.config.js cypress.json jsconfig.json package-lock.json package.json vue.config.js ./
# Install app dependencies
RUN npm install

CMD ["npm","run", "serve"]

##########################
# Step 3: "build" target #
##########################
FROM development as build
ENV NPM_CONFIG_LOGLEVEL warn
ARG CLIENT_BUILD_TARGET
# Transpile the code with babel
#RUN set -x ; npm run format && npm run lint && npm run test && npm run build:${CLIENT_BUILD_TARGET}
RUN set -x ; npm run format && npm run test && npm run build:${CLIENT_BUILD_TARGET}

###############################
# Step 4: "production" target #
###############################

FROM build as production
ARG NPM_AUDIT_DRY_RUN
ENV NODE_ENV=production
# Copy the transpiled code to use in production (in /app)
COPY --from=build /app/dist ./dist
COPY package.json package-lock.json ./
# Install production dependencies and clean cache
RUN npm install --production && \
    npm config set audit-level moderate && \
    npm audit --json --registry=https://registry.npmjs.org || ${NPM_AUDIT_DRY_RUN:-false} && \
    npm cache clean --force

# Deliver the dist folder with Nginx
FROM nginx:stable
ARG CLIENT_BUILD_TARGET
COPY --from=production /app/dist /usr/share/nginx/html
COPY nginx/nginx-run-${CLIENT_BUILD_TARGET}.template /etc/nginx/conf.d/default.template
COPY nginx/nginx.template /etc/nginx/nginx.template
COPY nginx/run.sh /run.sh
RUN [ -f "/run.sh" ] && chmod +x /run.sh

CMD ["/run.sh"]

