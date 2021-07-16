var codeNeph = 0123456789000
var objCommon = {
   "prenom": "Luffy",
   "isValidatedEmail": true,
   "adresse": "40 Avenue des terroirs de France 75012 Paris",
   "portable": "0676543986",
   "departement": "93",
   "noReussites": [
   ],
   "places":[]
}
var synchroAuriges = [
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.SUCCESS.BEFORE",
      "email": "test.success.before.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.SUCCESS.VALIDED",
      "email": "test.success.valided.93@test.com",
   }
   ,
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.FAILED.BEFORE",
      "email": "test.failed.before.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.FAILED.VALIDED",
      "email": "test.failed.valided.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.FAILED.VALIDED.NOPLACE",
      "email": "test.failed.valided.noplace.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.ABSENT.BEFORE",
      "email": "test.absent.before.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.ABSENT.VALIDED",
      "email": "test.absent.valided.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.ABSENT.VALIDED.NOPLACE",
      "email": "test.absent.valided.noplace.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.NO.EXAM.BEFORE",
      "email": "test.no.exam.before.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.NO.EXAM.VALIDED",
      "email": "test.no.exam.valided.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.NO.EXAM.VALIDED.NOPLACE",
      "email": "test.no.exam.valided.noplace.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.CANCELED.BEFORE",
      "email": "test.canceled.before.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.CANCELED.VALIDED",
      "email": "test.canceled.valided.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.CANCELED.VALIDED.NOPLACE",
      "email": "test.canceled.valided.noplace.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.NO.ADMIS.BEFORE",
      "email": "test.no.admin.before.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.NO.ADMIS.VALIDED",
      "email": "test.no.admin.valided.93@test.com",
   },
   {
      "codeNeph": `${codeNeph++}`,
      "nomNaissance": "TEST.MAIL.NO.ADMIS.VALIDED.NOPLACE",
      "email": "test.no.admin.valided.noplace.93@test.com",
   }

]
printjson(synchroAuriges)
var regexp = RegExp("VALIDED")
var candidatsMails = synchroAuriges.map( synchroAurige => { 
synchroAurige.isValidatedByAurige = regexp.test(synchroAurige.nomNaissance);
return Object.assign({}, objCommon, synchroAurige)
})
printjson(candidatsMails)

db.getCollection("candidats").insertMany(candidatsMails)


var cursorCentre = db.getCollection("centres").find({ departement: '93', nom: 'Rosny sous bois'})
cursorCentre.toArray()[0]
var idcentre = cursorCentre.toArray()[0]._id;
var newPlaces = [];

var now = new Date()
var dates = [-3,-2,-1,0,1,2,3].map( iday => [ 8, 9, 10, 11, 14, 15].map(hour =>  new Date(now.getFullYear(), now.getMonth(), now.getDate() + iday, hour))).reduce((acc, val) => acc.concat(val), []);

var cursorIpcsr = db.getCollection("inspecteurs").find({departement: '93'},{ _id : 1})
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
var placesInserted = db.getCollection("places").insertMany(newPlaces)

var cursorCandidats = db.getCollection("candidats").find({ nomNaissance: { $regex : /TEST\.MAIL\..*VALIDED$/}})

cursorCandidats.forEach(candidat => {
   db.getCollection("places").updateOne({ date: { $gt: dates[0], $lt: dates[dates.length-1] }, candidat:{ $exists: false } }, { $set: { candidat: candidat._id} })
});
var dateEtg = new Date( now.getFullYear() - 4, now.getMonth(), now.getDate() + 10,0,0,0)
var results = db.getCollection('candidats').aggregate([
   { $match: { nomNaissance: { $regex: /TEST.MAIL/ }} },
   { $lookup:{ from: 'places', localField: '_id', foreignField: 'candidat', as: 'place' }},
   { $unwind: { path: "$place", preserveNullAndEmptyArrays: true } },
   { $project: { _id:0, codeNeph:1, nomNaissance: 1, prenom: 1,
          dateReussiteETG:`${dateEtg.toISOString().split('T')[0]}`,
          nbEchecsPratiques : "1",
          candidatExistant : "OK",
          date: { $dateToString: { format:  "%Y-%m-%d", date: "$place.date"}},
    }}
])

var regexSuccess = RegExp("SUCCESS")
var regexFailed = RegExp("FAILED")
var regexAbsent = RegExp('ABSENT')
var regrexNoExam = RegExp('NO.EXAM')
var regrexCancel  = RegExp('CANCELED')
var regrexNoAdmis = RegExp('NO.ADMIS')
var forSynchroAurige = results.map(
   candidat => ({
      "codeNeph": candidat.codeNeph,
     "nomNaissance":  candidat.nomNaissance,
     "prenom": candidat.prenom,
     "dateReussiteETG": candidat.dateReussiteETG,
     "nbEchecsPratiques" : "1",
     "candidatExistant" : "OK",
     "reussitePratique" : regexSuccess.test(candidat.nomNaissance) ? ( candidat.date || now.toISOString().split('T')[0] ) : "",
     "dateDernierNonReussite" : regexSuccess.test(candidat.nomNaissance) ? "": ( candidat.date || now.toISOString().split('T')[0] ),
     "objetDernierNonReussite" : regexFailed.test(candidat.nomNaissance) ? 'Echec': regexAbsent.test(candidat.nomNaissance) ? 'Absent' : regrexNoExam.test(candidat.nomNaissance) ? 'Non examinable': regrexCancel.test(candidat.nomNaissance) ? 'Annulé' : regrexNoAdmis.test(candidat.nomNaissance)? 'Non recevable':'' ,
   })
)
printjson(placesInserted.insertedIds)
printjson(forSynchroAurige)
 