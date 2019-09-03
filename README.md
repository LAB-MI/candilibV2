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

```
git clone https://github.com/LAB-MI/candilibV2.git
```

#### Peupler la base de données Mongodb

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

1. Lancer le script npm pour peupler la bdd

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

```bash
npm run dev
```

7. Installer les dépendances du front

Dans un nouveau terminal

```bash
cd client
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

### Lancer le serveur en mode production

Transpiler les ESM et lancer le serveur en mode production

```bash
cd server
npm install
npm start
```

C'est le répertoire `dist` qui contient l'application.
C'est le fichier `index.js` dans ce répertoire qui est lancé.

