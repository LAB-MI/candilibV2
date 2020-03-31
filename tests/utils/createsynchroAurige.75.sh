#!/bin/bash
DEP=75
TEMPCODENEF=75000000000
for ((i=1;i<=$1;i++));
do
#    echo $i 
   CODENEF=$((TEMPCODENEF+$i))
   NOM="TEST.${DEP}.${i}"
   MAIL="candilib.test+candidat${DEP}.${i}@gmail.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
    if [ ${i} = 1 ] 
    then 
        echo '['
    fi

   echo -n '{  
        "codeNeph": "'$CODENEF'", 
        "nomNaissance": "'$NOM'",
        "prenom": "TEST",
        "dateReussiteETG" : "2017-10-28",
        "nbEchecsPratiques" : "0",
        "dateDernierNonReussite" : "",
        "objetDernierNonReussite" : "",
        "reussitePratique" : "",
        "candidatExistant" : "OK"
    }'
    if [ ${i} = $1 ] 
    then 
        echo ']' 
    else  
        echo ','
    fi

done