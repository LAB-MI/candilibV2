/**
 * Ensemble des actions sur les places dans la base de données
 * @module models/place-queries
 */
import mongoose from 'mongoose'

import Place from './place.model'
import '../inspecteur/inspecteur.model'
import { appLogger, techLogger } from '../../util'
import { createArchivedPlaceFromPlace } from '../archived-place/archived-place.queries'

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
 * @function deletePlace
 * @see {@link module:models/archived-place}
 * @param {PlaceModel} place La place à supprimer
 * @param {String} reason La raison de la suppresion
 * @param {String} byUser L'auteur de l'action
 * @param {Boolean} isCandilib Suppresion lié à une réussite ou echec d'un examen de candilib
 */
export const deletePlace = async (place, reason, byUser, isCandilib) => {
  if (!place) {
    throw new Error('No place given')
  }
  try {
    await createArchivedPlaceFromPlace(place, reason, byUser, isCandilib)
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
 *
 * @param {string} centreId - Id du centre
 * @param {string} beginDate - date de debut de recherche au format ISO
 * @param {string} endDate - date de fin de recherche au format ISO
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

/**
 * @function findAllPlacesByCentre
 * @param {string} centreId - Id du centre
 * @param {string} beginDate - date de debut de recherche au format ISO
 * @param {string} endDate - date de fin de recherche au format ISO
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
  centre,
  date,
  bookedAt,
  fields,
  populate
) => {
  const query = Place.findOneAndUpdate(
    { centre, date, candidat: { $eq: undefined } },
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

export const findAllPlacesBookedByCentre = (centreId, beginDate, endDate) => {
  const query = Place.where('centre').exists(true)
  if (beginDate || endDate) {
    query.where('date')

    if (beginDate) query.gte(beginDate)
    if (endDate) query.lt(endDate)
  }
  query.where('centre', centreId)
  query.where('candidat').exists(true)
  return query.exec()
}

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
