/**
 * Routeur concernant les requêtes que peut faire un utilisateur
 * @module routes/admin
 */

import express from 'express'

import { getCandidats, importCandidats } from './candidats.controllers'
import { getMe } from './admin.controllers'
import { getInspecteurs } from './inspecteurs.controllers'
import {
  createPlaceByAdmin,
  deletePlaceByAdmin,
  deletePlacesByAdmin,
  getPlaces,
  importPlaces,
  sendScheduleInspecteurs,
  updatePlaces,
} from './places.controllers'
import {
  getStatsPlacesExam,
  getStatsResultsExam,
} from './statistics.controllers'
import { removeReservationByAdmin } from './reservations.controllers'
import {
  getWhitelisted,
  addWhitelisted,
  removeWhitelisted,
} from './whitelisted.controllers'
import {
  verifyAccessAurige,
  verifyRepartiteurDepartement,
  verifyRepartiteurLevel,
  verifyUserLevel,
} from './middlewares'
import config from '../../config'

const router = express.Router()

router.use(verifyRepartiteurLevel())

router.post(
  '/bordereaux',
  verifyRepartiteurDepartement,
  sendScheduleInspecteurs
)

/**
 * @swagger
 *
 * /admin/me:
 *   get:
 *     tags: [Admin]
 *     summary: Récupération de mes infos administrateur
 *     description: Après connexion, renvoie les infos de l'administrateur connecté (id dans le JWT envoyé en header)
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Succès de la requête
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminInfo'
 *
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 */

/**
 * Après connexion, renvoie les infos de l'administrateur connecté (id dans le JWT envoyé en header)
 *
 * @callback getMe
 * @see {@link http://localhost:8000/api-docs/#/default/get_admin_me}
 */

router.get('/me', getMe)

/**
 * @swagger
 *
 * /admin/candidats:
 *   get:
 *     tags: [Admin]
 *     summary: Récupération des infos candidat
 *     description: L'administrateur récupère les informations d'un ou plusieurs candidats
 *     produces:
 *      - application/json
 *      - text/csv
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departement
 *         schema:
 *           type: number
 *           example: 93
 *         required: false
 *         description: Un département accessible par l'admin
 *       - in: query
 *         name: matching
 *         schema:
 *           type: string
 *           example: 'Dupont'
 *         required: false
 *         description: Une chaîne de caractères pour chercher un candidat
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           example: 'csv'
 *         required: false
 *         description:
 *           Si `csv`, exporte les candidats au format csv.
 *           Fonctionne correctement seulement si le champ `for` est rempli avec `aurige`
 *       - in: query
 *         name: for
 *         schema:
 *           type: string
 *           example: 'aurige'
 *         required: false
 *         description:
 *           Si `aurige`, considère que l'action aura pour but la synchronisation avec aurige.
 *           Généralement utilisé dans le cas d'un export csv.
 *     responses:
 *       200:
 *         description: Succès de la requête
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               description: Liste des candidats correspondants aux critères
 *               items:
 *                 $ref: '#/components/schemas/CandidatObject'
 *             example: [ {
 *               isValidatedByAurige: true,
 *               isValidatedEmail: true,
 *               nbEchecsPratiques: 0,
 *               _id: 5cf63145b2a7cffde20e98b7,
 *               adresse: 40 Avenue des terroirs de France 75012 Paris,
 *               codeNeph: 093496239512,
 *               email: mayswaisey@candilib.com,
 *               nomNaissance: SWAISEY,
 *               portable: 0603765291,
 *               prenom: MAY,
 *               departement: 75
 *               }]
 *           text/csv:
 *             schema:
 *               type: text/csv
 *             example: |-
 *               Code NEPH;Nom de naissance;Nom d'usage;Prénom;email
 *               093496239512;SWAISEY;SWAISEY;MAY;mayswaisey@candilib.com
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 * /admin/candidats/{candidatId}:
 *   get:
 *     tags: [Admin]
 *     summary: Récupération des infos candidat
 *     description: L'administrateur récupère les informations d'un candidat via son id
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidatId
 *         schema:
 *           type: string
 *           example: '5cf63145b2a7cffde20e98b7'
 *         required: true
 *         description: Identifiant du candidat
 *       - in: query
 *         name: departement
 *         schema:
 *           type: number
 *           example: 93
 *         required: false
 *         description: Un département accessible par l'admin
 *     responses:
 *       200:
 *         description: Succès de la requête, retourne le candidat suivi des informations sur sa place en cours
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   description: Status de la requête, dans ce cas `true`
 *                 candidat:
 *                   $ref: '#/components/schemas/CandidatObject'
 *             example:
 *               success: true
 *               candidat:
 *                 isValidatedByAurige: true
 *                 isValidatedEmail: true
 *                 nbEchecsPratiques: 0
 *                 _id: 5cf63145b2a7cffde20e98b7
 *                 adresse: 40 Avenue des terroirs de France 75012 Paris
 *                 codeNeph: 093496239512
 *                 email: mayswaisey@candilib.com
 *                 nomNaissance: SWAISEY
 *                 portable: 0603765291
 *                 prenom: MAY
 *                 departement: 75
 *
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 */

