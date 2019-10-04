#!/bin/bash
#
# api in test mode (include faketime)
#    overrive env var FAKETIME with value "@2020-12-24 20:30:00" or "-15d" "+15d"
#
date="@$(date '+%Y-%m-%d %H:%M:%S')"
LD_PRELOAD=/usr/lib/x86_64-linux-gnu/faketime/libfaketime.so.1 \
FAKETIME="${FAKETIME:-$date}" \
  pm2-runtime start ecosystem.config.js --env production
