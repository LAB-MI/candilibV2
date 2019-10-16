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
up-dev-scheduler: check-up-config-dev ## Run container in development mode
	${DC} -f ${DC_APP_RUN_DEV} up ${DC_BUILD_ARGS} scheduler
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
stop-dev-scheduler: ## Stop container in development mode
	${DC} -f ${DC_APP_RUN_DEV} stop scheduler
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
up-prod-scheduler: check-config-prod
	${DC} -f ${DC_APP_RUN_PROD} up ${DC_RUN_ARGS} scheduler
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

up-all-in-one: check-prerequisites network-up ## Run containers in production mode
	${DC} \
		-f ${DC_APP_DB_RUN_PROD} \
		-f ${DC_APP_API_RUN_PROD} \
		-f ${DC_APP_SCHEDULER_RUN_PROD} \
		-f ${DC_APP_FRONT_CANDIDAT_RUN_PROD} \
		-f ${DC_APP_FRONT_ADMIN_RUN_PROD} \
              up ${DC_RUN_ARGS}

stop-all-in-one: check-prerequisites ## Run containers in production mode
	${DC} \
		-f ${DC_APP_DB_RUN_PROD} \
		-f ${DC_APP_API_RUN_PROD} \
		-f ${DC_APP_SCHEDULER_RUN_PROD} \
		-f ${DC_APP_FRONT_CANDIDAT_RUN_PROD} \
		-f ${DC_APP_FRONT_ADMIN_RUN_PROD} \
             stop

down-all-in-one: check-prerequisites network-down ## Run containers in production mode
	${DC} \
		-f ${DC_APP_DB_RUN_PROD} \
		-f ${DC_APP_API_RUN_PROD} \
		-f ${DC_APP_SCHEDULER_RUN_PROD} \
		-f ${DC_APP_FRONT_CANDIDAT_RUN_PROD} \
		-f ${DC_APP_FRONT_ADMIN_RUN_PROD} \
             down

#
# front-back: up/down front+back (without db)
#
download-image-front-back: download-image-front-back-${ENABLE_FEATURE}
download-image-front-back-without-scheduler: download-image-front-candidat download-image-front-admin download-image-api
download-image-front-back-with-scheduler: download-image-front-candidat download-image-front-admin download-image-api download-image-scheduler
load-image-front-back: load-image-front-back-${ENABLE_FEATURE}
load-image-front-back-without-scheduler: load-image-front-candidat load-image-front-admin load-image-api
load-image-front-back-with-scheduler: load-image-front-candidat load-image-front-admin load-image-api load-image-scheduler
up-front-back: up-front-back-${ENABLE_FEATURE}
up-front-back-without-scheduler: up-front-candidat up-front-admin up-api
up-front-back-with-scheduler: up-front-candidat up-front-admin up-api up-scheduler
down-front-back: down-front-back-${ENABLE_FEATURE}
down-front-back-without-scheduler: down-front-candidat down-front-admin down-api
down-front-back-with-scheduler: down-front-candidat down-front-admin down-api down-scheduler
stop-front-back: stop-front-back-${ENABLE_FEATURE}
stop-front-back-without-scheduler: stop-front-candidat stop-front-admin stop-api
stop-front-back-with-scheduler: stop-front-candidat stop-front-admin stop-api stop-scheduler
test-up-front-back: test-up-front-back-${ENABLE_FEATURE}
test-up-front-back-without-scheduler: test-up-api test-up-front-admin test-up-front-candidat
test-up-front-back-with-scheduler: test-up-api test-up-scheduler test-up-front-admin test-up-front-candidat

