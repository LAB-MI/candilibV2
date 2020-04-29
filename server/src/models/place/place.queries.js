/**
 * Ensemble des actions sur les places dans la base de données
 * @module module:models/place/place-queries
 */
import mongoose from 'mongoose'

import Place from './place.model'
import { appLogger, techLogger } from '../../util'
import { createArchivedPlaceFromPlace } from '../archived-place/archived-place-queries'

export const PLACE_ALREADY_IN_DB_ERROR = 'PLACE_ALREADY_IN_DB_ERROR'

export const createPlace = async leanPlace => {
  const previousPlace = await Place.findOne(leanPlace)
  if (previousPlace && !(previousPlace instanceof Error)) {
    throw new Error(PLACE_ALREADY_IN_DB_ERROR)
  }

  const place = new Place(leanPlace)

  return place.save()
}

/**
 * Archiver et supprimer la place
 *
 * @async
 * @function
 * @see [createArchivedPlaceFromPlace]{@link module:models/archived-place/archived-place-queries.createArchivedPlaceFromPlace}
 *
 * @param {Place~PlaceModel} place La place à supprimer
 * @param {String[]} reasons Les raisons de la suppression
 * @param {String} byUser L'auteur de l'action
 * @param {Boolean} isCandilib Suppression lié à une réussite ou un echec d'un examen de candilib
 *
 * @return {Place~PlaceModel}
 */
export const deletePlace = async (place, reasons, byUser, isCandilib) => {
  if (!place) {
    throw new Error('No place given')
  }
  try {
    await createArchivedPlaceFromPlace(place, reasons, byUser, isCandilib)
  } catch (error) {
    techLogger.error({
      func: 'query-place-delete',
      action: 'archive-place',
      description: `Could not archive place { inspecteurId:${place.inspecteur}, centreId: ${place.centre}, date: ${place.date} }: ${error.message}`,
      error,
    })
  }
  const deletedPlace = place
  await place.delete()
  return deletedPlace
}

export const findAllPlaces = async () => {
  const places = await Place.find({})
  return places
}

export const findPlaceById = async id => {
  const placeQuery = Place.findById(id)
    .populate('candidat')
    .populate('centre')
  const place = await placeQuery
  return place
}
export const findPlaceByIdAndPopulate = async (id, populate) => {
  const query = Place.findById(id)
  queryPopulate(populate, query)
  const place = await query.exec()
  return place
}

export const findPlaceByCandidatId = async (id, populate) => {
  const query = Place.findOne({ candidat: new mongoose.Types.ObjectId(id) })
  if (populate) {
    query.populate('centre').populate('inspecteur')
  }
  const place = await query
  return place
}

/**
 * @function
 *
 * @param {string} centreId - Id du centre
 * @param {string} beginDate - Date au format ISO de debut de recherche
 * @param {string} endDate - Date au format ISO de fin de recherche
 *
 * @returns {import('mongoose').Query}
 */
const queryAvailablePlacesByCentre = (centreId, beginDate, endDate) => {
  const query = Place.where('centre').exists(true)
  if (beginDate || endDate) {
    query.where('date')

    if (beginDate) query.gte(beginDate)
    if (endDate) query.lt(endDate)
  }

  query.where('candidat').equals(undefined)

  return query.where('centre', centreId)
}

// TODO: Refactor
/**
 * @function
 *
 * @param {string} centresId - Ids des centres
 * @param {string} beginDate - Date au format ISO de debut de recherche
 * @param {string} endDate - Date au format ISO de fin de recherche
 *
 * @returns {import('mongoose').Query}
 */
const queryAvailablePlacesByCentres = (centreId, beginDate, endDate) => {
  const query = Place.where('centre').exists(true)
  if (beginDate || endDate) {
    query.where('date')

    if (beginDate) query.gte(beginDate)
    if (endDate) query.lt(endDate)
  }

  query.where('candidat').equals(undefined)

  return query.where('centre', centreId)
}

/**
 * @function
 *
 * @param {string} centreId - Id du centre
 * @param {string} beginDate - Date  au format ISO de debut de recherche
 * @param {string} endDate - Date au format ISO de fin de recherche
 *
 * @returns {Promise.<Place~PlaceModel[]>}
 */
export const findAllPlacesByCentre = (centreId, beginDate, endDate) => {
  const query = Place.where('centre').exists(true)
  if (beginDate || endDate) {
    query.where('date')

    if (beginDate) query.gte(beginDate)
    if (endDate) query.lt(endDate)
  }
  return query.where('centre', centreId).exec()
}

export const findAvailablePlacesByCentre = async (
  centreId,
  beginDate,
  endDate,
  populate
) => {
  appLogger.debug({
    func: 'findAvailablePlacesByCentre',
    args: { centreId, beginDate, endDate },
  })
  const query = queryAvailablePlacesByCentre(centreId, beginDate, endDate)
  queryPopulate(populate, query)
  const places = await query.exec()
  return places
}

// TODO: Refactor
export const findAvailablePlacesByCentres = async (
  centres,
  beginDate,
  endDate,
  populate
) => {
  appLogger.debug({
    func: 'findAvailablePlacesByCentre',
    args: { centres, beginDate, endDate },
  })

  const result = await Promise.all(
    centres.map(async centre => {
      const query = queryAvailablePlacesByCentres(centre._id, beginDate, endDate)
      queryPopulate(populate, query)
      return query.exec()
    }, {})
  )

  const finalResult = result.reduce((accu, places) => {
    return accu.concat(places)
  }, [])

  console.log('qwerty::002', finalResult.length)

  return finalResult
}

