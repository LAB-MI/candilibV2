#!/bin/bash
#
# entrypoint scheduler
#

# put here steps to execute at runtime, before server launch

# last run the server
pm2-runtime start ecosystem.config.js --env production

