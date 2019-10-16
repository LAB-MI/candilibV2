/**
 * @typedef {Object} SchedulerConfig
 * @property {Object} db Info de la base de données
 * @property {Object} api Info de l'API
 * @property {string} db.dbName Nom de la base de données
 * @property {string} db.dbUser Login de l'utilisateur de la base de données
 * @property {string} db.dbPass Mot de passe de l'utilisateur de la base de données
 * @property {string} db.mongoUrl URL complet de la base de données
 * @property {string} db.agendaCollectionName Nom de la collection où seront stockés les jobs de agenda
 * @property {string} api.apiUrl URL de base de l'API : protocole, nom de domaine, préfixe
 * @property {string} api.apiLogin Login de l'utilisateur de l'API
 * @property {string} api.apiPass Mot de passe de l'utilisateur de l'API
 */

/**
 * @returns {SchedulerConfig}
 */
export default () => {
  const {
    AGENDA_COLLECTION_NAME,
    DB_NAME,
    DB_USER,
    DB_PASS,
    MONGO_URL,

    API_BASE_URL,
    API_PREFIX,

    API_LOGIN,
    API_PASS,
  } = process.env

  return {
    db: {
      dbName: DB_NAME,
      dbUser: DB_USER,
      dbPass: DB_PASS,
      mongoUrl: MONGO_URL,
      agendaCollectionName: AGENDA_COLLECTION_NAME,
    },

    api: {
      apiUrl: API_BASE_URL + API_PREFIX,
      apiLogin: API_LOGIN,
      apiPass: API_PASS,
    },
  }
}
