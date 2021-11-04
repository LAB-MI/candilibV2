/**
 * Configuration de l'automate
 * @module config
 */
/**
 * @typedef {Object} SchedulerConfig
 * @property {Object} scheduler Info du scheduler
 * @property {Object} db Info de la base de données
 * @property {Object} api Info de l'API
 * @property {string} scheduler.schedulerName nom du scheduler
 * @property {string} scheduler.defaultConcurrency nombre d'occurence d'un job en cours d'execution
 * @property {string} db.dbName Nom de la base de données
 * @property {string} db.dbUser Login de l'utilisateur de la base de données
 * @property {string} db.dbPass Mot de passe de l'utilisateur de la base de données
 * @property {string} db.mongoUrl URL complet de la base de données
 * @property {string} db.agendaCollectionName Nom de la collection où seront stockés les jobs de agenda
 * @property {string} api.apiUrl URL de base de l'API : protocole, nom de domaine, préfixe
 * @property {string} api.apiLogin Login de l'utilisateur de l'API
 * @property {string} api.apiPass Mot de passe de l'utilisateur de l'API
 */

import { GET_API_VERSION_JOB, SORT_STATUS_CANDIDATS_JOB } from './jobs'

/**
 * @returns {SchedulerConfig}
 */
export default () => {
  const {
    SCHEDULER_NAME,

    AGENDA_COLLECTION_NAME,
    DB_NAME,
    DB_USER,
    DB_PASS,
    MONGO_URL,

    API_BASE_URL,
    API_PREFIX,

    API_LOGIN,
    API_PASS,

    DISABLE_SCHEDULE,
    DISABLE_DEFINE,
    JOB_LIST,
    TIMEOUT_START,
    TENANTNAME,
  } = process.env
  let list = [GET_API_VERSION_JOB, SORT_STATUS_CANDIDATS_JOB]
  if (JOB_LIST) {
    list = list.concat(process.env.JOB_LIST.split(','))
  }
  return {
    jobs: {
      schedule: !(DISABLE_SCHEDULE === 'true'),
      define: !(DISABLE_DEFINE === 'true'),
      list,
    },

    scheduler: {
      schedulerName: SCHEDULER_NAME || TENANTNAME + '-' + process.pid,
      defaultConcurrency: 1,
      TIMEOUT_START: TIMEOUT_START || 10000,
      defaultLockLifetime: 10000,
    },

    db: {
      dbName: DB_NAME,
      dbUser: DB_USER,
      dbPass: DB_PASS,
      mongoUrl: MONGO_URL,
      agendaCollectionName: AGENDA_COLLECTION_NAME || 'SchedulerJobs',
    },

    api: {
      apiUrl: API_BASE_URL + API_PREFIX,
      apiLogin: API_LOGIN,
      apiPass: API_PASS,
    },
  }
}
