import getConfig from '../../config.js'
import { DateTime } from 'luxon'
import { postJson, appLogger } from '../../utils/index.js'
import { getToken } from '../get-token.js'

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
