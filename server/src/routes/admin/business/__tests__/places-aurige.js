import { dateTimeDernierEchecPratique } from './candidats-aurige'
import config from '../../../../config'
import { createTestPlace } from '../../../../models/__tests__/places'

export const placeBeforTimeOutRetry = {
  date: dateTimeDernierEchecPratique
    .plus({ days: config.timeoutToRetry - 1 })
    .toISO({ zone: 'utc' }),
  centre: 'Centre 1',
  inspecteur: 'Inspecteur 1',
}

export const placeAfterTimeOutRetry = {
  date: dateTimeDernierEchecPratique
    .plus({ days: config.timeoutToRetry + 1 })
    .toISO({ zone: 'utc' }),
  centre: 'Centre 2',
  inspecteur: 'Inspecteur 2',
}
const places = [placeBeforTimeOutRetry, placeAfterTimeOutRetry]

export const createPlacesToTest = async () => {
  return Promise.all(places.map(createTestPlace))
}
