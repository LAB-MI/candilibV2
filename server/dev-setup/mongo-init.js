db.createUser({
  user: 'adminCandilib',
  pwd: 'changeme78',
  roles: [
    {
      role: 'dbOwner',
      db: 'candilib',
    },
  ],
  mechanisms: ['SCRAM-SHA-1'],
})
