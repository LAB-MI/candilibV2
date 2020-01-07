SHELL := /bin/bash
APP   := candilibV2
# get version (from git or static VERSION file)
APP_VERSION := $(shell bash ./ci/version.sh 2>&- || cat VERSION)
LATEST_VERSION := latest

APP_PATH       := $(shell pwd)
APP_FRONT_PATH := $(APP_PATH)/client
APP_API_PATH   := $(APP_PATH)/server
APP_DB_PATH    := $(APP_PATH)/server

BUILD_DIR     := ${APP_PATH}/${APP}-${APP_VERSION}-build
ARCHIVE_DIR   := ${APP_PATH}/${APP}-${APP_VERSION}
DIST_DIR      := ${APP_PATH}/${APP}-${APP_VERSION}-dist

# binaries
DOCKER   := $(shell type -p docker)
DC       := $(shell type -p docker-compose)
http_proxy    := $(shell echo $$http_proxy)
https_proxy    := $(shell echo $$https_proxy)
no_proxy := $(shell echo $$no_proxy)

# detect tty
DOCKER_USE_TTY := $(shell test -t 1 && echo "-t" )
DC_USE_TTY     := $(shell test -t 1 || echo "-T" )

# cli docker-compose
DC_BUILD_ARGS := --pull --no-cache --force-rm
DC_RUN_ARGS   := -d --no-build

# docker-compose file: development (build or run time)
# (all containers in one compose)
DC_APP_BUILD_DEV := $(APP_API_PATH)/docker-compose.dev.yml
DC_APP_RUN_DEV   := $(APP_API_PATH)/docker-compose.dev.yml
# (one container in one compose)
DC_APP_FRONT_CANDIDAT_BUILD_DEV  := $(APP_FRONT_PATH)/docker-compose.dev.yml
DC_APP_FRONT_ADMIN_BUILD_DEV  := $(APP_FRONT_PATH)/docker-compose.dev.yml
DC_APP_API_BUILD_DEV   := $(APP_API_PATH)/docker-compose.dev.yml
DC_APP_API_RUN_DEV     := $(APP_API_PATH)/docker-compose.dev.yml
DC_APP_DB_BUILD_DEV    := $(APP_DB_PATH)/docker-compose.dev.db.yml
DC_APP_DB_RUN_DEV      := $(APP_DB_PATH)/docker-compose.dev.db.yml

# docker-compose file: production (build or run time)
# (all containers in one compose)
DC_APP_BUILD_PROD := $(APP_API_PATH)/docker-compose.prod.all.yml
DC_APP_RUN_PROD   := $(APP_API_PATH)/docker-compose.prod.all.yml
# (one container in one compose)
DC_APP_FRONT_CANDIDAT_BUILD_PROD := $(APP_FRONT_PATH)/docker-compose.prod.front.yml
DC_APP_FRONT_CANDIDAT_RUN_PROD := $(APP_FRONT_PATH)/docker-compose.prod.front.yml
DC_APP_FRONT_ADMIN_BUILD_PROD    := $(APP_FRONT_PATH)/docker-compose.prod.front.yml
DC_APP_FRONT_ADMIN_RUN_PROD    := $(APP_FRONT_PATH)/docker-compose.prod.front.yml
DC_APP_API_BUILD_PROD            := $(APP_API_PATH)/docker-compose.prod.api.yml
DC_APP_API_RUN_PROD              := $(APP_API_PATH)/docker-compose.prod.api.yml
DC_APP_DB_BUILD_PROD             := $(APP_DB_PATH)/docker-compose.prod.db.yml
DC_APP_DB_RUN_PROD               := $(APP_DB_PATH)/docker-compose.prod.db.yml
# tests e2e
DC_APP_E2E_BUILD_PROD            := $(APP_FRONT_PATH)/docker-compose.e2e.yml
DC_APP_E2E_RUN_PROD              := $(APP_FRONT_PATH)/docker-compose.e2e.yml

# source archive
FILE_ARCHIVE_APP_VERSION = $(APP)-$(APP_VERSION)-archive.tar.gz
FILE_ARCHIVE_LATEST_VERSION = $(APP)-$(LATEST_VERSION)-archive.tar.gz
 
FILE_FRONT_CANDIDAT_APP_VERSION = $(APP)-front-candidat-$(APP_VERSION)-archive.tar.gz
FILE_FRONT_ADMIN_APP_VERSION = $(APP)-front-admin-$(APP_VERSION)-archive.tar.gz

# docker image name save
FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION = $(APP)-front-candidat-$(APP_VERSION)-image.tar.gz
FILE_IMAGE_FRONT_CANDIDAT_LATEST_VERSION = $(APP)-front-candidat-$(LATEST_VERSION)-image.tar.gz

FILE_IMAGE_FRONT_ADMIN_APP_VERSION = $(APP)-front-admin-$(APP_VERSION)-image.tar.gz
FILE_IMAGE_FRONT_ADMIN_LATEST_VERSION = $(APP)-front-admin-$(LATEST_VERSION)-image.tar.gz

FILE_IMAGE_API_APP_VERSION = $(APP)-api-$(APP_VERSION)-image.tar.gz
FILE_IMAGE_API_LATEST_VERSION = $(APP)-api-$(LATEST_VERSION)-image.tar.gz

FILE_IMAGE_DB_APP_VERSION = $(APP)-db-$(APP_VERSION)-image.tar.gz
FILE_IMAGE_DB_LATEST_VERSION = $(APP)-db-$(LATEST_VERSION)-image.tar.gz

# Publish URL (docker image and archive)
PUBLISH_AUTH_TOKEN         :=
PUBLISH_URL                :=
PUBLISH_URL_BASE           := ${APP}-docker-images
PUBLISH_URL_APP_VERSION    := $(PUBLISH_URL_BASE)/$(APP_VERSION)
PUBLISH_URL_LATEST_VERSION := $(PUBLISH_URL_BASE)/$(LATEST_VERSION)

curl_opt=--retry 10 --retry-delay 5 --retry-max-time 60 --connect-timeout 10 --fail
curl_progress_bar=--progress-bar --write 'Downloaded %{url_effective} %{size_download} bytes in %{time_connect} seconds (%{speed_download} bytes/s)\n'

# escape dollar
dollar = $(shell echo \$$)

# Build env
#  Private npm miror
NPM_REGISTRY  := $(shell echo $$NPM_REGISTRY )
SASS_REGISTRY  := $(shell echo $$SASS_REGISTRY )
CYPRESS_DOWNLOAD_MIRROR  := $(shell echo $$CYPRESS_DOWNLOAD_MIRROR )
NPM_AUDIT_DRY_RUN  := $(shell echo $$NPM_AUDIT_DRY_RUN )

# Run env
LINE_DELAY := $(shell [ -n "$$LINE_DELAY" ] && echo $$LINE_DELAY )

# Reverse proxy (nginx)
API_USER_SCOPE=http_x_forwarded_for
API_USER_LIMIT_RATE=10r/s
API_USER_BURST=5 nodelay
APP_USER_LIMIT_RATE=30r/s
APP_USER_BURST=80 nodelay

# export all variables in subshell
export