/**
 * L'administrateur récupère les informations d'un ou plusieurs candidats
 *
 * @callback getCandidats
 * @see {@link http://localhost:8000/api-docs/#/default/get_admin_candidats}
 */
router.get(
  '/candidats/:id?',
  verifyRepartiteurDepartement,
  verifyAccessAurige,
  getCandidats
)

/**
 * @swagger
 *
 * /admin/candidats:
 *   post:
 *     tags: [Admin]
 *     summary: Ajout des candidats
 *     description: Import des candidats via le fichier délivré par aurige. Nécessite les droits administrateur
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier au format JSON contenant les candidats
 *
 *     responses:
 *       200:
 *         description: Succès de la requête
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - fileName
 *                 - success
 *                 - message
 *                 - candidats
 *               properties:
 *                 fileName:
 *                   type: string
 *                   description: Le nom du fichier qui a été synchronisé
 *                 success:
 *                   type: boolean
 *                   description: Booléen à `true` si l'action a été effectuée en entier et correctement, à `false` sinon.
 *                 message:
 *                   type: string
 *                   description: Un message compréhensible par l'usager
 *                 candidats:
 *                   type: array
 *                   description: La liste des candidats traités et le status du traitement
 *                   items:
 *                     type: object
 *                     required:
 *                       - nom
 *                       - neph
 *                       - status
 *                       - details
 *                       - message
 *                     properties:
 *                       nom:
 *                         type: string
 *                         description: Nom du candidat
 *                       neph:
 *                         type: string
 *                         description: NEPH du candidat
 *                       status:
 *                         type: string
 *                         description: status du traitement
 *                       details:
 *                         type: string
 *                         description: details sur le traitement
 *                       message:
 *                         type: string
 *                         description: message de retour du traitement
 *               example:
 *                   fileName: aurige.json
 *                   success: true
 *                   message: Le fichier aurige.json a été synchronisé.
 *                   candidats: [ {
 *                     nom: CANDIDAT,
 *                     neph: 0123456789,
 *                     status: error,
 *                     details: NOT_FOUND,
 *                     message: Ce candidat 0123456789/CANDIDAT est inconnu de Candilib
 *                     }]
 *
 *       400:
 *         description: Fichier manquant
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Fichier manquant
 *
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 */

/**
 * Import des candidats via le fichier délivré par aurige
 *
 * @callback importCandidats
 * @see {@link http://localhost:8000/api-docs/#/default/post_admin_candidats}
 */
router.post(
  '/candidats',
  verifyUserLevel(config.userStatusLevels.admin),
  importCandidats
)

