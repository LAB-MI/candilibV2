#!/bin/bash
for ((i=1;i<=20000;i++));
do
#    echo $i 
   CODENEF=$((93000000000+$i))
   NOM='test'$i
   MAIL='test'$i'@test.com'
#    echo $CODENEF ";" $NOM ";"  $MAIL
   echo  '{  
        "codeNeph": "'$CODENEF'", 
        "nomNaissance": "'$NOM'",
        "prenom": "TEST",
        "dateReussiteETG" : "2017-10-28",
        "nbEchecsPratiques" : "0",
        "dateDernierNonReussite" : "",
        "objetDernierNonReussite" : "",
        "reussitePratique" : "",
        "candidatExistant" : "OK"
    },'
done