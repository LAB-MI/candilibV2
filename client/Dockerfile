#######################
# Step 1: Base target #
#######################
FROM node:12.3.1-slim as base
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
   [ -z "$npm_registry" ] || npm config set registry=$npm_registry; \
   [ -z "$sass_registry" ] || npm config set sass_binary_site=$sass_registry;

################################
# Step 2: "development" target #
################################
FROM base as development
ARG CYPRESS_DOWNLOAD_MIRROR
ARG APP_VERSION
ARG http_proxy
ARG https_proxy
ARG no_proxy

ENV CI=1
COPY public ./public
COPY src ./src
COPY tests ./tests
COPY .env.candidat .env.admin ./
COPY babel.config.js cypress.json jsconfig.json package-lock.json package.json vue.config.js ./
# Install app dependencies

RUN set -ex; npm --no-git-tag-version version ${APP_VERSION} ; CYPRESS_INSTALL_BINARY=0 npm install --loglevel http
EXPOSE 8080

CMD ["npm","run", "serve"]

FROM development as storybook
EXPOSE 6006
CMD ["npm", "run", "storybook:serve" ]


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
ARG APP_VERSION
# Copy the transpiled code to use in production (in /app)
COPY --from=build /app/dist ./dist
COPY package.json package-lock.json ./
# Install production dependencies and clean cache
RUN npm --no-git-tag-version version ${APP_VERSION} && \
    npm install --production && \
    npm config set audit-level moderate && \
    npm audit --json --registry=https://registry.npmjs.org || ${NPM_AUDIT_DRY_RUN:-false} && \
    npm cache clean --force

# Deliver the dist folder with Nginx
FROM nginx:stable as nginx-production
ARG CLIENT_BUILD_TARGET
ARG PUBLIC_PATH
COPY --from=production /app/dist /usr/share/nginx/html
COPY nginx/nginx-run-${CLIENT_BUILD_TARGET}.template /etc/nginx/conf.d/default.template
COPY nginx/nginx.template /etc/nginx/nginx.template
COPY nginx/run.sh /run.sh
RUN [ -f "/run.sh" ] && chmod +x /run.sh ; sed -i -e "s|<PUBLIC_PATH>|${PUBLIC_PATH}|g;" /etc/nginx/conf.d/default.template

CMD ["/run.sh"]

###############################
# Step 5: "e2e" target        #
###############################
FROM nginx:stable as e2e
ARG CLIENT_BUILD_TARGET
ARG PUBLIC_PATH
ARG MIRROR_DEBIAN
COPY --from=production /app/dist /usr/share/nginx/html
COPY nginx/nginx-run-${CLIENT_BUILD_TARGET}.template /etc/nginx/conf.d/default.template
COPY nginx/nginx.template /etc/nginx/nginx.template
COPY nginx/e2e-run.sh /e2e-run.sh
RUN [ -f "/e2e-run.sh" ] && chmod +x /e2e-run.sh ; sed -i -e "s|<PUBLIC_PATH>|${PUBLIC_PATH}|g;" /etc/nginx/conf.d/default.template ; \
    runDeps="faketime libfaketime" ; \
     echo "$http_proxy $no_proxy" && set -x && [ -z "$MIRROR_DEBIAN" ] || \
     sed -i.orig -e "s|http://deb.debian.org\([^[:space:]]*\)|$MIRROR_DEBIAN/debian10|g ; s|http://security.debian.org\([^[:space:]]*\)|$MIRROR_DEBIAN/debian10-security|g" /etc/apt/sources.list ; \
  apt-get update -qq && \
  apt-get install -qy --no-install-recommends $buildDeps $runDeps
CMD ["/e2e-run.sh"]
