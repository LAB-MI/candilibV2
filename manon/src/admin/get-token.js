/**
 * Fonctions pour récupérér un JWT valide
 * @module
 */

import base64 from 'js-base64'
import getConfig from '../config.js'
import { postJson } from '../utils/index.js'

/**
 * Récupère un nouveau JWT
 *
 * @async
 * @function
 *
 * @returns {Promise<string>} A new token
 */
const getNewToken = async () => {
  const { api: { apiUrl, apiLogin, apiPass } } = getConfig()
  const tokenUrl = `${apiUrl}/auth/admin/token`
  const body = {
    email: apiLogin,
    password: apiPass,
  }
  const responseBody = await postJson({ url: tokenUrl, body })

  if (!responseBody.success) {
    throw new Error(responseBody.message)
  }
  return responseBody.token
}

let token

/**
 * Récupère un JWT valide
 *
 * @async
 * @function
 *
 * @returns {Promise<string>} A valid token
 */
export const getToken = async () => {
  const isStillValid = checkTokenIsValidAtLeast(token, 30)
  if (!isStillValid) {
    token = undefined
  }

  if (!token) {
    token = await getNewToken()
  }

  return token
}

/**
 * Vérifie si le JWT _token_ sera encore valide au moins pendant _n_ secondes
 *
 * @function
 *
 * @param {string} token JWT pour lequel on veut vérifier la validité
 * @param {number} n Nombre minimal de _secondes_ pendant lequel le JWT doit être encore valide
 *
 * @returns {boolean} _true_ si le JWT _token_ sera encore valide dans _n_ secondes, _false_ sinon
 */
const checkTokenIsValidAtLeast = (token, n) => {
  if (!token || !n) {
    return false
  }

  const [, dataEncoded] = token.split('.')
  const data = base64.Base64.decode(dataEncoded)
  const exp = JSON.parse(data).exp
  return (exp - Date.now()) < n * 1000
}
