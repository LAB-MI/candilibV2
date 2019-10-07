import { getFrenchLuxon, getFrenchLuxonFromJSDate } from '../../../util'

export const expectedArchivedPlace = (
  archivedPlace,
  place,
  reason,
  byUser,
  isCandilib
) => {
  expect(archivedPlace).toBeDefined()
  expect(archivedPlace).toHaveProperty('placeId', place._id)
  expect(archivedPlace).toHaveProperty('date', place.date)
  expect(archivedPlace).toHaveProperty('centre', place.centre)
  expect(archivedPlace).toHaveProperty('inspecteur', place.inspecteur)
  expect(archivedPlace).toHaveProperty('archiveReason', reason)
  expect(archivedPlace).toHaveProperty('byUser', byUser)
  expect(archivedPlace).toHaveProperty('isCandilib', isCandilib)
  const now = getFrenchLuxon()
  const archivedAt = getFrenchLuxonFromJSDate(archivedPlace.archivedAt)
  expect(now.hasSame(archivedAt, 'day')).toBeTruthy()
}
