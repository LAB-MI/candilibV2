# Configuration serveur Candilib
La configuration du serveur Candilib utilise des varaibles système. Les valeurs par défaut renseignées dans le fichier de configuration servent d'indication mais ne permettent pas un fonctionnement complet de l'application.

## Variables d'environnement
### Serveur de messagerie
Pour être en mesure d'envoyer des mails aux candidats, il faut définir les variables d'environnement  à l'aide des commandes suivantes :

 ```bash
 export SMTP_SERVER=<adresse_serveur_SMPT>
 export SMTP_USER=<compte_SMPT>
 export SMTP_PASS=<mot_de_passe>
 ```

 ### Base de données
 La création de la base de données et des comptes associés se fait en utilisant la variable d'environnement suivante :


 ```bash
 export DB_NAME=candilib
 export DB_ROOT=admin
 export DB_ROOT_PASS=password
 ```

Cette variable est utilisée lors du lancement du conteneur mongoDB via le fichier docker-compose.

Le fichier script d'initialisation `dev-setup/mongo_init.js` contient les informations pour la création de l'utilisateur de la base de données de l'application.

```js
user: "candilibAdmin",
pwd: "Admin*78",
```

 ## Connexion à la base de données
 La connexion à la base de données depuis le composant api se fait en utilisant les variables d'environnements :
 
 ```bash
 export DB_NAME=candilib
 export DB_USER=candilibAdmin
 export DB_PASS=Admin*78
 ```
### remarque
*Ces éléments de configuration peuvent être adaptés en fonction de l'environnement dans lequel l'application sera exécutée.*