/**
 * @swagger
 *
 * /admin/inspecteurs:
 *   get:
 *     tags: [Admin]
 *     summary: Récupération des infos inspecteur
 *     description: L'administrateur récupère les informations d'un ou plusieurs inspecteurs
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: matching
 *         schema:
 *           type: string
 *           example: Dupont
 *         required: false
 *         description: Une chaîne de caractères pour chercher un inspecteur
 *       - in: query
 *         name: departement
 *         schema:
 *           type: number
 *           example: 93
 *         required: false
 *         description: S'il est entré comme seul paramètre, renvoie tous les inspecteurs d'un département
 *       - in: query
 *         name: centreId
 *         schema:
 *           type: string
 *           example: 5d8b7c6429cd5b2468d3f161
 *         required: false
 *         description:
 *           Remplir pour chercher les inspecteurs affectés à un centre pendant une période donnée.
 *           Ne fonctionne que si `begin` et `end` sont aussi paramétrés
 *       - in: query
 *         name: begin
 *         schema:
 *           type: string
 *           example: 2019-09-25 14:40:36.724Z
 *         required: false
 *         description:
 *           Début de la période de recherche d'inspecteurs.
 *           Ne fonctionne que si `centreId` et `end` sont aussi paramétrés
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           example: 2019-09-25 14:40:36.724Z
 *         required: false
 *         description:
 *           Fin de la période de recherche d'inspecteurs.
 *           Ne fonctionne que si `centreId` et `begin` sont aussi paramétrés
 *
 *     responses:
 *       200:
 *         description: Succès de la requête
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               description: Liste des inspecteurs correspondants aux critères
 *               items:
 *                 type: object
 *                 description: Informations de l'inspecteur
 *                 required:
 *                   - _id
 *                   - email
 *                   - matricule
 *                   - nom
 *                   - prenom
 *                   - departement
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Identifiant de l'inspecteur
 *                   email:
 *                     type: string
 *                     description: Adresse courriel de l'inspecteur
 *                   matricule:
 *                     type: string
 *                     description: Matricule de l'inspecteur
 *                   nom:
 *                     type: string
 *                     description: Nom de l'inspecteur
 *                   prenom:
 *                     type: string
 *                     description: Prénom de l'inspecteur
 *                   departement:
 *                     type: string
 *                     description: Code du département de l'inspecteur
 *             example: [ {
 *               _id: 5d970a006a503f67d254124d,
 *               email: dupond.jacques@email.fr,
 *               matricule: 01020301,
 *               nom: DUPOND,
 *               prenom: Jacques,
 *               departement: 93
 *               }]
 *
 *       400:
 *         description: Les paramètres de la requête ne conviennent pas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Certains paramètres ne sont pas définis
 *
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 */

/**
 * L'administrateur récupère les informations d'un ou plusieurs inspecteurs
 *
 * @callback getInspecteurs
 * @see {@link http://localhost:8000/api-docs/#/default/get_admin_inspecteurs}
 */
router.get('/inspecteurs', getInspecteurs)

router.post('/place', verifyRepartiteurDepartement, createPlaceByAdmin)
router.delete('/place/:id', deletePlaceByAdmin)
router.get('/places', verifyRepartiteurDepartement, getPlaces)
router.post('/places', verifyRepartiteurDepartement, importPlaces)
router.delete('/places', deletePlacesByAdmin)
router.patch('/places/:id', verifyRepartiteurDepartement, updatePlaces)
router.delete('/reservations/:id', removeReservationByAdmin)

/**
 * @swagger
 *
 * /admin/stats-places-exams:
 *   get:
 *     summary: Récupération des statsKpi places
 *     description: Permet de récupérer les statistiques sur les places d'examens de chaque département.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: isCsv
 *         schema:
 *           type: string
 *           example: true
 *         description: Demande d'un fichier CSV des stats places d'examens
 *
 *     responses:
 *       500:
 *         description: Erreur lors de la récupération des départements
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Oups, un problème est survenu. L'administrateur a été prévenu.
 *       200:
 *         description: Stats par départements
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StatsKpiObject'
 *                 - example:
 *                     success: true
 *                     message: Les stats ont bien été mises à jour
 *                     statsKpi: [{
 *                         beginDate: 2019-10-10T22:00:00.000Z,
 *                         departement: 93,
 *                         totalBookedPlaces: 2,
 *                         totalPlaces: 622,
 *                         totalCandidatsInscrits: 2
 *                      }]
 */

router.get(
  '/stats-places-exams',
  verifyUserLevel(config.userStatusLevels.delegue),
  getStatsPlacesExam
)

