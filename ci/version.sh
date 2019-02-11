#!/bin/bash
if ! git describe --tags 2>&- ; then
  count=$(git rev-list --count HEAD 2>&- )
  commit=$(git describe --tags --always 2>&- )
  ret=$?
  if [ "$ret" -eq 0 ]; then
    buildno=b"$count.$commit"
    echo "$buildno"
  else
    echo "ERROR $(basename $0)" 2>&1
    exit $ret
  fi
fi
