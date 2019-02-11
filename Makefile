### wrapper around docker-compose

# default variables
include Makefile.mk

# import ENV config
# override default config with `make cnf="config_special.env" build up`
cnf ?= .env
dummy_cnf := $(shell touch $(cnf) )
include $(cnf)
export $(shell sed 's/=.*//' $(cnf))

# HELP (make help)
.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

check-prerequisites:
ifeq ("$(wildcard ${DOCKER})","")
	@echo "docker not found" ; exit 1
endif
ifeq ("$(wildcard ${DC})","")
	@echo "docker-compose not found" ; exit 1
endif

#
# Build dev
#
build-dev: check-build-config-dev ## Build the release and development image
	${DC} -f ${DC_APP_BUILD_DEV} build ${DC_BUILD_ARGS}

check-build-config-dev: check-prerequisites ## Check development docker-compose syntax
	${DC} -f $(DC_APP_BUILD_DEV) config -q
#
# Run dev
#
up-dev: check-up-config-dev ## Run container in development mode
	${DC} -f ${DC_APP_RUN_DEV} up ${DC_BUILD_ARGS}
up-dev-api: check-up-config-dev ## Run container in development mode
	${DC} -f ${DC_APP_RUN_DEV} up ${DC_BUILD_ARGS} api
up-dev-db: check-up-config-dev ## Run container in development mode
	${DC} -f ${DC_APP_RUN_DEV} up ${DC_BUILD_ARGS} db
check-up-config-dev: check-prerequisites ## Check development compose syntax
	${DC} -f $(DC_APP_RUN_DEV) config -q
down-dev: ## Down container in development mode
	${DC} -f ${DC_APP_RUN_DEV} down
stop-dev: ## Stop container in development mode
	${DC} -f ${DC_APP_RUN_DEV} stop
stop-dev-api: ## Stop container in development mode
	${DC} -f ${DC_APP_RUN_DEV} stop api
stop-dev-db: ## Stop container in development mode
	${DC} -f ${DC_APP_RUN_DEV} stop db
#
# Build prod (all in one)
#
build-prod: check-build-config-prod ## Build the release and production image
	${DC} -f ${DC_APP_BUILD_PROD} build ${DC_BUILD_ARGS}
check-build-config-prod: check-prerequisites ## Check development docker-compose syntax
	${DC} -f $(DC_APP_BUILD_PROD) config -q
#
# run prod (all containers in one compose)
#
up-prod: check-config-prod  ## Run containers in production mode
	${DC} -f ${DC_APP_RUN_PROD} up ${DC_RUN_ARGS}
up-prod-api: check-config-prod
	${DC} -f ${DC_APP_RUN_PROD} up ${DC_RUN_ARGS} api
up-prod-db: check-config-prod
	${DC} -f ${DC_APP_RUN_PROD} up ${DC_RUN_ARGS} db
check-config-prod: check-prerequisites ## Check production compose syntax
	${DC} -f $(DC_APP_RUN_PROD) config -q
down-prod: ## Stop containers in production mode
	${DC} -f ${DC_APP_RUN_PROD} down
stop-prod: ## Stop all container in production mode
	${DC} -f ${DC_APP_RUN_PROD} stop
stop-prod-api: ## Stop api container in production mode
	${DC} -f ${DC_APP_RUN_PROD} stop api
stop-prod-db: ## Stop db container in production mode
	${DC} -f ${DC_APP_RUN_PROD} stop db
#
# Build prod (separate container per compose)
#
build: check-prerequisites build-dir build-archive build-prod ## Create archive, Build production images

build-all: build-db build-api build-front-candidat build-front-admin ## Build the release and production (web && && api && db)
#
# All container front candidat + front admin + api + db
#
up-all: check-prerequisites network-up up-db wait-db up-api up-front-candidat up-front-admin ## Build the release and production (web && && api && db)
down-all: down-front-candidat down-front-admin down-api down-db network-down  ## Build the release and production (web && && api && db)

network-up:
	@echo creating ${APP}-network docker network
	@docker network create --opt com.docker.network.driver.mtu=1450 ${APP}-network 2>/dev/null || true
network-down:
	@echo cleaning ${APP}-network docker network
	docker network rm ${APP}-network || true

#
# front candidat
#
build-front-candidat:
check-build-front-candidat:
up-front-candidat:
down-front-candidat:
stop-front-candidat:
#
# front admin
#
build-front-admin:
check-build-front-admin:
up-front-admin:
down-front-admin:
stop-front-admin:
#
# api
#
build-api: check-build-api ## Build api container
	${DC} -f ${DC_APP_API_BUILD_PROD} build ${DC_BUILD_ARGS} api
check-build-api: ## Check api docker-compose syntax
	${DC} -f $(DC_APP_API_BUILD_PROD) config
up-api: check-up-api network-up ## Build api container
	${DC} -f ${DC_APP_API_RUN_PROD} up ${DC_RUN_ARGS} api
check-up-api: ## Check api docker-compose syntax
	${DC} -f $(DC_APP_API_RUN_PROD) config
down-api: ## Down api container
	${DC} -f ${DC_APP_API_RUN_PROD} down
stop-api: ## Stop api container
	${DC} -f ${DC_APP_API_RUN_PROD} stop api
#
# db
#
build-db: check-build-db ## Build db container
	${DC} -f ${DC_APP_DB_BUILD_PROD} pull db
	${DC} -f ${DC_APP_DB_BUILD_PROD} build ${DC_BUILD_ARGS} db
check-build-db: ## Check db docker-compose syntax
	${DC} -f $(DC_APP_DB_BUILD_PROD) config
