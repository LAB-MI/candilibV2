/**
 * @typedef {Object} ManonConfig
 * @property {Object} db Info de la base de données
 * @property {Object} api Info de l'API
 * @property {string} db.dbName Nom de la base de données
 * @property {string} db.dbUser Login de l'utilisateur de la base de données
 * @property {string} db.dbPass Mot de passe de l'utilisateur de la base de données
 * @property {string} db.agendaCollectionName Nom de la collection où seront stockés les jobs de agenda
 * @property {string} api.apiUrl URL de base de l'API : protocole, nom de domaine, préfixe
 * @property {string} api.apiLogin Login de l'utilisateur de l'API
 * @property {string} api.apiPass Mot de passe de l'utilisateur de l'API
 */

/**
 * @returns {ManonConfig}
 */
export default () => {
  const {
    AGENDA_COLLECTION_NAME,
    DB_NAME,
    DB_USER,
    DB_PASS,

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
      agendaCollectionName: AGENDA_COLLECTION_NAME,
    },

    api: {
      apiUrl: API_BASE_URL + API_PREFIX,
      apiLogin: API_LOGIN,
      apiPass: API_PASS,
    },
  }
}