#
# back: up/down api [+scheduler] (without db)
#
download-image-back: download-image-back-${ENABLE_FEATURE}
download-image-back-without-scheduler: download-image-api
download-image-back-with-scheduler: download-image-api download-image-scheduler
load-image-back: load-image-back-${ENABLE_FEATURE}
load-image-back-without-scheduler: load-image-api
load-image-back-with-scheduler: load-image-api load-image-scheduler
up-back: up-back-${ENABLE_FEATURE}
up-back-without-scheduler: up-api
up-back-with-scheduler: up-api up-scheduler
down-back: down-back-${ENABLE_FEATURE}
down-back-without-scheduler: down-api
down-back-with-scheduler: down-api down-scheduler
stop-back: stop-back-${ENABLE_FEATURE}
stop-back-without-scheduler: stop-api
stop-back-with-scheduler: stop-api stop-scheduler
test-up-back: test-up-back-${ENABLE_FEATURE}
test-up-back-without-scheduler: test-up-api
test-up-back-with-scheduler: test-up-api test-up-scheduler

#
# Build prod (separate container per compose)
#
build: check-prerequisites build-dir build-archive build-prod ## Create archive, Build production images

build-all: build-all-${ENABLE_FEATURE}
build-all-without-scheduler: build-db build-api build-front-candidat build-front-admin ## Build the release and production (web && && api && db)
build-all-with-scheduler: build-db build-api build-scheduler build-front-candidat build-front-admin ## Build the release and production (web && && api && db && scheduler)
#
# All container front candidat + front admin + api + db
#
up-all: up-all-${ENABLE_FEATURE}
up-all-without-scheduler: check-prerequisites network-up up-db wait-db up-api up-front-candidat up-front-admin ## up production (web && && api && db)
up-all-with-scheduler: check-prerequisites network-up up-db wait-db up-api up-scheduler up-front-candidat up-front-admin ## up production (web && && api && db && scheduler)
down-all: down-all-${ENABLE_FEATURE}
down-all-without-scheduler: down-front-candidat down-front-admin down-api down-db network-down  ## down production (web && && api && db)
down-all-with-scheduler: down-front-candidat down-front-admin down-api down-scheduler down-db network-down  ## down production (web && && api && db && scheduler)

network-up:
	@echo creating ${APP}-network docker network
	@docker network create --opt com.docker.network.driver.mtu=1450 ${APP}-network 2>/dev/null || true
network-down:
	@echo cleaning ${APP}-network docker network
	docker network rm ${APP}-network || true

#
# front candidat
#
build-front-candidat: check-build-front-candidat
	${DC} -f ${DC_APP_FRONT_CANDIDAT_BUILD_PROD} build ${DC_BUILD_ARGS} front_candidat
check-build-front-candidat:
	${DC} -f ${DC_APP_FRONT_CANDIDAT_BUILD_PROD} config
up-front-candidat: check-up-front-candidat network-up
	${DC} -f ${DC_APP_FRONT_CANDIDAT_RUN_PROD} up ${DC_RUN_ARGS} front_candidat
check-up-front-candidat:
	${DC} -f ${DC_APP_FRONT_CANDIDAT_RUN_PROD} config
down-front-candidat:
	${DC} -f ${DC_APP_FRONT_CANDIDAT_RUN_PROD} down
stop-front-candidat:
	${DC} -f ${DC_APP_FRONT_CANDIDAT_RUN_PROD} stop front_candidat
#
# front admin
#
build-front-admin: check-build-front-admin
	${DC} -f ${DC_APP_FRONT_ADMIN_BUILD_PROD} build ${DC_BUILD_ARGS} front_admin
check-build-front-admin:
	${DC} -f ${DC_APP_FRONT_ADMIN_BUILD_PROD} config
up-front-admin: check-up-front-admin network-up
	${DC} -f ${DC_APP_FRONT_ADMIN_RUN_PROD} up ${DC_RUN_ARGS} front_admin
check-up-front-admin:
	${DC} -f ${DC_APP_FRONT_ADMIN_RUN_PROD} config
down-front-admin:
	${DC} -f ${DC_APP_FRONT_ADMIN_RUN_PROD} down
stop-front-admin:
	${DC} -f ${DC_APP_FRONT_ADMIN_RUN_PROD} stop front_admin
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
# scheduler
#
build-scheduler: check-build-scheduler ## Build scheduler container
	${DC} -f ${DC_APP_SCHEDULER_BUILD_PROD} build ${DC_BUILD_ARGS} scheduler
