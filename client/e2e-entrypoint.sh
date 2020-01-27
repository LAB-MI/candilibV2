#!/bin/bash
#
# entrypoint e2e
#

# reset proxy config at runtime
npm config delete proxy
npm config delete https-proxy
npm config delete no-proxy

npm run cypress -- --browser chrome $@
