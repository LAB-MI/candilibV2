#!/bin/bash
DEP=93
TEMPCODENEF=93000000000


for ((i=101;i<=150;i++));
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