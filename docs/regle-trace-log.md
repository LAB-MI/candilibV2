
## Règles générales pour les traces

### Quoi tracer?:

- Tous les demandes d'écriture en base de données au niveau des 'POST' de controllers et par qui.
- Avoir un minimum quelque de trace de niveau debug sur certain données sujet utils dans le cas d'un bug et pour suivre les appels
- Tous les erreurs ou les exceptions 

### Format json 


| clé | valeur | description |
|-----|--------|-------------|
| section | admin-... ou candidat-... | Pour indiquer la fonctionnalité se situe coté administrateur ou coté candidat |
| action | nom de la fonction ou action | nom ou clé représentant l'action du parti code |
| user | req.userId | id de l'utilisateur |
| func | nom de la fonction | Surtout pour le debug |
| error | error.stack | Afficher les piles d'appels pour les exceptions ou tous autres erreurs | 
| description | message de erreur ou autre message | |

Clé à ne pa utliser en json: message, sinon la suppression des autres clés 

### Trace minimum
#### Dans les controllers, sur les post

- Tracer la fonctionnalité et les paramètres d'entrés utiles avec le niveau info:
    - section
    - action
    - id de l'utilisateur
    - listes des arguments/paramètres/queries utiles pour le controller
    - description 
    
Exemple:
```javascript
    appLogger.info({
        section: 'admin-update-place',
        user: req.userId,
        placeId,
        inspecteur,
        action: 'UPDATE_RESA',
        description: `Changer l'inspecteur de la reservaton candidat`,
    })
```
- Tracer le résultat envoyée avec le niveau debug:
    - section
    - action
    - id de l'utilisateur
    - arguments des arguments/paramètres/queries pour le controller
    - resultats

#### Dans les 'catch'
- Tracer les erreurs avec le niveau error ou warning :
    - section
    - action
    - id de l'utilisateur
    - message d'erreur
    - Pile d'appels lié à erreur si possible ou l'exception 'Error'

Exemple: 
```javascript
    appLogger.error({
        section: 'admin-update-place',
        user: req.userId,
        action: 'ERROR',
        description: error.message,
        error: error.stack,
    })
```
#### Dans les 'bussiness'
- Tracer l'appel de la fonction en le niveau debug
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