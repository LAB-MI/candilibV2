db.getCollection('places').deleteMany({}); 
db.getCollection('candidats').deleteMany({}); 
db.getCollection('archivedcandidats').deleteMany({}); 
db.getCollection('archivedplaces').deleteMany({});
db.getCollection('whitelisted').deleteMany({});
db.getCollection('evaluations').deleteMany({});
db.getCollection('users').remove({deletedAt: {$exists:true}})