check-build-scheduler: ## Check scheduler docker-compose syntax
	${DC} -f $(DC_APP_SCHEDULER_BUILD_PROD) config
up-scheduler: check-up-scheduler network-up ## Build scheduler container
	${DC} -f ${DC_APP_SCHEDULER_RUN_PROD} up ${DC_RUN_ARGS} scheduler
check-up-scheduler: ## Check scheduler docker-compose syntax
	${DC} -f $(DC_APP_SCHEDULER_RUN_PROD) config
down-scheduler: ## Down scheduler container
	${DC} -f ${DC_APP_SCHEDULER_RUN_PROD} down
stop-scheduler: ## Stop scheduler container
	${DC} -f ${DC_APP_SCHEDULER_RUN_PROD} stop scheduler
#
# api+scheduler (same host)
#
download-image-api-scheduler: download-image-api download-image-scheduler
load-image-api-scheduler: load-image-api load-image-scheduler
up-api-scheduler: up-api up-scheduler
down-api-scheduler: up-api up-scheduler
test-up-api-scheduler: test-up-api test-up-scheduler

#
# e2e
#
build-e2e: check-build-e2e ## Build e2e container
	${DC} -f ${DC_APP_E2E_BUILD_PROD} build ${DC_BUILD_ARGS}
check-build-e2e: ## Check e2e docker-compose syntax
	${DC} -f $(DC_APP_E2E_BUILD_PROD) config
up-e2e: check-up-e2e network-up ## Build e2e container
	${DC} -f ${DC_APP_E2E_RUN_PROD} up --no-build --abort-on-container-exit --exit-code-from e2e 2>&1 | tee e2e.log; exit $${PIPESTATUS[0]}
check-up-e2e: ## Check e2e docker-compose syntax
	${DC} -f $(DC_APP_E2E_RUN_PROD) config
down-e2e: ## Down e2e container
	${DC} -f ${DC_APP_E2E_RUN_PROD} down
stop-e2e: ## Stop e2e container
	${DC} -f ${DC_APP_E2E_RUN_PROD} stop e2e
stop-mailhog: ## Stop e2e container
	${DC} -f ${DC_APP_E2E_RUN_PROD} stop mailhog
#
# init db for e2e tests
#
init-db-e2e:
	bash ci/init-db-e2e.sh
#
# clean e2e.log
#
clean-log-e2e:
	rm e2e.log

#
# Extract files from candidat/admin docker images
#
export-front-all: build-dir build-dist-dir export-front-candidat export-front-admin extract-export-front-candidat extract-export-front-admin
build-dist-dir:
	mkdir -p $(DIST_DIR)/dist/{candilib-repartiteur,candilib}
clean-dist-dir:
	if [ -d "$(DIST_DIR)" ] ; then rm -rf $(DIST_DIR) ; fi
export-front-candidat: check-up-front-candidat network-up
#	${DC} -f ${DC_APP_FRONT_CANDIDAT_RUN_PROD} run -T --no-deps --rm front_candidat /bin/bash -c "(cd /usr/share/nginx/html && find . -type f)"
	${DC} -f ${DC_APP_FRONT_CANDIDAT_RUN_PROD} run -T --no-deps --rm front_candidat /bin/bash -c "( cd /usr/share/nginx/html && tar zCcf ./ - . )"  > $(BUILD_DIR)/$(FILE_FRONT_CANDIDAT_APP_VERSION)
export-front-admin: check-up-front-admin network-up
	${DC} -f ${DC_APP_FRONT_ADMIN_RUN_PROD} run -T --no-deps --rm front_admin /bin/bash -c "( cd /usr/share/nginx/html && tar zCcf ./ - . )"  > $(BUILD_DIR)/$(FILE_FRONT_ADMIN_APP_VERSION)
