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

 ## Connexion à la base de données
 ### pré-requis
La sécurisation de l'accès au serveur Mongo est réalisé en créant un compte administrateur global de la base et un compte administrateur de la base de données de l'application candilib.

*Cette méthode suppose que le client mongo est installé et que l'application utilise une base de données appelée **candilib**.*

La création du compte administrateur se fait en utilisant les commandes suivantes :

```bash
$ mongo
> use admin
> db.createUser({
    user: "admin",
    pwd: "Admin*78",
    roles: [{
        role: "userAdminAnyDatabase",
        db: "admin"
        },
        "readWriteAnyDatabase"
        ],
    mechanisms: [
        "SCRAM-SHA-1"
    ]})
```

La création du compte administrateur de la base de données de l'application Candilib se fait au travers des commandes suivantes :

```bash
$ mogo
> use candilib
> db.createUser({
    user: "candilibAdmin",
    pwd: "Admin*78",
    roles: [{
        role: "dbOwner",
        db: "candilib"
        },
    ],
    mechanisms: [
        "SCRAM-SHA-1"
    ]})
```

 ### configuration
 Les données de l'application Candilib sont stockées dans une base définie dans une variable d'environnement :
 
 ```bash
 export DB_NAME=candilib
 ```

 La connexion à la base de données Mongo utilise un compte défini en utilisant les varaibles d'environnement suivantes :

 ```bash
 export DB_USER=candilibAdmin
 export DB_PASS=Admin*78
 ```

 Ces éléments de configuration peuvent être adaptés en fonction de l'environnement dans lequel l'application sera exécutée.