export const countAvailablePlacesByCentre = async (
  centreId,
  beginDate,
  endDate
) => {
  appLogger.debug({
    func: 'countAvailablePlacesByCentre',
    args: { centreId, beginDate, endDate },
  })

  const nbPlaces = await queryAvailablePlacesByCentre(
    centreId,
    beginDate,
    endDate
  ).countDocuments()
  return nbPlaces
}

export const findPlacesByCentreAndDate = async (_id, date, populate) => {
  appLogger.debug({
    func: 'findPlacesByCentreAndDate',
    args: { _id, date, populate },
  })
  const query = Place.find({
    centre: _id,
    date,
  })
    .where('candidat')
    .equals(undefined)
  queryPopulate(populate, query)
  const places = await query.exec()

  return places
}

export const findPlaceBookedByCandidat = async (
  candidat,
  options = {},
  populate
) => {
  const query = Place.findOne({ candidat }, options)
  queryPopulate(populate, query)

  const place = await query.exec()
  return place
}

export const findAndbookPlace = async (
  candidat,
  centres,
  date,
  bookedAt,
  fields,
  populate
) => {
  // let centre = { $in: centres }
  // if (typeof centres === 'string') {
  //   centre = centres
  // }
  const query = Place.findOneAndUpdate(
    { centre: { $in: centres }, date, candidat: { $eq: undefined } },
    { $set: { candidat, bookedAt } },
    { new: true, fields }
  )
  if (populate && populate.centre) {
    query.populate('centre')
  }
  if (populate && populate.candidat) {
    query.populate('candidat')
  }

  const place = await query.exec()
  return place
}

export const removeBookedPlace = place => {
  place.candidat = undefined

  return place.save()
}

const queryPopulate = (populate = {}, query) => {
  Object.entries(populate).forEach(([key, value]) => {
    value && query.populate(key)
  })
}

export const bookPlaceById = async (
  placeId,
  candidat,
  bookedInfo = {},
  fields,
  populate
) => {
  const query = Place.findOneAndUpdate(
    { _id: placeId, candidat: { $eq: undefined } },
    { $set: { candidat, ...bookedInfo } },
    { new: true, fields }
  )
  queryPopulate(populate, query)
  const place = await query.exec()
  return place
}

export const findPlaceWithSameWindow = async creneau => {
  const { date, centre, inspecteur } = creneau
  const place = await Place.findOne({ date, centre, inspecteur })
  return place
}

export const countPlacesBookedOrNot = async (centres, beginDate, isBooked) => {
  return Place.countDocuments({
    centre: { $in: centres },
    date: { $gte: beginDate },
    candidat: { $exists: isBooked },
  })
}

/**
 * Trouver les places réservées et affectées à un inspecteur sur une période entre beginDate et endDate
 * - si beginDate n'est pas défini, la période sera depuis le début de l'application jusqu’à endDate
 * - si endDate n'est pas défini, la période sera depuis beginDate jusqu’à la dernière date enregistrée dans l'application
 * @function
 *
 * @param {string} inspecteurId - Id de l'inspecteur
 * @param {string} beginDate - Date au format ISO de début de recherche
 * @param {string} endDate - Date au format ISO de fin de recherche
 *
 * @returns {Promise.<Place~PlaceModel[]>}
 */
export const findPlaceBookedByInspecteur = (
  inspecteurId,
  beginDate,
  endDate
) => {
  const query = Place.where('candidat').exists(true)
  if (beginDate || endDate) {
    query.where('date')
    if (beginDate) query.gte(beginDate)
    if (endDate) query.lt(endDate)
  }
  query.where('inspecteur', inspecteurId)
  queryPopulate(
    {
      inspecteur: true,
      centre: true,
    },
    query
  )
  return query.exec()
}

/**
 * Trouver les places réservées pour un centre et des inspecteurs sur un période entre beginDate et endDate
 * - si beginDate n'est pas défini, la période sera depuis le début de l'application jusqu’à endDate
 * - si endDate n'est pas défini, la période sera depuis beginDate jusqu’à la dernière date enregistrée dans l'application
 * - si la liste des inspecteurs n'est pas définie ou est vide, la recherche se fera pour tous les inspecteurs du centre
 * @function
 *
 * @param {string} centreId - Id du centre
 * @param {string} inspecteurIdListe - Liste d'id d'inspecteurs
 * @param {string} beginDate - Date au format ISO de début de recherche
 * @param {string} endDate - Date au format ISO de fin de recherche
 *
 * @returns {Promise.<Place~PlaceModel[]>}
 */
export const findAllPlacesBookedByCentreAndInspecteurs = (
  centreId,
  inspecteurIdListe,
  beginDate,
  endDate
) => {
  const query = Place.where('centre').exists(true)
  if (beginDate || endDate) {
    query.where('date')

    if (beginDate) query.gte(beginDate)
    if (endDate) query.lt(endDate)
  }
  query.where('centre', centreId)
  query.where('candidat').exists(true)
  if (inspecteurIdListe) {
    query.where('inspecteur').in(inspecteurIdListe)
  }
  return query.exec()
}
