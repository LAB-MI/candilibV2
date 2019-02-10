db.createUser(
    {
        user: "candilibAdmin",
        pwd: "Admin*78",
        roles: [
            {
                role: "dbOwner",
                db: "candilib",
            },
        ],
        mechanisms: [
            "SCRAM-SHA-1",
        ],
    }
)