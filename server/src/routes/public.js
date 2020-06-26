import express from 'express'

import { getActiveDepartementsId } from './common/departement-controllers'
import { getCentresByDepartement } from './common/centre-controllers'

const router = express.Router()

/**
 *  @swagger
 *  /public/departements:
 *    get:
 *      tags: ["Public"]
 *      summary: Récupère la liste des départements
 *      responses:
 *        200:
 *          description: Succès de la requête
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    description: Succès de la requête
 *                  departementsId:
 *                    type: array
 *                    description: Liste des id de départements
 *                example: ["93","75"]
 *
 *        500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 */

/**
 * Route pour obtenir la liste des départements
 *
 * @see {@link http://localhost:8000/api-docs/#/Public/get_departements}
 */

router.get('/departements', getActiveDepartementsId)

/**
 *  @swagger
 *  /public/centres:
 *    get:
 *      tags: ["Public"]
 *      summary: Récupère une liste de centres
 *      description: Récupère soit la liste de tous les centres, soit la liste des centres d'un département
 *      parameters:
 *       - in: query
 *         name: departementId
 *       - in: query
 *         name: uniq
 *      responses:
 *        200:
 *          description: Succès de la requête
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    description: Succès de la requête
 *                  deptCenters:
 *                    type: array
 *                    description: Liste des centres du département
 *                    items:
 *                      $ref: '#/components/schemas/CentreObject'
 *                  example: [{
 *                    "geoloc":{
 *                      "coordinates": [2.473647,48.883956],
 *                      "type":"Point"
 *                      },
 *                    "_id":"5ddd59350a738b2913dac14a",
 *                     "nom":"Rosny sous bois",
 *                    "label":"Centre d'examen du permis de conduire de Rosny sous bois",
 *                    "adresse":"99 avenue du général de Gaulle 93110 Rosny sous bois",
 *                    "departement":"75"
 *                    }]
 *        500:
 *          $ref: '#/components/responses/UnknownErrorResponse'
 */

/**
 * Route pour obtenir la liste des centres d'un département
 *
 */
router.get('/centres', getCentresByDepartement)

export default router