/**
 * @swagger
 *
 * /admin/stats-results-exams:
 *   get:
 *     summary: Récupération des statsKpi de résultats d'examens sur une période passée
 *     description: Permet de récupérer les statistiques sur les places d'examens de chaque département.
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: beginPeriod
 *         schema:
 *           type: string
 *           example: 2019-10-10T22:00:00.000Z
 *         description: Date de début de période
 *         required: true
 *       - in: query
 *         name: endPeriod
 *         schema:
 *           type: string
 *           example: 2019-09-10T22:00:00.000Z
 *         description: Date de fin de période
 *         required: true
 *       - in: query
 *         name: isCsv
 *         schema:
 *           type: string
 *           example: true
 *         description: Demande d'un fichier CSV des stats résultats de place
 *
 *     responses:
 *       500:
 *         description: Erreur lors de la récupération des départements
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Oups, un problème est survenu. L'administrateur a été prévenu.
 *       200:
 *         description: Stats par départements
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/StatsKpiObject'
 *                 - example:
 *                     success: true
 *                     message: Les stats ont bien été mises à jour
 *                     statsKpi: [{
 *                         departement: "93",
 *                         date: "15/10/2019 à 11:00",
 *                         beginPeriode: "2019-09-14T22:00:00.000Z",
 *                         endPeriode: "2019-10-15T21:59:59.999Z",
 *                         absent: 3,
 *                         failed: 5,
 *                         notExamined: 2,
 *                         received: 15,
 *                      }]
 */

router.get(
  '/stats-results-exams',
  verifyUserLevel(config.userStatusLevels.delegue),
  getStatsResultsExam
)

/**
 * @swagger
 *
 * /admin/whitelisted/{whitelistedId}:
 *   delete:
 *     tags: [Admin]
 *     summary: Suppression d'un élément de la liste blanche
 *     description: L'administrateur supprime une adresse de la liste blanche à partir de son id
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: whitelistedId
 *         schema:
 *           type: string
 *           example: 5d970a082a7710570f0fd7b8
 *         required: true
 *         description: Identifiant de l'adresse à supprimer
 *       - in: query
 *         name: departement
 *         schema:
 *           type: number
 *           example: 93
 *         required: false
 *         description: Un département accessible par l'admin
 *
 *     responses:
 *       200:
 *         description: Succès de la requête
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WhitelistedObject'
 *             example:
 *               _id: 5d970a082a7710570f0fd7b8
 *               email: candidat@candi.lib
 *               departement: 75
 *
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 */

/**
 * L'administrateur supprime une adresse de la whitelist
 *
 * @callback removeWhitelisted
 * @see {@link http://localhost:8000/api-docs/#/default/delete_admin_whitelisted}
 */
router
  .route('/whitelisted/:id')
  .all(verifyRepartiteurDepartement)
  .delete(removeWhitelisted)

