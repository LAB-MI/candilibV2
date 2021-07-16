var now = new Date()
var oneDays = (24*60*60*1000) 
var arrayNbDays = [ 1, 59, 60, 61, 89, 90,91, 119, 120, 121 ]

arrayNbDays.forEach((nbDays, index) =>{
    db.getCollection("candidats").insertOne({ 
        "isValidatedByAurige" : true,
        "isValidatedEmail" : true,
        "nbEchecsPratiques" : 0,
        "codeNeph" : `750123456789+${index}`,
        "email" : `candidat.${nbDays}@test.com`,
        "nomNaissance" : `CANDIDAT_${nbDays}`,
        "portable" : "0676543986",
        "prenom" : `last_connect_${nbDays}`,
        "presignedUpAt" : ISODate("2019-05-07T14:37:12.045Z"),
        "departement" : "75",
        "homeDepartement" : "93",
        "noReussites" : [],
        "dateReussiteETG" : ISODate("2018-05-07T14:37:12.391Z"),
        "isEvaluationDone" : false,
        "createdAt" : ISODate("2018-05-18T09:38:36.506Z"), 
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmMDVkNmU3M2ViNWMyMDBlOGY4OGY2MyIsImxldmVsIjowLCJpYXQiOjE1OTQ5MDg2OTUsImV4cCI6MTU5NTE2Nzg5NX0.8cl61S364OCs8tZBYfbl5xTGRCkxNo8sJSLR_CJ-l2s", 
       "tokenAddedAt": new Date(now.getTime() - nbDays * oneDays),
        "lastConnection": new Date(now.getTime() - nbDays * oneDays)
    })
 })