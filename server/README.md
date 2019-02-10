# Configuration serveur Candilib
La configuration du serveur Candilib utilise des variables système. Les valeurs par défaut renseignées dans le fichier de configuration servent d'indication mais ne permettent pas un fonctionnement complet de l'application.

## Variables d'environnement
### Serveur de messagerie
Pour être en mesure d'envoyer des mails aux candidats, il faut définir les variables d'environnement  à l'aide des commandes suivantes :

 ```bash
 export SMTP_SERVER=<adresse_serveur_SMPT>
 export SMTP_USER=<compte_SMPT>
 export SMTP_PASS=<mot_de_passe>
 ```

 ### Base de données
 La création de la base de données et du compte administrateur _global_ se fait en utilisant les variables d'environnement suivantes :

 ```bash
 export DB_NAME=candilib
 export DB_ROOT=admin
 export DB_ROOT_PASS=password
 ```
 Les données de l'application Candilib sont stockées dans une base définie dans une variable d'environnement :
 
 ```bash
 export DB_NAME=candilib
 ```

Le compte administrateur de la base de données de l'application Candilib est définit en utilisant les variables d'environnement suivantes :

 ```bash
 export DB_USER=candilibAdmin
 export DB_PASS=Admin*78
 ```

Ces variables doivent etre définies avant le lancement du conteneur mongoDB via le fichier docker-compose.

Le fichier script d'initialisation `db/init-mongo.sh` contient les informations pour la création de l'utilisateur de la base de données de l'application.

 ## Connexion à la base de données depuis l'application
 La connexion à la base de données depuis le composant api se fait en utilisant les variables d'environnements :
 
 ```bash
 export DB_NAME=candilib
 export DB_USER=candilibAdmin
 export DB_PASS=Admin*78
 ```
### remarques
*Ces éléments de configuration peuvent être adaptés en fonction de l'environnement dans lequel l'application sera exécutée.*
