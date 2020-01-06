
# Règles générales pour les traces

## Quoi tracer

- Toutes les demandes d'écriture en base de données au niveau des 'POST' de controllers et par qui.
- Avoir un minimum de traces de niveau "debug" sur certaines données utiles dans le cas d'un bug et pour suivre les appels
- Toutes les erreurs

## Format json

| clé | valeur | description |
|-----|--------|-------------|
| section | `admin-...` ou `candidat-...` | Pour indiquer si la fonctionnalité se situe côté administrateur ou côté candidat |
| action | nom de la fonction ou action | nom ou clé représentant l'action de la partie code |
| admin | `req.userId` | id de l'utilisateur |
| func | nom de la fonction | Surtout pour le debug |
| error | Objet ou instance de `Error` | Afficher les piles d'appels pour les exceptions ou toute autre erreur |
| description | message d'erreur ou autre message | |

Clé à ne pas utliser en JSON : message, sinon, cela entraîne la suppression des autres clés

## Trace minimum

### Dans les controllers, sur les post

- Tracer la fonctionnalité et les paramètres d'entrée utiles avec le niveau info :
  - `section`
  - `action`
  - `id` de l'utilisateur
  - listes des arguments/paramètres/queries utiles pour le controller
  - description

Exemple:

```javascript
appLogger.info({
    section: 'admin-update-place',
    admin: req.userId,
    placeId,
    inspecteur,
    action: 'UPDATE_RESA',
    description: `Changer l'inspecteur de la réservation candidat`,
})
```

- Tracer le résultat envoyé avec le niveau debug:
  - `section`
  - `action`
  - `id` de l'utilisateur
  - arguments des arguments/paramètres/queries pour le controller
  - résultats

### Dans les 'catch'

- Tracer les erreurs avec le niveau error ou warning :
  - `section`
  - `action`
  - `id` de l'utilisateur
  - `error` ou au moins message d'erreur

Exemple:

```javascript
appLogger.error({
    section: 'admin-update-place',
    admin: req.userId,
    action: 'ERROR',
    description: 'Description plus compréhensible que le message de l\'erreur',
    error: error,
})
```

### Dans les 'business'

- Tracer l'appel de la fonction en niveau debug
  - func
  - arguments utiles pour la fonction

Exemple:

```javascript
appLogger.debug({
    func: 'getDatesByCentre',
    departement,
    centre,
    beginDate,
    endDate,
})
```
