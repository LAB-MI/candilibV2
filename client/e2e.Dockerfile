#######################
# Step 1: Base target #
#######################
FROM cypress/base:12.4.0 as base
ARG http_proxy
ARG https_proxy
ARG npm_registry
ARG no_proxy

# Base dir /app
WORKDIR /app
# Expose the listening port of your app
EXPOSE 8000
EXPOSE 8025

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
COPY tests tests/
COPY package.json package-lock.json ./
COPY cypress.json cypress.env.json ./
# Install app dependencies
RUN npm --no-git-tag-version version ${APP_VERSION} ; npm install cypress-file-upload cypress-mailhog

#CMD ["npm", "start"]
CMD ["npm","run", "cypress"]