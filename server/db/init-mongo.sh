mongo -- "$MONGO_INITDB_DATABASE" <<EOF
var root_user = '$MONGO_INITDB_ROOT_USERNAME';
var root_pass = '$MONGO_INITDB_ROOT_PASSWORD';
var database = '$MONGO_INITDB_DATABASE';
var user = '$DB_USER';
var user_pass = '$DB_PASS';
var admin = db.getSiblingDB('admin');
admin.auth(root_user, root_pass);
db.createUser({ user: user, pwd: user_pass, roles: [{ role: "dbOwner", db: database }], mechanisms: ["SCRAM-SHA-1"]});

EOF

