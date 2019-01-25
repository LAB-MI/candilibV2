include Makefile.inc

build-dev:
	${DC} -f ${DC_APP_BUILD_DEV} build --no-cache

up-dev:
	${DC} -f ${DC_APP_BUILD_DEV} up

down-dev:
	${DC} -f ${DC_APP_BUILD_DEV} down

db-up-dev:
	${DC} -f ${DC_APP_BUILD_DEV} up db

db-down-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} down db

api-up-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} up api

api-down-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} up down
