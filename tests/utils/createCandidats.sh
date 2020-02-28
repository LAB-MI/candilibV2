#!/bin/bash
for ((i=1;i<=20000;i++));
do
#    echo $i 
   CODENEF=$((93000000000+$i))
   NOM='test'$i
   MAIL='test'$i'@test.com'
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo '{ "codeNeph": "'$CODENEF'","prenom": "TEST","nomNaissance": "'$NOM'","isValidatedByAurige": false,"isValidatedEmail": true,"adresse": "40 Avenue des terroirs de France 75012 Paris","portable": "0676543986","email": "'$MAIL'","departement": "93"},'
done