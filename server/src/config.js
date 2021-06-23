/**
 * Module de configuration de l'application
 * @module config
 */
// import moment from 'moment'
import { ObjectLastNoReussitValues } from './models/candidat/objetDernierNonReussite.values'
import { getNumberSecondRemainingInTheDay } from './util'

/**
 *
 * Détermine si l'application tourne en mode production
 * @constant {boolean} isProduction
 */
const isProduction = process.env.NODE_ENV === 'production'

/**
 * URL d'accès à l'application, important pour la configuration du router vue-router
 * @constant {string} DEFAULT_PUBLIC_URL
 */
const DEFAULT_PUBLIC_URL = isProduction
  ? 'https://beta.interieur.gouv.fr/candilib'
  : 'http://localhost:8080/candilib'

const DEFAULT_ADMIN_URL = 'http://localhost:8080/candilib'

/**
 * Dictionnaire des différents types de statuts des utilisateurs de l'application
 * @constant {Object}
 */
const userStatuses = {
  CANDIDAT: 'candidat',
  REPARTITEUR: 'repartiteur',
  DELEGUE: 'delegue',
  ADMIN: 'admin',
  TECH: 'tech',
}

/**
 * Liste des différents statuts des utilisateurs de l'application
 * ordonnée selon leur niveau d'accès
 *
 * @constant {string[]}
 */
const userStatusesOrderedList = [
  userStatuses.CANDIDAT,
  userStatuses.REPARTITEUR,
  userStatuses.DELEGUE,
  userStatuses.ADMIN,
  userStatuses.TECH,
]

/**
 * Dictionnaire des différents niveaux de permission des utilisateurs de l'application
 * @constant {Object}
 */
const userStatusLevels = userStatusesOrderedList.reduce((acc, value, index) => {
  return {
    ...acc,
    [value]: index,
  }
}, {})

/**
 * Dictionnaire des fonctionnalitées à activer ou non
 * @constant {Object}
 */
const features = {
  AURIGE: 'aurige',
  UNARCHIVE_CANDIDAT: 'unarchive-candidat',
  STATS_KPI: 'stats-kpi',
  AGENTS: 'agents',
  CENTRES: 'centres',
  DEPARTEMENTS: 'departements',
  TECH: 'tech-admin',
}

/**
 * Dictionnaire des différentes fonctionnalités accessibles selon le type d'utilisateurs de l'application
 * @constant {Object}
 */
const userStatusAccess = {
  [userStatuses.CANDIDAT]: [],
  [userStatuses.REPARTITEUR]: [],
  [userStatuses.DELEGUE]: [
    features.AGENTS,
    features.CENTRES,
    features.STATS_KPI,
  ],
  [userStatuses.ADMIN]: [
    features.AGENTS,
    features.AURIGE,
    features.UNARCHIVE_CANDIDAT,
    features.CENTRES,
    features.DEPARTEMENTS,
    features.STATS_KPI,
    features.TECH,
  ],
  [userStatuses.TECH]: [features.AURIGE, features.STATS_KPI, features.UNARCHIVE_CANDIDAT],
}

const timeoutToRetryBy = {
  [ObjectLastNoReussitValues.ABSENT]:
      process.env.TIMEOUT_TO_RETRY_ABSENT !== undefined
        ? Number(process.env.TIMEOUT_TO_RETRY_ABSENT)
        : 60,
  default:
    process.env.TIMEOUT_TO_RETRY !== undefined
      ? Number(process.env.TIMEOUT_TO_RETRY)
      : 45,
}

