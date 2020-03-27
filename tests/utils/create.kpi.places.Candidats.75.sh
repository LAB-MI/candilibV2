#!/bin/bash
DEP=75
TEMPCODENEF=75000000000

NB_REUSSITE=50
NB_ABSENT=10
NB_ECHEC=20
NB_CANCELED=5
NB_NO_ADMISSIBLE=10
NB_NO_EXAMINABLE=5
#NB_TOTAL=100

NB_INDEX=1

echo 'db.getCollection("archivedcandidats").insertMany(['
for ((i=$NB_INDEX;i<=$NB_REUSSITE;i++));
do
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="test.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo '{ "codeNeph": "'$CODENEF'",
   "prenom": "TEST",
   "nomNaissance": "'$NOM'",
   "isValidatedByAurige": true,
   "isValidatedEmail": true,
   "adresse": "40 Avenue des terroirs de France 75012 Paris",
   "portable": "0676543986",
   "email": "'$MAIL'",
   "departement": "'$DEP'",
   "noReussites": [
   ],
   "places":[
       {
        "inspecteur": ObjectId("5d887961c919fd001c866e64"),
        "centre": ObjectId("5d887961c919fd001c866e51"),
        "date": ISODate("2019-10-28 08:30:00.000Z"),
        "archivedAt": ISODate("2019-10-31 16:18:07.837Z"),
        "archiveReason": "OK",
        "isCandilib":true
       }]
    , 
    "archivedAt": ISODate("2019-10-31 16:18:07.837Z"),
    "archiveReason": "OK"
   },'
done
echo '])'

