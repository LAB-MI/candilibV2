var now = new Date()
var dateEtg = new Date( now.getFullYear() - 5, now.getMonth(), now.getDate() + 10,0,0,0)

db.getCollection("candidats").insertOne(
{ 
    "isValidatedByAurige": true,
    "isValidatedEmail": true,
    "nbEchecsPratiques": 0,
    "adresse": "avenue",
    "codeNeph": "01234567890123",
    "email": "test.over.etg@candi.lib",
    "emailValidationHash": null,
    "nomNaissance": "TESTETG",
    "portable": "0716253443",
    "prenom": "OverETG",
    "presignedUpAt": ISODate("2020-01-08T10:51:51.236Z"),
    "departement": "75",
    "noReussites": [],
    "emailValidatedAt": ISODate("2020-01-08T10:51:56.507Z"),
    "dateReussiteETG": dateEtg
})

var cursorCentre = db.getCollection("centres").find({ departement: '75', nom: 'Rosny sous bois'})
cursorCentre.toArray()[0]
var idcentre = cursorCentre.toArray()[0]._id;
var newPlaces = [];
var dates = [0,1,2,3,4,5,6].map( iday => [ 8, 9, 10, 11, 14, 15].map(hour =>  new Date(now.getFullYear(), now.getMonth(), now.getDate()+ 7 +iday, hour))).reduce((acc, val) => acc.concat(val), []);

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
