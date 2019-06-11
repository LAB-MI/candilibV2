include Makefile.mk

build-dev:
	${DC} -f ${DC_APP_BUILD_DEV} build --no-cache

up-dev:
	${DC} -f ${DC_APP_BUILD_DEV} up

down-dev:
	${DC} -f ${DC_APP_BUILD_DEV} down


front-build-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} build front_all

front-up-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} up front_all

front-down-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} down front_all

story-build-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} build storybook

story-up-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} up storybook

story-down-dev: 
	${DC} -f ${DC_APP_BUILD_DEV} down storybook
