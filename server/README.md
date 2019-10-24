# Configuration serveur Candilib

La configuration du serveur Candilib utilise des variables systèmes.

Les valeurs par défaut renseignées dans le fichier de configuration servent d'indications mais ne permettent pas un fonctionnement complet de l'application.

## Variables d'environnement

### Serveur de messagerie

Pour être en mesure d'envoyer des mails aux candidats, il faut définir les variables d'environnement suivantes :

```bash
SMTP_SERVER=<adresse_serveur_SMPT>
SMTP_USER=<compte_SMPT>
SMTP_PASS=<mot_de_passe>
```

Par exemple à l'aide des commandes suivantes sur les systèmes *nix :

```bash
export SMTP_SERVER=<adresse_serveur_SMTP>
export SMTP_USER=<compte_SMTP>
export SMTP_PASS=<mot_de_passe>
export SMTP_PORT=<port_server_SMTP>
```

### Base de données

La création de la base de données et du compte administrateur _global_ de la __base de donnée__ se fait en utilisant les variables d'environnement suivantes :

```bash
DB_NAME=candilib
DB_ROOT=admin
DB_ROOT_PASS=password
```

Par exemple à l'aide des commandes suivantes sur les systèmes *nix :

```bash
export DB_NAME=candilib
export DB_ROOT=admin
export DB_ROOT_PASS=password
```

Les données de l'application Candilib sont stockées dans une base définie dans une variable d'environnement :

```bash
export DB_NAME=candilib
```

Le compte administrateur de la base de données de __l'application Candilib__ est défini en utilisant les variables d'environnement suivantes :

```bash
export DB_USER=adminCandilib
export DB_PASS=changeme78
```

Ces variables doivent être définies __avant__ le lancement du conteneur mongoDB via le fichier __`docker-compose`__.

Le fichier script d'initialisation __`db/init-mongo.sh`__ contient les informations pour la création de l'utilisateur de la base de données de l'application.

## Connexion à la base de données depuis l'application

La connexion à la base de données depuis le composant api se fait en utilisant les variables d'environnements :

```bash
export DB_NAME=candilib
export DB_USER=candilibAdmin
export DB_USER=changeme78
```

## Remarques

1. En mode développement, ces variables d'environnement peuvent être présentes dans un fichier unique nommé `.env` dans le répertoire `server`
   sous la forme `VARIABLE=Valeur`, à raison d'une variable par ligne : voir le fichier `.env-example` ;
2. Ces éléments de configuration peuvent être adaptés en fonction de l'environnement dans lequel l'application sera exécutée.

# Serveur de messagerie de test

Un service de messagerie (mailHog) est disponible sous forme de conteneur pour effectuer des tests en local. La documentation est disponible sur GitHub : https://github.com/mailhog/MailHog

## Démarrage en mode dev

Pour démarer le conteneur mailhog:

```bash
make mailhog-up
```

Pour arrêter et supprimer le conteneur:

```bash
make mailhog-stop mailhog-rm
```
