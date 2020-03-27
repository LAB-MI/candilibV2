var now = new Date()
var dateEtg = new Date( now.getFullYear() - 5, now.getMonth(), now.getDate(),0,0,0)
var dateEtg1 = new Date( now.getFullYear() - 5, now.getMonth(), now.getDate()-1,0,0,0)
var dateEtg2 = new Date( now.getFullYear() - 5, now.getMonth(), now.getDate()-2,0,0,0)
var dateEtg7 = new Date( now.getFullYear() - 5, now.getMonth(), now.getDate()-7,0,0,0)
var dateEtg3 = new Date( now.getFullYear() - 5, now.getMonth(), now.getDate()+1,0,0,0)
var dateEtg4 = new Date( now.getFullYear() - 5, now.getMonth(), now.getDate()+2,0,0,0)

db.getCollection("candidats").insertOne(
{ 
    "isValidatedByAurige": true,
    "isValidatedEmail": true,
    "nbEchecsPratiques": 0,
    "adresse": "avenue",
    "codeNeph": "01234567890120",
    "email": "test.etg.0@candi.lib",
    "emailValidationHash": null,
    "nomNaissance": "TESTETG",
    "portable": "0716253443",
    "prenom": "OverETG",
    "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
    "departement": "75",
    "noReussites": [],
    "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
    "dateReussiteETG": dateEtg
});

db.getCollection("candidats").insertOne(
    { 
        "isValidatedByAurige": true,
        "isValidatedEmail": true,
        "nbEchecsPratiques": 0,
        "adresse": "avenue",
        "codeNeph": "012345678901201",
        "email": "test.etg.01@candi.lib",
        "emailValidationHash": null,
        "nomNaissance": "TESTETG01",
        "portable": "0716253443",
        "prenom": "OverETG",
        "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
        "departement": "75",
        "noReussites": [],
        "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
        "dateReussiteETG": dateEtg
    });
    
db.getCollection("candidats").insertOne(
    { 
        "isValidatedByAurige": true,
        "isValidatedEmail": true,
        "nbEchecsPratiques": 0,
        "adresse": "avenue",
        "codeNeph": "01234567890121",
        "email": "test.etg.1@candi.lib",
        "emailValidationHash": null,
        "nomNaissance": "TESTETG1",
        "portable": "0716253443",
        "prenom": "OverETG",
        "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
        "departement": "75",
        "noReussites": [],
        "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
        "dateReussiteETG": dateEtg1
    });
    db.getCollection("candidats").insertOne(
        { 
            "isValidatedByAurige": true,
            "isValidatedEmail": true,
            "nbEchecsPratiques": 0,
            "adresse": "avenue",
            "codeNeph": "012345678901211",
            "email": "test.etg.11@candi.lib",
            "emailValidationHash": null,
            "nomNaissance": "TESTETG11",
            "portable": "0716253443",
            "prenom": "OverETG",
            "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
            "departement": "75",
            "noReussites": [],
            "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
            "dateReussiteETG": dateEtg1
        });
    