extract-export-front-candidat:
	( cd $(DIST_DIR)/dist/candilib && tar -zxvf $(BUILD_DIR)/$(FILE_FRONT_CANDIDAT_APP_VERSION) )
extract-export-front-admin:
	( cd $(DIST_DIR)/dist/candilib-repartiteur && tar -zxvf $(BUILD_DIR)/$(FILE_FRONT_ADMIN_APP_VERSION) )


#
# save images
#
save-images: save-images-${ENABLE_FEATURE} ## Save images
save-images-without-scheduler: build-dir save-image-db save-image-api save-image-front-candidat save-image-front-admin
save-images-with-scheduler: build-dir save-image-db save-image-api save-image-front-candidat save-image-front-admin save-image-scheduler

save-image-front-candidat: ## Save front_candidat image
	front_candidat_image_name=$$(${DC} -f $(DC_APP_FRONT_CANDIDAT_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["front_candidat"]["image"]') ; \
          docker image save $$front_candidat_image_name | gzip -9c > $(BUILD_DIR)/$(FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION) && \
          cp $(BUILD_DIR)/$(FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION) $(BUILD_DIR)/$(FILE_IMAGE_FRONT_CANDIDAT_LATEST_VERSION)

save-image-front-admin: ## Save front_admin image
	front_admin_image_name=$$(${DC} -f $(DC_APP_FRONT_ADMIN_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["front_admin"]["image"]') ; \
          docker image save $$front_admin_image_name | gzip -9c > $(BUILD_DIR)/$(FILE_IMAGE_FRONT_ADMIN_APP_VERSION) && \
          cp $(BUILD_DIR)/$(FILE_IMAGE_FRONT_ADMIN_APP_VERSION) $(BUILD_DIR)/$(FILE_IMAGE_FRONT_ADMIN_LATEST_VERSION)

save-image-db: ## Save db image
	db_image_name=$$(${DC} -f $(DC_APP_DB_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["db"]["image"]') ; \
          docker image save $$db_image_name | gzip -9c > $(BUILD_DIR)/$(FILE_IMAGE_DB_APP_VERSION) && \
          cp $(BUILD_DIR)/$(FILE_IMAGE_DB_APP_VERSION) $(BUILD_DIR)/$(FILE_IMAGE_DB_LATEST_VERSION)

save-image-api: ## Save api image
	api_image_name=$$(${DC} -f $(DC_APP_API_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["api"]["image"]') ; \
          docker image save $$api_image_name | gzip -9c > $(BUILD_DIR)/$(FILE_IMAGE_API_APP_VERSION) && \
          cp $(BUILD_DIR)/$(FILE_IMAGE_API_APP_VERSION)  $(BUILD_DIR)/$(FILE_IMAGE_API_LATEST_VERSION)

save-image-scheduler: ## Save scheduler image
	scheduler_image_name=$$(${DC} -f $(DC_APP_SCHEDULER_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["scheduler"]["image"]') ; \
          docker image save $$scheduler_image_name | gzip -9c > $(BUILD_DIR)/$(FILE_IMAGE_SCHEDULER_APP_VERSION) && \
          cp $(BUILD_DIR)/$(FILE_IMAGE_SCHEDULER_APP_VERSION)  $(BUILD_DIR)/$(FILE_IMAGE_SCHEDULER_LATEST_VERSION)

load-image-all: load-image-all-${ENABLE_FEATURE} ## Load images
load-image-all-without-scheduler: build-dir load-image-db load-image-api load-image-front-candidat load-image-front-admin
load-image-all-with-scheduler: build-dir load-image-db load-image-api load-image-front-candidat load-image-front-admin load-image-scheduler

load-image-front-candidat: $(BUILD_DIR)/$(FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION) ## Load front_candidat image
	docker image load -i $(BUILD_DIR)/$(FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION)
load-image-front-admin: $(BUILD_DIR)/$(FILE_IMAGE_FRONT_ADMIN_APP_VERSION) ## Load front_admin image
	docker image load -i $(BUILD_DIR)/$(FILE_IMAGE_FRONT_ADMIN_APP_VERSION)
load-image-db: $(BUILD_DIR)/$(FILE_IMAGE_DB_APP_VERSION) ## Load db image
	docker image load -i $(BUILD_DIR)/$(FILE_IMAGE_DB_APP_VERSION)
load-image-api: $(BUILD_DIR)/$(FILE_IMAGE_API_APP_VERSION) ## Load api image
	docker image load -i $(BUILD_DIR)/$(FILE_IMAGE_API_APP_VERSION)
load-image-scheduler: $(BUILD_DIR)/$(FILE_IMAGE_SCHEDULER_APP_VERSION) ## Load scheduler image
	docker image load -i $(BUILD_DIR)/$(FILE_IMAGE_SCHEDULER_APP_VERSION)

download-archive: ## Download archive
	@curl $(curl_opt) -s -k -X GET -o $(BUILD_DIR)/$(FILE_ARCHIVE_APP_VERSION) ${PUBLISH_URL}/${PUBLISH_URL_BASE}/${APP_VERSION}/$(FILE_ARCHIVE_APP_VERSION) \
            $(curl_progress_bar)
extract-archive: $(BUILD_DIR)/$(FILE_ARCHIVE_APP_VERSION)  build-archive-dir
	tar -zxvf $(BUILD_DIR)/$(FILE_ARCHIVE_APP_VERSION) -C $(ARCHIVE_DIR)
build-archive-dir:
	if [ ! -d "$(ARCHIVE_DIR)" ] ; then mkdir -p $(ARCHIVE_DIR) ; fi
clean-archive-dir:
	if [ -d "$(ARCHIVE_DIR)" ] ; then rm -rf $(ARCHIVE_DIR) ; fi

download-image-all: download-image-all-${ENABLE_FEATURE}
download-image-all-without-scheduler: download-image-front-candidat download-image-front-admin download-image-db download-image-api
download-image-all-with-scheduler: download-image-front-candidat download-image-front-admin download-image-db download-image-api download-image-scheduler

download-image-front-candidat: ## Download front_candidat image
	@curl $(curl_opt) -s -k -X GET -o $(BUILD_DIR)/$(FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION) ${PUBLISH_URL}/${PUBLISH_URL_BASE}/${APP_VERSION}/$(FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION) \
          $(curl_progress_bar)

download-image-front-admin: ## Download front_admin image
	@curl $(curl_opt) -s -k -X GET -o $(BUILD_DIR)/$(FILE_IMAGE_FRONT_ADMIN_APP_VERSION) ${PUBLISH_URL}/${PUBLISH_URL_BASE}/${APP_VERSION}/$(FILE_IMAGE_FRONT_ADMIN_APP_VERSION) \
          $(curl_progress_bar)

download-image-db: ## Download db image
	@curl $(curl_opt) -s -k -X GET -o $(BUILD_DIR)/$(FILE_IMAGE_DB_APP_VERSION) ${PUBLISH_URL}/${PUBLISH_URL_BASE}/${APP_VERSION}/$(FILE_IMAGE_DB_APP_VERSION) \
          $(curl_progress_bar)

download-image-api: ## Download api image
	@curl $(curl_opt) -s -k -X GET -o $(BUILD_DIR)/$(FILE_IMAGE_API_APP_VERSION) ${PUBLISH_URL}/${PUBLISH_URL_BASE}/${APP_VERSION}/$(FILE_IMAGE_API_APP_VERSION) \
          $(curl_progress_bar)

download-image-scheduler: ## Download scheduler image
	@curl $(curl_opt) -s -k -X GET -o $(BUILD_DIR)/$(FILE_IMAGE_SCHEDULER_APP_VERSION) ${PUBLISH_URL}/${PUBLISH_URL_BASE}/${APP_VERSION}/$(FILE_IMAGE_SCHEDULER_APP_VERSION) \
          $(curl_progress_bar)


#
# clean image
#
clean-images: clean-images-${ENABLE_FEATURE} ## Remove all docker images
clean-images-without-scheduler: clean-image-api clean-image-db clean-image-front-candidat clean-image-front-admin
clean-images-with-scheduler: clean-image-api clean-image-db clean-image-front-candidat clean-image-front-admin clean-image-scheduler

clean-image-front-candidat: ## Remove front_candidat docker image
	front_candidat_image_name=$$(${DC} -f $(DC_APP_FRONT_CANDIDAT_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["front_candidat"]["image"]') ; \
          docker rmi $$front_candidat_image_name || true


clean-image-front-admin: ## Remove front_admin docker image
	front_admin_image_name=$$(${DC} -f $(DC_APP_FRONT_ADMIN_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["front_admin"]["image"]') ; \
          docker rmi $$front_admin_image_name || true


clean-image-db: ## Remove db docker image
	db_image_name=$$(${DC} -f $(DC_APP_DB_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["db"]["image"]') ; \
          docker rmi $$db_image_name || true

clean-image-api: ## Remove api docker image
	api_image_name=$$(${DC} -f $(DC_APP_API_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["api"]["image"]') ; \
          docker rmi $$api_image_name || true

clean-image-scheduler: ## Remove scheduler docker image
	scheduler_image_name=$$(${DC} -f $(DC_APP_SCHEDULER_BUILD_PROD) config | python -c 'import sys, yaml, json; cfg = json.loads(json.dumps(yaml.load(sys.stdin), sys.stdout, indent=4)); print cfg["services"]["scheduler"]["image"]') ; \
          docker rmi $$scheduler_image_name || true


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
publish: publish-${ENABLE_FEATURE}
publish-without-scheduler: publish-without-scheduler-$(APP_VERSION) publish-without-scheduler-$(LATEST_VERSION) ## Publish all artifacts (archives,docker images)
publish-with-scheduler: publish-with-scheduler-$(APP_VERSION) publish-with-scheduler-$(LATEST_VERSION) ## Publish all artifacts (archives,docker images)

publish-without-scheduler-$(APP_VERSION):
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

publish-without-scheduler-$(LATEST_VERSION):
	@echo "Publish $(APP) $(LATEST_VERSION) artifacts"
	if [ -z "${PUBLISH_URL}" -o -z "${PUBLISH_AUTH_TOKEN}" ] ; then exit 1; fi
	for file in \
		"${APP}-VERSION ${APP}-VERSION" \
		"${FILE_ARCHIVE_APP_VERSION} ${FILE_ARCHIVE_LATEST_VERSION}" \
		"${FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION} ${FILE_IMAGE_FRONT_CANDIDAT_LATEST_VERSION}" \
		"${FILE_IMAGE_FRONT_ADMIN_APP_VERSION} ${FILE_IMAGE_FRONT_ADMIN_LATEST_VERSION}" \
		"${FILE_IMAGE_API_APP_VERSION} ${FILE_IMAGE_API_LATEST_VERSION}" \
		"${FILE_IMAGE_SCHEDULER_APP_VERSION} ${FILE_IMAGE_SCHEDULER_LATEST_VERSION}" \
		"${FILE_IMAGE_DB_APP_VERSION} ${FILE_IMAGE_DB_LATEST_VERSION}" \
		; do \
	  echo "$${file}" | while read src dst ; do bash ci/publish.sh $${src} $${dst} ${LATEST_VERSION} ; done ; \
	done ; \
	curl -k -H 'X-Auth-Token: ${PUBLISH_AUTH_TOKEN}' "${PUBLISH_URL}/${PUBLISH_URL_BASE}?prefix=${LATEST_VERSION}/&format=json" -s --fail

publish-with-scheduler-$(APP_VERSION):
	@echo "Publish $(APP) $(APP_VERSION) artifacts"
	if [ -z "${PUBLISH_URL}" -o -z "${PUBLISH_AUTH_TOKEN}" ] ; then exit 1; fi
	for file in \
		"${APP}-VERSION ${APP}-VERSION" \
		"${FILE_ARCHIVE_APP_VERSION} ${FILE_ARCHIVE_APP_VERSION}" \
		"${FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION} ${FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION}" \
		"${FILE_IMAGE_FRONT_ADMIN_APP_VERSION} ${FILE_IMAGE_FRONT_ADMIN_APP_VERSION}" \
		"${FILE_IMAGE_API_APP_VERSION} ${FILE_IMAGE_API_APP_VERSION}" \
		"${FILE_IMAGE_SCHEDULER_APP_VERSION} ${FILE_IMAGE_SCHEDULER_APP_VERSION}" \
		"${FILE_IMAGE_DB_APP_VERSION} ${FILE_IMAGE_DB_APP_VERSION}" \
		; do \
	  echo "$${file}" | while read src dst ; do bash ci/publish.sh $${src} $${dst} ${APP_VERSION} ; done ; \
	done ; \
	curl -k -H 'X-Auth-Token: ${PUBLISH_AUTH_TOKEN}' "${PUBLISH_URL}/${PUBLISH_URL_BASE}?prefix=${APP_VERSION}/&format=json" -s --fail ;

publish-with-scheduler-$(LATEST_VERSION):
	@echo "Publish $(APP) $(LATEST_VERSION) artifacts"
	if [ -z "${PUBLISH_URL}" -o -z "${PUBLISH_AUTH_TOKEN}" ] ; then exit 1; fi
	for file in \
		"${APP}-VERSION ${APP}-VERSION" \
		"${FILE_ARCHIVE_APP_VERSION} ${FILE_ARCHIVE_LATEST_VERSION}" \
		"${FILE_IMAGE_FRONT_CANDIDAT_APP_VERSION} ${FILE_IMAGE_FRONT_CANDIDAT_LATEST_VERSION}" \
		"${FILE_IMAGE_FRONT_ADMIN_APP_VERSION} ${FILE_IMAGE_FRONT_ADMIN_LATEST_VERSION}" \
		"${FILE_IMAGE_API_APP_VERSION} ${FILE_IMAGE_API_LATEST_VERSION}" \
		"${FILE_IMAGE_SCHEDULER_APP_VERSION} ${FILE_IMAGE_SCHEDULER_LATEST_VERSION}" \
		"${FILE_IMAGE_DB_APP_VERSION} ${FILE_IMAGE_DB_LATEST_VERSION}" \
		; do \
	  echo "$${file}" | while read src dst ; do bash ci/publish.sh $${src} $${dst} ${LATEST_VERSION} ; done ; \
	done ; \
	curl -k -H 'X-Auth-Token: ${PUBLISH_AUTH_TOKEN}' "${PUBLISH_URL}/${PUBLISH_URL_BASE}?prefix=${LATEST_VERSION}/&format=json" -s --fail
#
# test
#
test-all: test-all-${ENABLE_FEATURE}
test-all-without-scheduler: wait-db test-up-db test-up-api test-up-front-admin test-up-front-candidat # test-up-$(APP) ## Test running container (db,front,api)
test-all-with-scheduler: wait-db test-up-db test-up-api test-up-scheduler test-up-front-admin test-up-front-candidat # test-up-$(APP) ## Test running container (db,front,api,scheduler)

wait-db: ## wait db up and running
	time bash -x tests/wait-db.sh
test-up-scheduler: ## test scheduler container up and runnng
	time bash -x tests/test-up-scheduler.sh
test-up-api: ## test api container up and runnng
	time bash -x tests/test-up-api.sh
test-up-db: ## test db container up and runnng
	time bash -x tests/test-up-db.sh
test-up-front-candidat: ## test front-candidat container up and runnng
	time bash -x tests/test-up-front-candidat.sh
test-up-front-admin: ## test front-admin container up and runnng
	time bash -x tests/test-up-front-admin.sh
test-up-${APP}: ## test app up and running
	time bash tests/test-up-${APP}.sh
