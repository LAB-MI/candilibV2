
SHELL := /bin/bash

APP_VERSION := v1.bis.dev

DOCKER := $(shell type -p docker)
DC     := $(shell type -p docker-compose)
http_proxy := $(shell echo $$http_proxy)
no_proxy := $(shell echo $$no_proxy)
NPM_REGISTRY := $(shell echo $$NPM_REGISTRY)
SASS_REGISTRY := $(shell echo $$SASS_REGISTRY)
CYPRESS_DOWNLOAD_MIRROR := $(shell echo $$CYPRESS_DOWNLOAD_MIRROR)

DC_APP_BUILD_DEV := docker-compose.dev.yml
