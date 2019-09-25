/**
 * Module de configuration de l'application
 * @module config
 */
import moment from 'moment'

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
 * @constant {object}
 */
const userStatuses = {
  CANDIDAT: 'candidat',
  REPARTITEUR: 'repartiteur',
  DELEGUE: 'delegue',
  ADMIN: 'admin',
  TECH: 'tech',
}

/**
 * Dictionnaire des différents niveaux de permission des utilisateurs de l'application
 * @constant {object}
 */
const userStatusLevels = {
  [userStatuses.CANDIDAT]: 0,
  [userStatuses.REPARTITEUR]: 1,
  [userStatuses.DELEGUE]: 2,
  [userStatuses.ADMIN]: 3,
  [userStatuses.TECH]: 4,
}

/**
 * Dictionnaire des fonctionnalitées à activer ou non
 * @constant {object}
 */
const features = {
  AURIGE: 'aurige',
  STATS_KPI: 'stats-kpi',
}

/**
 * Dictionnaire des différentes fonctionnalités accessibles selon le type d'utilisateurs de l'application
 * @constant {object}
 */
const userStatusAccess = {
  [userStatuses.CANDIDAT]: [],
  [userStatuses.REPARTITEUR]: [],
  [userStatuses.DELEGUE]: [],
  [userStatuses.ADMIN]: [features.AURIGE, features.STATS_KPI],
  [userStatuses.TECH]: [features.AURIGE, features.STATS_KPI],
}

/**
 * Calcule la date d'expiration du token en ajoutant un jour à la date courante
 *
 * @function getTokenExpiration
 * @returns {string} Example : '36000s'
 */

const getTokenExpiration = () => {
  const now = moment()
  const midnight = now
    .clone()
    .hour(23)
    .minute(59)
    .second(59)
    .millisecond(0)

  if (midnight.isBefore(now)) {
    midnight.add(1, 'days')
  }

  const duration = midnight.diff(now) / 1000

  return duration + 's'
}

const config = {
  secret: process.env.SECRET || 'secret',
  candidatTokenExpiration: process.env.CANDIDAT_EXPIREDIN || '3d',
  get repartiteurTokenExpiration () {
    return getTokenExpiration()
  },
  get delegueTokenExpiration () {
    return getTokenExpiration()
  },
  get adminTokenExpiration () {
    return getTokenExpiration()
  },
  get techTokenExpiration () {
    return process.env.TECH_EXPIREDIN || '1h'
  },

  userStatuses,
  features,

  userStatusLevels,
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

  PUBLIC_URL: process.env.PUBLIC_URL || DEFAULT_PUBLIC_URL,
  ADMIN_URL: process.env.ADMIN_URL || DEFAULT_ADMIN_URL,
  CANDIDAT_ROUTE: '/candidat',
  ADMIN_ROUTE: '/admin',

  delayToBook:
    process.env.DELAY_TO_BOOK !== undefined
      ? Number(process.env.DELAY_TO_BOOK)
      : 7,
  timeoutToRetry:
    process.env.TIMEOUT_TO_RETRY !== undefined
      ? Number(process.env.TIMEOUT_TO_RETRY)
      : 45,
  daysForbidCancel:
    process.env.DAYS_FORBID_CANCEL !== undefined
      ? Number(process.env.DAYS_FORBID_CANCEL)
      : 7,
}

/**
 * Données de connexion à la base de données
 * @constant {object}
 */
export const dbOptions = {
  db: config.dbName,
  user: config.dbUser,
  pass: config.dbPass,
}

/**
 * Données de connexion au serveur de SMTP pour les envois de mail
 * @constant {object}
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

export default config