const config = {
  secret: process.env.SECRET || 'secret',
  // TODO: Unused process.env.CANDIDAT_EXPIREDIN
  get candidatTokenExpiration () {
    return getNumberSecondRemainingInTheDay()
  },
  get repartiteurTokenExpiration () {
    return getNumberSecondRemainingInTheDay()
  },
  get delegueTokenExpiration () {
    return getNumberSecondRemainingInTheDay()
  },
  get adminTokenExpiration () {
    return getNumberSecondRemainingInTheDay()
  },
  get techTokenExpiration () {
    return process.env.TECH_EXPIREDIN || '1h'
  },

  userStatuses,
  features,

  userStatusLevels,
  userStatusesOrderedList,
  userStatusFeatures: userStatusAccess,

  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPass: process.env.DB_PASS,

  mailFrom: process.env.MAIL_FROM || 'noreply@localhost.com',

  smtpServer: process.env.SMTP_SERVER || 'localhost',
  smtpService: process.env.SMTP_SERVICE || undefined,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpPort: process.env.SMTP_PORT || 25,
  smtpMaxConnections: process.env.SMTP_MAX_CONNECTIONS || 1,
  smtpRateDelta: process.env.SMTP_RATE_DELTA || 1000,
  smtpRateLimit: process.env.SMTP_RATE_LIMIT || undefined,
  smtpMaxAttemptsToSend: process.env.SMTP_MAX_ATTEMPS_TO_SEND || 10,

  PUBLIC_URL: process.env.PUBLIC_URL || DEFAULT_PUBLIC_URL,
  ADMIN_URL: process.env.ADMIN_URL || DEFAULT_ADMIN_URL,
  LINE_DELAY: Number(process.env.LINE_DELAY) || 30,
  CANDIDAT_ROUTE: '/candidat',
  ADMIN_ROUTE: '/admin',

  delayToBook:
    process.env.DELAY_TO_BOOK !== undefined
      ? Number(process.env.DELAY_TO_BOOK)
      : 7,
  timeoutToRetry: timeoutToRetryBy.default,
  daysForbidCancel:
    process.env.DAYS_FORBID_CANCEL !== undefined
      ? Number(process.env.DAYS_FORBID_CANCEL)
      : 7,
  numberOfVisibleMonths:
    process.env.NUMBER_VISIBLE_MONTHS !== undefined
      ? Number(process.env.NUMBER_VISIBLE_MONTHS)
      : 3,
  timeoutToRetryBy,
}

/**
 * Données de connexion à la base de données
 * @constant {Object}
 */
export const dbOptions = {
  db: config.dbName,
  user: config.dbUser,
  pass: config.dbPass,
}

/**
 * Nom du type de logs
 * @constant {String}
 */
export const logsTypeNameForDepartement = 'logs-requests-departement'

/**
 * Nom du type de logs
 * @constant {String}
 */
export const logsTypeNameForHomeDepartement = 'logs-requests-home-departement'

/**
 * Heures de sauvegarde des logs : [0, 4, 6, 9, 11, 13, 17, 21]
 * @constant {Array}
 */
export const hoursOfSavedLogs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 21, 22, 23]

/**
 * Nombre maximum d'éssai captcha
 * @constant {Number}
 */
export const tryLimit = 3

/**
 * Nombre de minute a à attendre après avoir dépassé le nombre limite d'éssai
 * @constant {Number}
 */
export const nbMinuteBeforeRetry = 2

/**
 * Durée de validité du captcha en minute
 * @constant {Number}
 */
export const captchaExpireMintutes = 1

/**
 * Nombre d'images pour le captcha
 * @constant {Number}
 */
export const numberOfImages = 6

/**
 * Données de connexion au serveur de SMTP pour les envois de mail
 * @constant {Object}
 */
export const smtpOptions = {
  host: config.smtpServer,
  port: config.smtpPort,
  secure: false,
  tls: {
    // do not failed with selfsign certificates
    rejectUnauthorized: false,
  },
}

if (config.smtpUser) {
  smtpOptions.auth = {
    user: config.smtpUser,
    pass: config.smtpPass,
  }
}

if (config.smtpService) {
  smtpOptions.service = config.smtpService
}

export const NbDaysInactivityDefault = 60

export default config
