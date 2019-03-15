#!/bin/bash
if ! git describe --tags 2>&- ; then
  count=$(git rev-list --count HEAD 2>&- )
  commit=$(git describe --tags --always 2>&- )
  ret=$?
  if [ "$ret" -eq 0 ]; then
    buildno="2.0.0-alpha.$(date +%Y%m%d).$count.$commit"
    echo "$buildno"
  else
    echo "ERROR $(basename $0)" >&2
    exit $ret
  fi
fi
