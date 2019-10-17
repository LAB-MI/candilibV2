
/**
 * Module rassemblant toutes les tâches concernant les répartiteurs et les délégués
 * @module admin-jobs
 */

import getConfig from '../config.js'
import { DateTime } from 'luxon'
import { getText, getJson, postJson, appLogger } from '../utils/index.js'

import { getToken } from './get-token.js'

/**
 * @function
 *
 * @param {import('agenda').Job} job Job de agenda
 *
 * @throws Lève une erreur avec le message retourné par l'API dans la propriété `message`
 *   si l'API retourne un objet avec `success` à `false`
 * @returns {string} Message retourné par l'API
 */
export const hello = async job => {
  appLogger.info({ description: 'Hello' })
}


export const getApiVersion = async job => {
  const { apiUrl } = getConfig().api
//  const token = await getToken()

  appLogger.info({ description: 'getApiVersion ' + apiUrl })
  const body = await getText(apiUrl + '/version')

  appLogger.info({
    func: 'getApiVersion',
    description: 'getApiVersion success '+ body,
  })
  return body
}

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
