import getConfig from '../config.js'

/**
 * @function
 *
 * @returns {APIPaths}
 */
export default () => ({
  login: `${getConfig().api.apiUrl}/auth/admin/token`,
})

/**
 * @typedef {Object} APIPaths
 * @property {string} login URL complète pour l'obtention d'un JWT
 */