/**
 * @swagger
 *
 * /admin/whitelisted:
 *   get:
 *     tags: [Admin]
 *     summary: Récupération d'éléments de la liste blanche
 *     description:
 *       L'administrateur récupère une ou plusieures adresses de la liste blanche.
 *       Si le paramètre `matching` n'est pas entré, cela renvoie les dernières adresses rentrées dans la base
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: matching
 *         schema:
 *           type: string
 *           example: dupont
 *         required: false
 *         description: Une chaîne de caractères pour chercher une adresse dans la liste blanche
 *
 *     responses:
 *       200:
 *         description: Succès de la requête
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               description:
 *                 Liste des adresses trouvées.
 *                 Si le paramètre `matching` n'est pas entré, cette liste se trouve dans une propriétée `lastCreated`
 *               items:
 *                 $ref: '#/components/schemas/WhitelistedObject'
 *             example: [ {
 *               _id: 5d970a082a7710570f0fd7b8,
 *               email: candidat@candi.lib,
 *               departement: 75
 *               }]
 *
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 *   post:
 *     tags: [Admin]
 *     summary: Ajout d'éléments dans la liste blanche
 *     description: L'administrateur ajoute une ou plusieures adresses dans la liste blanche.
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Adresses à ajouter dans la base
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Une adresse courriel à ajouter dans la base
 *               emails:
 *                 type: array
 *                 description: Une liste d'adresses courriel à ajouter dans la base
 *                 items:
 *                   type: string
 *               departement:
 *                 type: string
 *                 description: Le département dans lequel l'adresse sera ajoutée
 *           example:
 *             email: dupont@jean.fr
 *             emails: [
 *               dupont1@jean.fr,
 *               dupont2@jean.fr
 *               ]
 *             departement: "93"
 *
 *     responses:
 *       201:
 *         description: Succès de la requête
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/WhitelistedObject'
 *                 - $ref: '#/components/schemas/WhitelistedInfo'
 *             examples:
 *               une seule adresse:
 *                 schema:
 *                   $ref: '#/components/schemas/WhitelistedObject'
 *                 value:
 *                   _id: 5d970a082a7710570f0fd7b8
 *                   email: candidat@candi.lib
 *                   departement: 75
 *               plusieures adresses:
 *                 value:
 *                   code: 201
 *                   result: [{
 *                     code: 201,
 *                     email: dupont1@jean.fr,
 *                     success: true
 *                     },
 *                     {
 *                     code: 201,
 *                     email: dupont2@jean.fr,
 *                     success: true
 *                     }]
 *                   status: success
 *                   message: Tous les emails ont été ajoutés à la liste blanche
 *
 *       207:
 *         description: Succès de la requête, mais certaines adresses n'ont pu être enregistrées
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WhitelistedInfo'
 *             example:
 *               code: 207
 *               result: [{
 *                 code: 201,
 *                 email: dupont1@jean.fr,
 *                 success: true
 *                 },
 *                 {
 *                 code: 400,
 *                 email: dupont,
 *                 success: false,
 *                 message: "Whitelisted validation failed: email: Path `email` is invalid (dupont)."
 *                 }]
 *               status: warning
 *               message: Certains emails n'ont pas pu être ajoutés à la liste blanche
 *
 *       400:
 *         description: Paramètres manquants
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Either "email" or "emails" parameter must be sent in body
 *
 *       401:
 *         $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       409:
 *         description: Conflit dans les paramètres
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Parameters "email" and "emails" cannot be sent in the same request

 *       422:
 *         description: Aucune adresse n'a pu être ajoutée à la liste
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WhitelistedInfo'
 *             example:
 *               code: 422
 *               result: [{
 *                 code: 409,
 *                 email: dupont2@jean.fr,
 *                 success: false,
 *                 message: 'E11000 duplicate key error collection: candilib.whitelisted index: email_1 dup key: { : "dupont2@jean.fr" }'
 *                 },
 *                 {
 *                 code: 400,
 *                 email: dupont,
 *                 success: false,
 *                 message: "Whitelisted validation failed: email: Path `email` is invalid (dupont)."
 *                 }]
 *               status: error
 *               message: Aucun email n'a pu être ajouté à la liste blanche
 *
 *       500:
 *         $ref: '#/components/responses/UnknownErrorResponse'
 *
 */

/**
 * L'administrateur récupère ou ajoute une ou plusieures adresses de la liste blanche
 *
 * @callback getWhitelisted
 * @see {@link http://localhost:8000/api-docs/#/default/get_admin_whitelisted}
 * @callback addWhitelisted
 * @see {@link http://localhost:8000/api-docs/#/default/post_admin_whitelisted}
 */
router
  .route('/whitelisted')
  .all(verifyRepartiteurDepartement)
  .get(getWhitelisted)
  .post(addWhitelisted)

