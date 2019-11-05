#!/bin/bash
#
# test scheduler
#
set -e

basename=$(basename $0)
echo "# $basename ${APP} ${APP_VERSION}"

ret=0
container_name=scheduler

echo "# Test ${APP}-$container_name up"
set +e
timeout=120;
test_result=1
dirname=$(dirname $0)
until [ "$timeout" -le 0 -o "$test_result" -eq "0" ] ; do
	## TODO:
	${DC} -f ${DC_APP_SCHEDULER_RUN_PROD} exec ${DC_USE_TTY} $container_name bash -c 'nodejs - <<EOF
var MongoClient = require("mongodb").MongoClient;
var url = process.env.MONGO_URL;
MongoClient.connect(url,{ useNewUrlParser: true } , function(err, dbo) {   if (err) throw err; dbo.db("candilib").listCollections({name: "SchedulerJobs"}).next(function(err, collinfo) {if (!collinfo) {console.log("Collection SchedulerJobs introuvable!"); process.exit(1); } console.log("Collection SchedulerJobs OK"); }); dbo.close();   });
MongoClient.connect(url,{ useNewUrlParser: true } , function(err, dbo) {   if (err) throw err; dbo.db("candilib").collection("SchedulerJobs").find({},{ _id: 0, name: 1}).toArray(function(err, result) { if (err ) throw err; if (result.length === 0) { console.log("jobs list empty") ; process.exit(0) ; } console.log("jobs:"+result.length); dbo.close();  }); });
EOF
'
	test_result=$?
	echo "Wait $timeout seconds: ${APP}-$container_name up $test_result";
	(( timeout-- ))
	sleep 1
done
if [ "$test_result" -gt "0" ] ; then
	ret=$test_result
	echo "ERROR: ${APP}-$container_name en erreur"
	exit $ret
fi

exit $ret
