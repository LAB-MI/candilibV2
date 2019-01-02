# Candilib

Code source de l'application pour que les usagers réservent eux-mêmes leur place d'examen

## Utilisation

### Dev

#### Lancer le conteneur de la base de données (mongodb)

```bash
cd server
docker-compose -f docker-compose.dev.db.yml up
```

#### Lancer les tests côté serveur

```bash
cd server
npm test
```

#### Lancer les tests côté serveur en mode surveillance

```bash
cd server
npm test:watch
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

## TODO

- Gestion des jwt (en cours)
- Définition des routes (en cours)
- Structure des données mongo
- Client Front-office (FO)
- Client Back-office (BO)
- Définition des conteneurs db.prod, back, client-fo, client-bo (en cours)
- Définition des docker-compose