echo 'db.getCollection("candidats").insertMany(['
NB_INDEX=$i
NB_MAX=$(($i+$NB_ABSENT-1))
for ((i=$NB_INDEX;i<=$NB_MAX;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="test.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo '{ "codeNeph": "'$CODENEF'",
   "prenom": "TEST",
   "nomNaissance": "'$NOM'",
   "isValidatedByAurige": true,
   "isValidatedEmail": true,
   "adresse": "40 Avenue des terroirs de France 75012 Paris",
   "portable": "0676543986",
   "email": "'$MAIL'",
   "departement": "'$DEP'",
   "noReussites": [
       {
           "date": ISODate("2019-10-28 00:00:00.000Z"),
           "reason":"Absent"
       }
   ],
   "places":[
       {
        "inspecteur": ObjectId("5d887961c919fd001c866e64"),
        "centre": ObjectId("5d887961c919fd001c866e51"),
        "date": ISODate("2019-10-28 08:30:00.000Z"),
        "archivedAt": ISODate("2019-10-31 16:18:07.837Z"),
        "archiveReason": "EXAM_FAILED",
        "isCandilib":true
       }]
},'
done

NB_INDEX=$i
NB_MAX=$(($i+$NB_ECHEC-1))
for ((i=$NB_INDEX;i<=$NB_MAX;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="test.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo '{ "codeNeph": "'$CODENEF'",
   "prenom": "TEST",
   "nomNaissance": "'$NOM'",
   "isValidatedByAurige": true,
   "isValidatedEmail": true,
   "adresse": "40 Avenue des terroirs de France 75012 Paris",
   "portable": "0676543986",
   "email": "'$MAIL'",
   "departement": "'$DEP'",
   "noReussites": [
       {
           "date": ISODate("2019-10-28 00:00:00.000Z"),
           "reason":"Echec"
       }
   ],
   "places":[
       {
        "inspecteur": ObjectId("5d887961c919fd001c866e64"),
        "centre": ObjectId("5d887961c919fd001c866e51"),
        "date": ISODate("2019-10-28 08:30:00.000Z"),
        "archivedAt": ISODate("2019-10-31 16:18:07.837Z"),
        "archiveReason": "EXAM_FAILED",
        "isCandilib":true
       }]
},'
done

NB_INDEX=$i
NB_MAX=$(($i+$NB_CANCELED-1))
for ((i=$NB_INDEX;i<=$NB_MAX;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="test.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo '{ "codeNeph": "'$CODENEF'",
   "prenom": "TEST",
   "nomNaissance": "'$NOM'",
   "isValidatedByAurige": true,
   "isValidatedEmail": true,
   "adresse": "40 Avenue des terroirs de France 75012 Paris",
   "portable": "0676543986",
   "email": "'$MAIL'",
   "departement": "'$DEP'",
   "noReussites": [
       {
           "date": ISODate("2019-10-28 00:00:00.000Z"),
           "reason":"Annulé"
       }
   ],
   "places":[
       {
        "inspecteur": ObjectId("5d887961c919fd001c866e64"),
        "centre": ObjectId("5d887961c919fd001c866e51"),
        "date": ISODate("2019-10-28 08:30:00.000Z"),
        "archivedAt": ISODate("2019-10-31 16:18:07.837Z"),
        "archiveReason": "EXAM_FAILED",
        "isCandilib":true
       }]
},'
done

NB_INDEX=$i
NB_MAX=$(($i+$NB_NO_ADMISSIBLE-1))
for ((i=$NB_INDEX;i<=$NB_MAX;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="test.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo '{ "codeNeph": "'$CODENEF'",
   "prenom": "TEST",
   "nomNaissance": "'$NOM'",
   "isValidatedByAurige": true,
   "isValidatedEmail": true,
   "adresse": "40 Avenue des terroirs de France 75012 Paris",
   "portable": "0676543986",
   "email": "'$MAIL'",
   "departement": "'$DEP'",
   "noReussites": [
       {
           "date": ISODate("2019-10-28 00:00:00.000Z"),
           "reason":"Non recevable"
       }
   ],
   "places":[
       {
        "inspecteur": ObjectId("5d887961c919fd001c866e64"),
        "centre": ObjectId("5d887961c919fd001c866e51"),
        "date": ISODate("2019-10-28 08:30:00.000Z"),
        "archivedAt": ISODate("2019-10-31 16:18:07.837Z"),
        "archiveReason": "EXAM_FAILED",
        "isCandilib":true
       }]
},'
done

NB_INDEX=$i
NB_MAX=$(($i+$NB_NO_EXAMINABLE-1))
for ((i=$NB_INDEX;i<=$NB_MAX;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="test.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo '{ "codeNeph": "'$CODENEF'",
   "prenom": "TEST",
   "nomNaissance": "'$NOM'",
   "isValidatedByAurige": true,
   "isValidatedEmail": true,
   "adresse": "40 Avenue des terroirs de France 75012 Paris",
   "portable": "0676543986",
   "email": "'$MAIL'",
   "departement": "'$DEP'",
   "noReussites": [
       {
           "date": ISODate("2019-10-28 00:00:00.000Z"),
           "reason":"Non examinable"
       }
   ],
   "places":[
       {
        "inspecteur": ObjectId("5d887961c919fd001c866e64"),
        "centre": ObjectId("5d887961c919fd001c866e51"),
        "date": ISODate("2019-10-28 08:30:00.000Z"),
        "archivedAt": ISODate("2019-10-31 16:18:07.837Z"),
        "archiveReason": "EXAM_FAILED",
        "isCandilib":true
       }]
},'
done

#Candidat non validé par Aurige
NB_INDEX=$i
NB_MAX=$(($i+50-1))
for ((i=$NB_INDEX;i<=$NB_MAX;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="test.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo '
   { 
       "codeNeph": "'$CODENEF'",
       "prenom": "test",
       "nomNaissance": "'$NOM'",
       "isValidatedByAurige": false,
       "isValidatedEmail": true,
       "adresse": "40 Avenue des terroirs de France 75012 Paris",
       "portable": "0676543986",
       "email": "'$MAIL'",
       "departement": "93"
    },'
done

echo '])'