db.getCollection("candidats").insertOne(
    { 
        "isValidatedByAurige": true,
        "isValidatedEmail": true,
        "nbEchecsPratiques": 0,
        "adresse": "avenue",
        "codeNeph": "01234567890122",
        "email": "test.etg.2@candi.lib",
        "emailValidationHash": null,
        "nomNaissance": "TESTETG2",
        "portable": "0716253443",
        "prenom": "OverETG",
        "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
        "departement": "75",
        "noReussites": [],
        "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
        "dateReussiteETG": dateEtg2
    })
    db.getCollection("candidats").insertOne(
        { 
            "isValidatedByAurige": true,
            "isValidatedEmail": true,
            "nbEchecsPratiques": 0,
            "adresse": "avenue",
            "codeNeph": "012345678901221",
            "email": "test.etg.21@candi.lib",
            "emailValidationHash": null,
            "nomNaissance": "TESTETG21",
            "portable": "0716253443",
            "prenom": "OverETG",
            "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
            "departement": "75",
            "noReussites": [],
            "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
            "dateReussiteETG": dateEtg2
        })
        db.getCollection("candidats").insertOne(
        { 
        "isValidatedByAurige": true,
        "isValidatedEmail": true,
        "nbEchecsPratiques": 0,
        "adresse": "avenue",
        "codeNeph": "01234567890123",
        "email": "test.etg.3@candi.lib",
        "emailValidationHash": null,
        "nomNaissance": "TESTETG3",
        "portable": "0716253443",
        "prenom": "OverETG",
        "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
        "departement": "75",
        "noReussites": [],
        "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
        "dateReussiteETG": dateEtg3
    })
    db.getCollection("candidats").insertOne(
        { 
        "isValidatedByAurige": true,
        "isValidatedEmail": true,
        "nbEchecsPratiques": 0,
        "adresse": "avenue",
        "codeNeph": "012345678901231",
        "email": "test.etg.31@candi.lib",
        "emailValidationHash": null,
        "nomNaissance": "TESTETG31",
        "portable": "0716253443",
        "prenom": "OverETG",
        "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
        "departement": "75",
        "noReussites": [],
        "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
        "dateReussiteETG": dateEtg3
    })

    db.getCollection("candidats").insertOne(
        { 
        "isValidatedByAurige": true,
        "isValidatedEmail": true,
        "nbEchecsPratiques": 0,
        "adresse": "avenue",
        "codeNeph": "01234567890124",
        "email": "test.etg.4@candi.lib",
        "emailValidationHash": null,
        "nomNaissance": "TESTETG4",
        "portable": "0716253443",
        "prenom": "OverETG",
        "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
        "departement": "75",
        "noReussites": [],
        "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
        "dateReussiteETG": dateEtg4
    })
    db.getCollection("candidats").insertOne(
        { 
        "isValidatedByAurige": true,
        "isValidatedEmail": true,
        "nbEchecsPratiques": 0,
        "adresse": "avenue",
        "codeNeph": "012345678901241",
        "email": "test.etg.41@candi.lib",
        "emailValidationHash": null,
        "nomNaissance": "TESTETG41",
        "portable": "0716253443",
        "prenom": "OverETG",
        "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
        "departement": "75",
        "noReussites": [],
        "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
        "dateReussiteETG": dateEtg4
    })
    db.getCollection("candidats").insertOne(
        { 
        "isValidatedByAurige": true,
        "isValidatedEmail": true,
        "nbEchecsPratiques": 0,
        "adresse": "avenue",
        "codeNeph": "01234567890127",
        "email": "test.etg.7@candi.lib",
        "emailValidationHash": null,
        "nomNaissance": "TESTETG7",
        "portable": "0716253443",
        "prenom": "OverETG",
        "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
        "departement": "75",
        "noReussites": [],
        "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
        "dateReussiteETG": dateEtg7
    })
    db.getCollection("candidats").insertOne(
        { 
        "isValidatedByAurige": true,
        "isValidatedEmail": true,
        "nbEchecsPratiques": 0,
        "adresse": "avenue",
        "codeNeph": "012345678901271",
        "email": "test.etg.71@candi.lib",
        "emailValidationHash": null,
        "nomNaissance": "TESTETG71",
        "portable": "0716253443",
        "prenom": "OverETG",
        "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
        "departement": "75",
        "noReussites": [],
        "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
        "dateReussiteETG": dateEtg7
    })
    
var cursorCentre = db.getCollection("centres").find({ departement: '75', nom: 'Rosny sous bois'})
// cursorCentre.toArray()[0]
var idcentre = cursorCentre.toArray()[0]._id;
var newPlaces = [];
var dates = [-8,-7,-6,-2,-1,0,1,2,3,4,5,6].map( iday => [ 8, 9, 10, 11, 14, 15].map(hour =>  new Date(now.getFullYear(), now.getMonth(), now.getDate() +iday, hour))).reduce((acc, val) => acc.concat(val), []);

