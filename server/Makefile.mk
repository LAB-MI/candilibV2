
SHELL := /bin/bash

APP_VERSION := v1.bis.dev

DOCKER := $(shell type -p docker)
DC     := $(shell type -p docker-compose)
DC := $(if $(DC),$(DC),${DOCKER} compose)

http_proxy := $(shell echo $$http_proxy)
no_proxy := $(shell echo $$no_proxy)

DC_APP_BUILD_DEV := docker-compose.dev.yml

DB_CONTAINER_NAME := candilib_db.${APP_VERSION}
API_CONTAINER_NAME := candilib_api.${APP_VERSION}

TENANT_NAME := $(shell hostname)