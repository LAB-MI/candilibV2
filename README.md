# Candilib

Code source de l'application de réservation en ligne de places à l'examen pratique du permis de conduire. Ce service public est à destination des usagers [inscrits sur le système de l'ANTS](https://permisdeconduire.ants.gouv.fr/Services-associes/Effectuer-une-demande-de-permis-de-conduire-en-ligne) et ayant réussi l'épreuve pratique du code de la route.

## Installation

### Prérequis

#### Node (et npm)

https://nodejs.org/fr/

#### Docker

Mac OS : https://hub.docker.com/editions/community/docker-ce-desktop-mac

Windows : https://hub.docker.com/editions/community/docker-ce-desktop-windows

Ubuntu : https://docs.docker.com/install/linux/docker-ce/ubuntu/

Ne pas oublier d'effectuer les étapes post-installation sur Ubuntu:

https://docs.docker.com/install/linux/linux-postinstall/

#### Robo 3T

https://robomongo.org/download

Attention, **ne pas télécharger** Studio 3T, mais **télécharger Robo 3T**

### Installation

#### Cloner le projet

```bash
git clone https://github.com/LAB-MI/candilibV2.git
```

#### Installation avec npm

1. Lancer la base de données :

```bash
cd server
npm run db
```

2. Installer les dépendances

```bash
npm install
```

3. Créer les variables d'environnements

Lire le fichier `server/README.md` et créer un fichier `.env` avec les variables correspondantes. 
(Se créer éventuellement un compte mailtrap.io)

4. Lancer le script npm pour peupler la bdd

```bash
npm run dev-setup
```

5. Se connecter à la bdd

Ouvrir Robo3t, créer une nouvelle connection. Dans l'onglet d'authentification, remplir:

```
Database: candilib
User: adminCandilib
Password: changeme78
```

6. Lancer le serveur node avec le code de l'API

Toujours dans le répertoire `server`

Ajouter la variable d'environnement pour avoir la date en français

```bash
export NODE_ICU_DATA=`pwd`/node_modules/full-icu
```

Puis lancer le serveur

```bash
npm run dev
```

7. Installer les dépendances du front

Dans un nouveau terminal

```bash
cd ../client
npm install
```

8. Lancer le front

```bash
npm start
```

Ceci lance webpack-dev-server avec la configuration  de vue-cli.

9. Se connecter en tant qu'admin

Aller à http://localhost:8080/candilib

Et utiliser le compte suivant:

- login : `admin@example.com`
- mot de passe : `Admin*78`

10. Aller à calendrier et uploader le fichier `dev-setup/planning-93.csv`

#### Installation avec Docker

(nécessite la version 19 de Docker-Compose)

1. Créer les images Docker

à la racine du projet:

```bash
make build-all NPM_AUDIT_DRY_RUN=false
```
Vérifier les images crées avec

```bash
docker images
```

2. Lancer les conteneurs

```bash
export FRONT_ADMIN_PORT=81
export DBDATA=../test-db
make up-all
```

Vérifier les conteneurs avec

```bash
docker ps
```

Pour effectuer les tests:

```bash
make test-all
```

3. Accéder au site

http://localhost:80 pour le site candidat
http://localhost:81 pour le site admin

4. Pour éteindre les conteneurs

```bash
make down-all
```


## Utilisation

### Dev

#### Lancer le conteneur de la base de données (mongodb)

```bash
cd server
npm run db
```

#### Lancer les tests côté serveur

```bash
cd server
npm test
```

#### Lancer les tests côté serveur en mode surveillance

```bash
cd server
npm run test:watch
```

#### Lancer le serveur en mode dev

Le serveur sera rechargé à chaque modification du code serveur
(toute modification dans `server/src`)

```bash
cd server
npm install
npm run dev
```

### Lancer cypress en mode developpeur

Pour lancer les tests Cypress sur la stack candilib développeur:

* démarrer les composants serveurs (API, DB, Mailhog et Mongo-express) et initialiser la base avec les données de dev-setup
* démarrer le front
* lancer Cypress avec l'option build pour ne pas initialiser la base

```bash
make -C server up-dev init-db-e2e
cd client
npm start
npm run test:e2e -- --env build=1
```

Pour arrêter:

```bash
make -C server down-dev
```

### Lancer en local les tests de CI

Travis utilise le fichier .travis.yml décrivant les étapes de build et des tests, il est possible de lancer les tests en local en lançant :

* Les commandes de la section before_install du fichier .travis.yml
* Puis le script ci/run-tests.sh

Cette étape construit :

* les images docker candilib
* démarre la stack candilib
* initialise la base de données avec les données de tests
* construit les images Cypress et MailHog
* démarre la stack de tests
* exécute les scénarios et détruits les stacks à la fin

### Lancer le serveur en mode production

Transpiler les ESM et lancer le serveur en mode production

```bash
cd server
npm install
npm start
```

C'est le répertoire `dist` qui contient l'application.
C'est le fichier `index.js` dans ce répertoire qui est lancé.