var cursorIpcsr = db.getCollection("inspecteurs").find({departement: '75'},{ _id : 1})
var ipcsr = cursorIpcsr.toArray().map(({ _id }) => _id)

for(let indexb = 0; indexb < 5; indexb++ ){
    for (let index = 0; index < dates.length; index++) {
       newPlaces.push({
        "inspecteur" : ipcsr[indexb],
        "date" : dates[index],
        "centre" : idcentre,
       })
    }
}
db.getCollection("places").insertMany(newPlaces)

var cursorCandidats = db.getCollection("candidats").find({"nomNaissance": 'TESTETG' },{ _id: 1})
printjson( cursorCandidats.toArray() )
var candidat_id = cursorCandidats.toArray()[0]._id
db.getCollection("places").updateOne({ 
 "inspecteur" : ipcsr[0],
 "date" : new Date( now.getFullYear(), dateEtg.getMonth(), dateEtg.getDate(),10,0,0),
 "centre" : idcentre,
},{ $set: { "candidat": candidat_id }})

var cursorCandidats1 = db.getCollection("candidats").find({"nomNaissance": 'TESTETG1' },{ _id: 1})
printjson( cursorCandidats1.toArray() )
var candidat1_id = cursorCandidats1.toArray()[0]._id
db.getCollection("places").updateOne({ 
 "inspecteur" : ipcsr[0],
 "date" : new Date( now.getFullYear(), dateEtg1.getMonth(), dateEtg1.getDate(),10,0,0),
 "centre" : idcentre,
},{ $set: { "candidat": candidat1_id }})

var cursorCandidats2 = db.getCollection("candidats").find({"nomNaissance": 'TESTETG2' },{ _id: 1})
printjson( cursorCandidats2.toArray() )
var candidat2_id = cursorCandidats2.toArray()[0]._id
db.getCollection("places").updateOne({ 
 "inspecteur" : ipcsr[0],
 "date" : new Date( now.getFullYear(), dateEtg2.getMonth(), dateEtg2.getDate(),10,0,0),
 "centre" : idcentre,
},{ $set: { "candidat": candidat2_id }})

var cursorCandidats3 = db.getCollection("candidats").find({"nomNaissance": 'TESTETG3' },{ _id: 1})
printjson( cursorCandidats3.toArray())
var candidat3_id = cursorCandidats3.toArray()[0]._id
db.getCollection("places").updateOne({ 
 "inspecteur" : ipcsr[0],
 "date" : new Date( now.getFullYear(), dateEtg3.getMonth(), dateEtg3.getDate(),10,0,0),
 "centre" : idcentre,
},{ $set: { "candidat": candidat3_id }})

var cursorCandidats4 = db.getCollection("candidats").find({"nomNaissance": 'TESTETG4' },{ _id: 1})
printjson( cursorCandidats4.toArray() )
var candidat4_id = cursorCandidats4.toArray()[0]._id
db.getCollection("places").updateOne({ 
 "inspecteur" : ipcsr[0],
 "date" : new Date( now.getFullYear(), dateEtg4.getMonth(), dateEtg4.getDate(),10,0,0),
 "centre" : idcentre,
},{ $set: { "candidat": candidat4_id }})

var cursorCandidats7 = db.getCollection("candidats").find({"nomNaissance": 'TESTETG7' },{ _id: 1})
printjson( cursorCandidats4.toArray() )
var candidat7_id = cursorCandidats7.toArray()[0]._id
db.getCollection("places").updateOne({ 
 "inspecteur" : ipcsr[0],
 "date" : new Date( now.getFullYear(), dateEtg7.getMonth(), dateEtg7.getDate(),10,0,0),
 "centre" : idcentre,
},{ $set: { "candidat": candidat7_id }})