up-db: check-up-db network-up ## Build db container
	${DC} -f ${DC_APP_DB_RUN_PROD} up ${DC_RUN_ARGS} db
check-up-db: ## Check db docker-compose syntax
	${DC} -f $(DC_APP_DB_RUN_PROD) config
down-db: ## Build db container
	${DC} -f ${DC_APP_DB_RUN_PROD} down
stop-db: ## Down db container
	${DC} -f ${DC_APP_DB_RUN_PROD} stop db
#
# save images
#
save-images: build-dir save-image-db save-image-api ## Save images

save-image-db: ## Save db image
	db_image_name=$$(${DC} -f $(DC_APP_DB_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["db"]["image"]') ; \
          docker image save -o  $(BUILD_DIR)/$(FILE_IMAGE_DB_APP_VERSION) $$db_image_name && \
          cp $(BUILD_DIR)/$(FILE_IMAGE_DB_APP_VERSION) $(BUILD_DIR)/$(FILE_IMAGE_DB_LATEST_VERSION)

save-image-api: ## Save api image
	api_image_name=$$(${DC} -f $(DC_APP_API_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["api"]["image"]') ; \
          docker image save -o  $(BUILD_DIR)/$(FILE_IMAGE_API_APP_VERSION) $$api_image_name && \
          cp $(BUILD_DIR)/$(FILE_IMAGE_API_APP_VERSION)  $(BUILD_DIR)/$(FILE_IMAGE_API_LATEST_VERSION)

#
# clean image
#
clean-images: clean-image-api clean-image-db ## Remove all docker images

clean-image-db: ## Remove db docker image
	db_image_name=$$(${DC} -f $(DC_APP_DB_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["db"]["image"]') ; \
          docker rmi $$db_image_name || true

clean-image-api: ## Remove api docker image
	api_image_name=$$(${DC} -f $(DC_APP_API_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["api"]["image"]') ; \
          docker rmi $$api_image_name || true

build-dir:
	if [ ! -d "$(BUILD_DIR)" ] ; then mkdir -p $(BUILD_DIR) ; fi

clean-dir:
	if [ -d "$(BUILD_DIR)" ] ; then rm -rf $(BUILD_DIR) ; fi

build-archive: clean-archive build-dir ## Build archive
	@bash ci/archive.sh

clean-archive:
	@echo "Clean $(APP) archive"
	rm -rf $(FILE_ARCHIVE_APP_VERSION)

#
# publish
#
publish: publish-$(APP_VERSION) publish-$(LATEST_VERSION) ## Publish all artifacts (archives,docker images)

publish-$(APP_VERSION):
	@echo "Publish $(APP) $(APP_VERSION) artifacts"
	if [ -z "${PUBLISH_URL}" -o -z "${PUBLISH_AUTH_TOKEN}" ] ; then exit 1; fi
	for file in \
		"${APP}-VERSION ${APP}-VERSION" \
		"${FILE_ARCHIVE_APP_VERSION} ${FILE_ARCHIVE_APP_VERSION}" \
		"${FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION} ${FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION}" \
		"${FILE_IMAGE_FRONT_ADMIN_APP_VERSION} ${FILE_IMAGE_FRONT_ADMIN_APP_VERSION}" \
		"${FILE_IMAGE_API_APP_VERSION} ${FILE_IMAGE_API_APP_VERSION}" \
		"${FILE_IMAGE_DB_APP_VERSION} ${FILE_IMAGE_DB_APP_VERSION}" \
		; do \
	  echo "$${file}" | while read src dst ; do bash ci/publish.sh $${src} $${dst} ${APP_VERSION} ; done ; \
	done ; \
	curl -k -H 'X-Auth-Token: ${PUBLISH_AUTH_TOKEN}' "${PUBLISH_URL}/${PUBLISH_URL_BASE}?prefix=${APP_VERSION}/&format=json" -s --fail ;

publish-$(LATEST_VERSION):
	@echo "Publish $(APP) $(LATEST_VERSION) artifacts"
	if [ -z "${PUBLISH_URL}" -o -z "${PUBLISH_AUTH_TOKEN}" ] ; then exit 1; fi
	for file in \
		"${APP}-VERSION ${APP}-VERSION" \
		"${FILE_ARCHIVE_APP_VERSION} ${FILE_ARCHIVE_LATEST_VERSION}" \
		"${FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION} ${FILE_IMAGE_FRONT_CANDIDAT_LATEST_VERSION}" \
		"${FILE_IMAGE_FRONT_ADMIN_APP_VERSION} ${FILE_IMAGE_FRONT_ADMIN_LATEST_VERSION}" \
		"${FILE_IMAGE_API_APP_VERSION} ${FILE_IMAGE_API_LATEST_VERSION}" \
		"${FILE_IMAGE_DB_APP_VERSION} ${FILE_IMAGE_DB_LATEST_VERSION}" \
		; do \
	  echo "$${file}" | while read src dst ; do bash ci/publish.sh $${src} $${dst} ${LATEST_VERSION} ; done ; \
	done ; \
	curl -k -H 'X-Auth-Token: ${PUBLISH_AUTH_TOKEN}' "${PUBLISH_URL}/${PUBLISH_URL_BASE}?prefix=${LATEST_VERSION}/&format=json" -s --fail
#
# test
#
test-all: wait-db test-up-db test-up-api # test-up-$(APP) ## Test running container (db,app)

wait-db: ## wait db up and running
	time bash -x tests/wait-db.sh
test-up-api: ## test api container up and runnng
	time bash -x tests/test-up-api.sh
test-up-db: ## test db container up and runnng
	time bash -x tests/test-up-db.sh
test-up-${APP}: ## test app up and running
	time bash tests/test-up-${APP}.sh
