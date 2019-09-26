
/**
 * Module rassemblant toutes les tâches concernant les répartiteurs et les délégués
 * @module admin-jobs
 */

import getConfig from '../config.js'
import luxon from 'luxon'
import { postJson, appLogger } from '../utils/index.js'

import { getToken } from './get-token.js'

const DateTime = luxon.DateTime

/**
 * @function
 *
 * @param {import('agenda').Job} job Job de agenda
 *
 * @throws Lève une erreur avec le message retourné par l'API dans la propriété `message`
 *   si l'API retourne un objet avec `success` à `false`
 * @returns {string} Message retourné par l'API
 */
export const sendBordereaux = async job => {
  const { apiUrl } = getConfig().api
  const token = await getToken()

  const body = await postJson({
    url: apiUrl + '/admin/bordereaux',
    body: {
      departement: '93',
      date: DateTime.local().plus({ days: 1 }),
      isForInspecteurs: true,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!body.success) {
    appLogger.warn({
      func: 'sendBordereaux',
      description: body.message,
    })

    throw new Error(body.message)
  }

  appLogger.info({
    func: 'sendBordereaux',
    description: 'Bordereaux sent',
  })
  return body.message
}
