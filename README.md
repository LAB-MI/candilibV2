# Candilib

Code source de l'application pour que les usagers réservent eux-même leur place d'examen

## Utilisation

### Dev

#### Lancer le conteneur de la base de données (mongodb) :

```bash
cd server
docker-compose -f docker-compose.dev.db.yml up
```

#### Lancer serveur en mode dev :

Le serveur sera rechargé à chaque modification du code serveur
(toute modification dans `server/src`)

```bash
cd server
npm install
npm run dev
```

### Déploiement

Transpiler les ESM et lancer le serveur en mode production

```bash
cd server
npm install
npm start
```

C'est le répertoire `dist` qui contient l'application. C'est le fichier `index.js` dans
ce répertoire qu'il faudra lancer en production.

## TODO

- Démarrage en prod avec pm2
- Gestion des jwt
- Définition des routes
- Écriture de tests unitaires
- Structure des données mongo
- Client Front-office (FO)
- Client Back-office (BO)
- Définition des conteneurs db.prod, back, client-fo, client-bo
- Définition des docker-compose
- Liaison avec Travis et le Jenkins interne
