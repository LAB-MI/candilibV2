include Makefile.mk

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

api-build-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} build api

api-up-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} up api

api-down-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} down api

fake-stmp-up: 
	${DC} -f ${DC_APP_BUILD_DEV} up fakesmtp
fake-stmp-down: 
	${DC} -f ${DC_APP_BUILD_DEV} down fakesmtp

mailhog-up:
	${DC} -f ${DC_APP_BUILD_DEV} up mailhog
	
mongo-express-up: 
	${DC} -f ${DC_APP_BUILD_DEV} up mongo-express
mongo-express-down: 
	${DC} -f ${DC_APP_BUILD_DEV} down mongo-express