/**
 * @swagger
 *
 * /admin/users:
 *   post:
 *     tags: ["Administrateur"]
 *     summary: Création d'un utilisateur
 *     description: Création d'un utilisateur. Seul un admin peut créer un délégué (il peut aussi créer un répartiteur) et seul un délégué peut créer un répartiteur.
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Données du formulaire de création d'un utilisateur
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: repartiteur@example.com
 *                 description: Email de l'utilisateur
 *               departements:
 *                 type: array
 *                 example: ["93"]
 *                 description: Département de l'utilisateur
 *               status:
 *                 type: string
 *                 example: repartiteur
 *                 description: Statut de l'utilisateur
 *
 *
 *     responses:
 *       200:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: true
 *                     message: L'utilisateur a bien été créé
 *                     user: {
 *                        "email": "répartiteur@example.com",
 *                        "id": "85958545487523245",
 *                        "departements": ["93"],
 *                        "status": "repartiteur"
 *                     }
 *
 *       400:
 *         description: Paramètre(s) manquant(s)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Le code du département est manquant ou l'adresse courriel est invalide
 *
 *       401:
 *        $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 *
 *   get:
 *     tags: ["Administrateur"]
 *     summary: Récupération des informations de l'utilisateur
 *     description: Après connexion récupération de l'utilisateur. Seul un admin peut récupérer les informations d'un délégué (il peut aussi récupérer les informations d'un répartiteur) et seul un délégué peut récupérer les informations d'un répartiteur.
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: repartiteur@example.com
 *                 description: Email de l'utilisateur
 *               departements:
 *                 type: array
 *                 example: ["93"]
 *                 description: Département de l'utilisateur
 *               status:
 *                 type: string
 *                 example: repartiteur
 *                 description: Statut de l'utilisateur
 *
 *
 *     responses:
 *       200:
 *         description:
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: true
 *                     message: L'utilisateur a bien été trouvé
 *                     user: {
 *                        "email": "répartiteur@example.com",
 *                        "id": "85958545487523245",
 *                        "departements": ["93"],
 *                        "status": "repartiteur"
 *                     }
 *
 *       400:
 *         description: Paramètre(s) manquant(s)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Le code du département est manquant ou l'adresse courriel est invalide
 *
 *       401:
 *        $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 *
 *   put:
 *     tags: ["Administrateur"]
 *     summary: Modification d'un utilisateur
 *     description: Modification d'un utilisateur. Seul un admin peut modifier un délégué (il peut aussi modifier un répartiteur) et seul un délégué peut modifier un répartiteur.
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Données du formulaire de modification d'un utilisateur
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: repartiteur@example.com
 *                 description: Email de l'utilisateur
 *               departements:
 *                 type: array
 *                 example: ["93"]
 *                 description: Département de l'utilisateur
 *               status:
 *                 type: string
 *                 example: repartiteur
 *                 description: Statut de l'utilisateur
 *
 *
 *     responses:
 *       200:
 *         description: Utilisateur modifié
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: true
 *                     message: Les informations de l'utilisateur a bien été modifié
 *                     user: {
 *                        "email": "répartiteur@example.com",
 *                        "id": "85958545487523245",
 *                        "departements": ["93"],
 *                        "status": "repartiteur"
 *                     }
 *
 *       400:
 *         description: Paramètre(s) manquant(s)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Le code du département est manquant ou l'adresse courriel est invalide
 *
 *       401:
 *        $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 *
 *   delete:
 *     tags: ["Administrateur"]
 *     summary: Suppression d'un utilisateur
 *     description: Supression d'un utilisateur. Seul un admin peut supprimer un délégué (il peut aussi supprimer un répartiteur) et seul un délégué peut supprimer un répartiteur.
 *     produces:
 *      - application/json
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Données du formulaire de suppression d'un utilisateur
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: repartiteur@example.com
 *                 description: Email de l'utilisateur
 *               departements:
 *                 type: array
 *                 example: ["93"]
 *                 description: Département de l'utilisateur
 *               status:
 *                 type: string
 *                 example: repartiteur
 *                 description: Statut de l'utilisateur
 *
 *
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: true
 *                     message: L'utilisateur a bien été supprimé
 *                     user: {
 *                        "email": "répartiteur@example.com",
 *                        "id": "85958545487523245",
 *                        "departements": ["93"],
 *                        "status": "repartiteur"
 *                     }
 *
 *       400:
 *         description: Paramètre(s) manquant(s)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/InfoObject'
 *                 - example:
 *                     success: false
 *                     message: Le code du département est manquant ou l'adresse courriel est invalide
 *
 *       401:
 *        $ref: '#/components/responses/InvalidTokenResponse'
 *
 *       500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 *
 */

export default router
