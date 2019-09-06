/**
 * Module de configuration principale du serveur express
 * @module app
 */
import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import fileupload from 'express-fileupload'

import { loggerStream, jsonFormat } from './util/logger'
import routes from './routes'

import npmVersion from '../package.json'

const IP_QUALIF_CANDIDAT = process.env.IP_QUALIF_CANDIDAT
const IP_QUALIF_REPARTITEUR = process.env.IP_QUALIF_REPARTITEUR

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     InfoObject:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           description: Booléen à `true` si l'action a été effectuée en entier et correctement, à `false` sinon.
 *         message:
 *           type: string
 *           description: Un message compréhensible par l'usager
 *     CandidatInfo:
 *       type: object
 *       properties:
 *         candidat:
 *           type: object
 *           description: Informations sur le candidat
 *           properties:
 *             "adresse":
 *               type: string
 *               description: Adresse postale du candidat où lui seront envoyés les correspondances de l'adiminstation
 *             "codeNeph":
 *               type: string
 *               description: NEPH du candidat
 *             "email":
 *               type: string
 *               description: Adresse courriel du candidat
 *             "nomNaissance":
 *               type: string
 *               description: Nom de naissance du candidat
 *             "portable":
 *               type: string
 *               description: Numéro de mobile du candidat
 *             "prenom":
 *               type: string
 *               description: Prénom du candidat
 *             "departement":
 *               type: string
 *               description: Départementr du candidat
 *       example:
 *         "candidat":
 *           "adresse": "40 Avenue des terroirs de France 93000 Villepinte"
 *           "codeNeph": "093496239512"
 *           "email": "mayswaisey@candilib.com"
 *           "nomNaissance": "SWAISEY"
 *           "portable": "0603765291"
 *           "prenom": "MAY"
 *           "departement": "93"
 *
 */

/**
 * Préfixe de la version majeure de l'API
 */
export const apiPrefix = '/api/v2'

const isDevelopment = process.env.NODE_ENV === 'development'

const app = express()

/**
 * Use swagger-ui-express in development only
 */
if (isDevelopment) {
  const swaggerJsdoc = require('swagger-jsdoc')

  const options = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Candilib API',
        description: 'API Restful de Candilib',
        version: '2.0.4',
      },
      servers: [
        { url: 'http://localhost:8000/api/v2/', description: 'api-dev' },
        {
          url: 'http://localhost:8080/candilib/api/v2/',
          description: 'front-dev',
        },
        {
          url: `http://${IP_QUALIF_CANDIDAT}/candilib/api/v2/`,
          description: 'preprod candidat',
        },
        {
          url: `http://${IP_QUALIF_REPARTITEUR}/candilib-repartiteur/api/v2/`,
          description: 'preprod repartiteur',
        },
      ],
    },
    apis: ['./src/app.js', './src/routes/**/*.js'], // <-- We add this property:
  }

  const specs = swaggerJsdoc(options)

  const swaggerUi = require('swagger-ui-express')
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))
}

/**
 * @swagger
 *
 * /version:
 *   get:
 *     summary: Version exacte de l'API déployée
 *     description: Retourne la version exacte de l'API déployée
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Numéro de version détaillée de l'API déployée
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example:
 *               2.0.0-alpha.0
 *
 */
app.get(`${apiPrefix}/version`, function getVersion (req, res) {
  res.send(npmVersion.version)
})

app.use(morgan(jsonFormat, { stream: loggerStream }))
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
app.use(fileupload({ limits: { fileSize: 50 * 1024 * 1024 } }))

app.use(apiPrefix, routes)

export default app
