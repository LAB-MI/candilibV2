# Configuration de l'environnement de développement

Ce répertoire `dev-setup` comprend un ensemble de fichiers qui permettent d'initialiser un environnement de développement et de réaliser des tests de bon fonctionnement à la fois des composants et des règles de gestion de Candilib.

## Initialisation

Les fichiers suivants sont utilisés pour initier la base de données :

- `admins.json` : comprend la liste des répartiteurs
  - `admin@example.com` : est déclaré sur les départements 75 et 93
  - `admin75@example.com` : est affecté au département 75
  - `admin93@example.com` : est affecté au département 93
- `centres.json` : liste l'ensemble des centres d'examen connus de candilib
- `candidats.json` : permet de créer les différents candidats qui serviront pour les tests de connexion et de validation Aurige
- `aurigeV1.json` : premier format du fichier de validation retourné par Aurige
- `aurigeV2.json` : deuxième format du fichier de validation retourné par Aurige

## Jeu de test

Les candidats créés ont des profils différents qui permettent de tester les règles de gestion en place dans candilib. Les données retounées par Aurige ayant évolué, certains profils sont différents.

### aurigeV1

- `MAD Max` [Non éligible] : candidat ayant **réussi l'ETG et l'examen pratique**
- `ROCKATANSKY Jessie` [Non éligible] : candidat n'ayant pas réussi l'ETG et **inconnu de Aurige (NOK)**
- `GOOSE Jim` [Non éligible] : candidat ayant réussi l'ETG et échoué au moins une fois à l'examen pratique (B2 ou plus) et dont la **date d'obtention de l'ETG est supérieure à 5 ans**
- `CUTTER Toe` [Non éligible] : candidat n'ayant pas réussi l'ETG et **inconnu de Aurige (NOK Nom)**
- `BOY Johnny` [Non éligible] : candidat n'ayant **pas réussi l'ETG**
- `MCAFFEE Fifi` [Eligible] : candidat ayant réussi l'ETG et **ayant échoué au moins une fois à l'examen pratique (B1 ou plus)**
- `SWAISEY May` [Eligible] : candidat ayant réussi l'ETG et **ayant échoué au moins une fois à l'examen pratique (B1 ou plus)**
- `ZANETTI Bubba` [Eligible] : candidat ayant réussi l'ETG et ayant **échoué au moins une fois à l'examen pratique (B1 ou plus)**
- `BURNS Tim` [Eligible] : candidat ayant réussi l'ETG et ayant **échoué au moins une fois à l'examen pratique (B1 ou plus)**
- `CAMERON David` [Eligible] : candidat ayant réussi l'ETG et **n'ayant jamais à l'examen pratique**


### aurigeV2

- `MAD Max` [Non éligible] : candidat ayant **réussi l'ETG et l'examen pratique** et ayant eu précédemment **un échec à la pratique (B1)**
- `ROCKATANSKY Jessie` [Non éligible] : candidat n'ayant pas réussi l'ETG et **inconnu de Aurige (NOK)**
- `CUTTER Toe` [Non éligible] : candidat n'ayant pas réussi l'ETG et **inconnu de Aurige (NOK Nom)**
- `GOOSE Jim` [Non éligible] : candidat ayant réussi l'ETG et échoué 2 fois à l'examen pratique (B3) raison dernière non réussite : **Échec** et dont la **date d'obtention de l'ETG est supérieure à 5 ans**
- `BOY Johnny` [Non éligible] : candidat n'ayant **pas réussi l'ETG**
- `MCAFFEE Fifi` [Eligible] : candidat ayant réussi l'ETG et ayant **échoué une fois à l'examen pratique (B1)** raison dernière non réussite :  **Non recevable**
- `SWAISEY May` [Eligible] : candidat ayant réussi l'ETG et ayant **échoué 3 fois à l'examen pratique (B3)** raison dernière non réussite :  **Non examinable**
- `ZANETTI Bubba` [Eligible] : candidat ayant réussi l'ETG et ayant **échoué 4 fois à l'examen pratique (B4)** raison dernière non réussite :  **Absent**
- `BURNS Tim` [Non éligible] : candidat ayant réussi l'ETG et ayant **échoué 5 fois à l'examen pratique (B5)** raison dernière non réussite :  **Échec**
- `CAMERON David` [Eligible] : candidat ayant réussi l'ETG et **n'ayant jamais à l'examen pratique**

