#!/bin/bash
DEP=75
TEMPCODENEF=75000000000
for ((i=1;i<=$1;i++));
do
#    echo $i 
   CODENEF=$(($TEMPCODENEF+$i))
   NOM="test.${DEP}.${i}"
   MAIL="candilib.test+candidat${DEP}.${i}@gmail.com"
#    echo $CODENEF ";" $NOM ";"  $MAIL
    if [ ${i} = 1 ] 
    then 
        echo '['
    fi
   echo '
   { 
       "codeNeph": "'$CODENEF'",
       "prenom": "TEST",
       "nomNaissance": "'$NOM'",
       "isValidatedByAurige": false,
       "isValidatedEmail": true,
       "adresse": "40 Avenue des terroirs de France 75012 Paris",
       "portable": "0676543986",
       "email": "'$MAIL'",
       "departement": "'$DEP'"
    }'
    if [ ${i} = $1 ] 
    then 
        echo ']' 
    else  
        echo ','
    fi
done