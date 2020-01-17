import {
  dateTimeDernierEchecPratique,
  DateTimeReussiteETGKO,
} from './candidats-aurige'
import config from '../../../../config'
import { findCentreByName } from '../../../../models/centre'
import { findInspecteurByMatricule } from '../../../../models/inspecteur'
import { createPlace } from '../../../../models/place'
import { inspecteursTests } from '../../../../models/__tests__/inspecteurs'

export const placeBeforTimeOutRetry = {
  date: dateTimeDernierEchecPratique
    .plus({ days: config.timeoutToRetry - 1 })
    .toISO({ zone: 'utc' }),
  centre: 'Centre 1',
  inspecteur: inspecteursTests[0].matricule,
}

export const placeAfterTimeOutRetry = {
  date: dateTimeDernierEchecPratique
    .plus({ days: config.timeoutToRetry + 1 })
    .toISO({ zone: 'utc' }),
  centre: 'Centre 2',
  inspecteur: inspecteursTests[1].matricule,
}
const places = [placeBeforTimeOutRetry, placeAfterTimeOutRetry]

export const placeSameDateDernierEchecPratiqueForSuccess = {
  date: dateTimeDernierEchecPratique
    .startOf('day')
    .plus({ hours: 8 })
    .toISO({ zone: 'utc' }),
  centre: 'Centre 1',
  inspecteur: inspecteursTests[0].matricule,
}

export const placeSameDateDernierEchecPratique = {
  date: dateTimeDernierEchecPratique
    .startOf('day')
    .plus({ hours: 8 })
    .toISO({ zone: 'utc' }),
  centre: 'Centre 2',
  inspecteur: inspecteursTests[1].matricule,
}
export const placeNoSameDateDernierEchecPratique = {
  date: dateTimeDernierEchecPratique
    .plus({ days: 2, hours: 5 })
    .toISO({ zone: 'utc' }),
  centre: 'Centre 2',
  inspecteur: inspecteursTests[1].matricule,
}

export const placeAtETG = {
  date: DateTimeReussiteETGKO.plus({ years: 5, hours: 8 }).toISO({
    zone: 'utc',
  }),
  centre: 'Centre 1',
  inspecteur: inspecteursTests[0].matricule,
}

export const createTestPlaceAurige = async place => {
  const leanPlace = {
    date: place.date,
  }
  const inspecteur = await findInspecteurByMatricule(place.inspecteur)

  if (!inspecteur) {
    console.warn(`L'inspecteur ${place.inspecteur} non trouvé`)
  } else leanPlace.inspecteur = inspecteur._id

  const centre = await findCentreByName(place.centre)
  if (!centre) {
    console.warn(`Le centre ${place.centre} non trouvé`)
  } else leanPlace.centre = centre._id

  return createPlace(leanPlace)
}

export const createPlacesToTest = async () => {
  return Promise.all(places.map(createTestPlaceAurige))
}
