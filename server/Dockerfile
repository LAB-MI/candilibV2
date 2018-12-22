# Stage 1: Builder image
FROM node:8-slim AS builder
ARG proxy
ARG npm_registry
ARG no_proxy

WORKDIR /app

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo "Europe/Paris" > /etc/timezone
# use proxy & private npm registry
RUN if [ ! -z "$proxy" ] ; then \
        npm config delete proxy; \
        npm config set proxy $proxy; \
        npm config set https-proxy $proxy ; \
        npm config set no-proxy $no_proxy; \
   fi ; \
   [ -z "$npm_registry" ] || npm config set registry=$npm_registry

COPY . ./
# Install dependencies and build whatever you have to build 
# (babel, grunt, webpack, etc.)
RUN set -ex ; npm install pm2 -g ; \
    npm install && \
    npm run build

EXPOSE 8000
CMD ["npm", "start"]
###############################################################################
# Step 2 : Run image (production mode)
#
FROM node:8-slim
ENV NODE_ENV=production
WORKDIR /app

# Install deps for production only
COPY ./package* ./
RUN npm install && \
    npm cache clean --force
# Copy builded source from the upper builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 8000
CMD ["npm", "start"]
#CMD ["pm2-runtime", "processes.json"]
