# Principes généraux

## Fonctions candidats

### Inscription

Le service Candilib est ouvert aux personnes souhaitant passer l'épreuve pratique du permis de
conduire. Pour cela, elles doivent s'inscrire sur le site en fournissant les informations
suivantes :

* NEPH : numéro fourni par l'ANTS lors de l'inscription en tant que candidat au permis de
  conduire (Code & Conduite)
* Nom de naissance
* Prénom
* Adresse email
* Numéro de téléphone portable
* Adresse postale

Lorsque l'inscription est validée (par Aurige, qui fait les vérifications listées plus loin),
le candidat peut sélectionner un lieu et une date de passage de l'épreuve pratique. Ce choix
peut être modifié par le candidat dans la limite des disponibilités.

### Vérifications et contrôles

Le passage de l'épreuve pratique du permis de conduire nécessite que les candidats satisfassent
un ensemble de critères :

* un NEPH valide et correspondant au Nom fournit ;
* avoir réussi l'épreuve théorique (ETG) du code de la route depuis moins de 5 ans ;
* ne pas avoir échoué plus de 5 fois à l'épreuve pratique ;
* et bien sûr ne pas être déjà en possession d'un permis valide.

Le respect de l'ensemble de ces critères permet de valider l'inscription et d'accéder au service Candilib.

### Critères post inscription

Des contrôles réguliers sont effectués pour réévaluer les critères des candidats inscrits. Ce
travail de vérification porte sur les points suivants :

* réussite de l'épreuve pratique ;
* date d'obtention du code supérieure à 5 ans ;
* 5 échecs à l'épreuve pratique.

Si un candidat réponds à un de ces trois critères, il n'est plus en mesure de se présenter à
l'épreuve pratique et est donc supprimé de la liste des utilisateurs de Candilib et archivés,
notamment pour des besoins statistiques, mais également pratique (pouvoir communiquer à un
candidat la raison de la suppression de son compte de l'application).

Le candidat se voit dans l'impossibilité de sélectionner une nouvelle date d'examen avant un délai de 45 jours suivant la date de son passage dans le d'un échec à l'épreuve pratique pour une des raisons suivantes :

* note insuffisante
* défaut ne permettant pas le bon déroulement de l'examen (non présentation des papiers d'identité par exemple)
* absence le jour de l'examen

### Sélection d'un centre d'examen

Lors de sa connexion, un candidat se voit proposer, par défaut, les centres d'examen de son département de résidence en se basant sur l'adresse postale qu'il a renseignée lors de son inscription.

### Sélection d'un date de passage de l'examen (réservation)

Lorsqu'un candidat est validé, il peut accéder au site (via le magic link envoyé dans le mail de confirmation) et sélectionner une des places d'examen disponibles. Les candidats ne peuvent voir que les places disponibles à J + 7 jours de la date de connexion :

```fr
Si un candidat se connecte le 1er avril, il ne verra que les places disponibles après le 8 avril inclus.
```

### Modification de réservation

Les candidats peuvent annuler ou modifier leur réservation sans contrainte jusqu'à 7 jours avant la date de l'examen.

Si un candidat annule ou modifie sa date d'examen à moins de 7 jours de l'examen, une pénalité de 45 jours à partir de sa date d'examen est appliquée. Il ne verra que les places disponibles après ce délai de pénalité et ne pourra donc changer que pour une de ces dates.

```fr
Si un candidat ayant réservé le 1er avril annule ou modifie sa date d'examen après le 25 mars, il ne pourra pas voir de nouvelles dates d'examen libres avant le 15 mai. En revanche, il pourra sélectionner une place sans attendre le 15 mai.
```

## Fonctions répartiteurs

La gestion des places d'examen est assurée par les délégués à la sécurité routière et les agents de la répartion. Les éléments qui suivent décrivent les différentes fonctions disponibles dans la partie administrateur.

L'ensemble des informations présentées dans les différents écran sont filtrées par le département dans lequel le répartiteur travail. Ce ou ces départements (au maximum 2) sont associés à un répartiteur.

### Injection des planning des places d'examen

### Modification des places d'examen

### Gestion de la liste blanche des candidats invités à l'expérimentation

### Gestion des candidats

## Règles de gestion

Cette partie se veut une synthèse des différentes règles de gestion décrite dans les précédentes parties.

### Eligibilité d'un candidat

Retour Aurige correct :

* candidatExistant : "OK"
* reussitePratique : ""
* dateReussiteETG : < 5 ans

### Visibilité des places disponibles

Les candidats ne peuvent voir que les places disponibles à plus de 7 jours de la date courante de connexion.

### Application du délai de repassage

Un délai de 45 jours, à compter de la date de passage d'examen, pour pouvoir réserver une nouvelle date est appliqué dans les 3 cas suivants :

* Annulation de la réservation dans un délai inférieur à 7 jours avant la date de passage
* Changement de date dans un délai inférieur à 7 jours avant la date initiale de passage
* Date échue du passage de l'examen quelque soit le retour de la synchronisation Aurige

### Incohérences de places d'examen

Une place est définie par un lieu, un horaire et un inspecteur. Les critères suivants permettent de détecter une anomalie dans la création des places d'examen :

* Un inspecteur ne peut pas assurer deux examens le même jour à la même heure
* Un inspecteur ne peut être affecté sur deux sites différents dans la même journée
