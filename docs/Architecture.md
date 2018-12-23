# Architecture globale

## Principes

L'application Candilib s'articule autour de 3 parties :

* ``frontal`` qui fournit les applications en fonctions des profils des utilisateurs
* ``back`` qui dispose d'un ensemble d'api utilisée par les applications web et par les composants de gestion
* ``persistance des données`` qui persiste les informations nécessaires au fonctionnement de Candilib

L'application s'adresse aux candidats et aux agents qui impliqués dans la gestion des examens pratiques sur l'ensemble du territoir. La partie ``frontal`` est séparée en deux parties distinctes pour chacune de ces populations. De plus, chaque composant dispose de ces propres routes vers la partie ``back`` qui assure le filtrage en fonction de l'origine des requêtes.

La partie ``back`` assure le traitement applicatif de Candilib. Elle est constitué d'un composant qui met à disposition via des API les différents services applicatifs. Ces derniers sont dédiés à un ``frontal`` et aux composants internes de gestion.

La partie ``persistance des données`` garantie :

* la disponibilité
* la fiabilité
* l'intégrité

Le schéma ci-dessous synthésite ces principes d'architecture.
