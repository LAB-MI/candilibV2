import ArchivedPlace from './archived-place.model'

export const createArchivedPlace = async placeData => {
  const archivedPlace = await ArchivedPlace.create(placeData)
  return archivedPlace
}

export const createArchivedPlaceFromPlace = async (
  placeData,
  archiveReason,
  byUser,
  isCandilib
) => {
  const { _id: placeId, date, centre, inspecteur } = placeData
  const archivedPlaceData = {
    placeId,
    date,
    centre,
    inspecteur,
    archiveReason,
    isCandilib,
    byUser,
  }
  const archivedPlace = await ArchivedPlace.create(archivedPlaceData)
  return archivedPlace
}

/**
 * @memberof module:models/archived-place
 * @function findArchivedPlaceByPlaceId
 * @description Retrouver une place supprimé par son id
 * @param {ObjectId} placeId id de la place supprimé
 */
export const findArchivedPlaceByPlaceId = async placeId => {
  const archivedPlace = await ArchivedPlace.findOne({ placeId })
  return archivedPlace
}
