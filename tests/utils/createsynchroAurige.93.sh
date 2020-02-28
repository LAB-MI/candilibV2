#!/bin/bash
DEP=93
TEMPCODENEF=93000000000
NB_REUSSITE=50
NB_ABSENT=10
NB_ECHEC=20
NB_CANCELED=5
NB_NO_ADMISSIBLE=10
NB_NO_EXAMINABLE=5
#NB_TOTAL=100
NB_INDEX=1
for ((i=$NB_INDEX;i<=$NB_REUSSITE;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="TEST.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo  '{  
        "codeNeph": "'$CODENEF'", 
        "nomNaissance": "'$NOM'",
        "prenom": "TEST",
        "dateReussiteETG" : "2017-10-28",
        "nbEchecsPratiques" : "0",
        "dateDernierNonReussite" : "",
        "objetDernierNonReussite" : "",
        "reussitePratique" : "2019-10-31",
        "candidatExistant" : "OK"
    },'
done
NB_INDEX=$i
NB_MAX=$(($i+$NB_ABSENT-1))
for ((i=$NB_INDEX;i<=$NB_MAX;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="TEST.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo  '{  
        "codeNeph": "'$CODENEF'", 
        "nomNaissance": "'$NOM'",
        "prenom": "TEST",
        "dateReussiteETG" : "2017-10-28",
        "nbEchecsPratiques" : "1",
        "dateDernierNonReussite" : "2019-10-10",
        "objetDernierNonReussite" : "Absent",
        "reussitePratique" : "",
        "candidatExistant" : "OK"
    },'

done

NB_INDEX=$i
NB_MAX=$(($i+$NB_ECHEC-1))
for ((i=$NB_INDEX;i<=$NB_MAX;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="TEST.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo  '{  
        "codeNeph": "'$CODENEF'", 
        "nomNaissance": "'$NOM'",
        "prenom": "TEST",
        "dateReussiteETG" : "2017-10-28",
        "nbEchecsPratiques" : "1",
        "dateDernierNonReussite" : "2019-10-11",
        "objetDernierNonReussite" : "Echec",
        "reussitePratique" : "",
        "candidatExistant" : "OK"
    },'
done

NB_INDEX=$i
NB_MAX=$(($i+$NB_CANCELED-1))
for ((i=$NB_INDEX;i<=$NB_MAX;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="TEST.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo  '{  
        "codeNeph": "'$CODENEF'", 
        "nomNaissance": "'$NOM'",
        "prenom": "TEST",
        "dateReussiteETG" : "2017-10-28",
        "nbEchecsPratiques" : "1",
        "dateDernierNonReussite" : "2019-10-12",
        "objetDernierNonReussite" : "Annulé",
        "reussitePratique" : "",
        "candidatExistant" : "OK"
    },'
done

NB_INDEX=$i
NB_MAX=$(($i+$NB_NO_ADMISSIBLE-1))
for ((i=$NB_INDEX;i<=$NB_MAX;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="TEST.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo  '{  
        "codeNeph": "'$CODENEF'", 
        "nomNaissance": "'$NOM'",
        "prenom": "TEST",
        "dateReussiteETG" : "2017-10-28",
        "nbEchecsPratiques" : "1",
        "dateDernierNonReussite" : "2019-10-13",
        "objetDernierNonReussite" : "Non recevable",
        "reussitePratique" : "",
        "candidatExistant" : "OK"
    },'
done

NB_INDEX=$i
NB_MAX=$(($i+$NB_NO_EXAMINABLE-1))
for ((i=$NB_INDEX;i<=$NB_MAX;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="TEST.${DEP}.${i}"
   MAIL="test.${DEP}.${i}@test.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo  '{  
        "codeNeph": "'$CODENEF'", 
        "nomNaissance": "'$NOM'",
        "prenom": "TEST",
        "dateReussiteETG" : "2017-10-28",
        "nbEchecsPratiques" : "1",
        "dateDernierNonReussite" : "2019-10-14",
        "objetDernierNonReussite" : "Non examinable",
        "reussitePratique" : "",
        "candidatExistant" : "OK"
    },'
done
