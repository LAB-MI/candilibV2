import archivedCandidatModel from '../../models/archived-candidat/archived-candidat.model'
import candidatModel from '../../models/candidat/candidat.model'
import whitelistedModel from '../../models/whitelisted/whitelisted.model'
import {
  ABSENT,
  ECHEC,
} from '../../models/candidat/objetDernierNonReussite.values'
import {
  findCentresByDepartement,
  getDepartementsFromCentres,
} from '../../models/centre'
import { EPREUVE_PRATIQUE_OK, getFrenchLuxon, DATETIME_FULL } from '../../util'
import { REASON_EXAM_FAILED } from '../common/reason.constants'

export const getResultsExamAllDpt = async () => {
  const departements = await getDepartementsFromCentres()
  if (!departements) {
    throw new Error('Aucun département trouvé')
  }
  const results = await Promise.all(departements.map(getResultsExamByDpt))
  return results
}

export const getResultsExamByDpt = async departement => {
  const date = getFrenchLuxon().toLocaleString(DATETIME_FULL)
  const centresFromDB = await findCentresByDepartement(departement, { _id: 1 })
  const centres = centresFromDB.map(({ _id }) => _id)
  const [
    invited,
    registered,
    checked,
    waiting,
    received,
    absent,
    failed,
    notExamined,
  ] = await Promise.all([
    countInvitedCandidatsByDepartement(departement),
    countCandidatsByDepartement(departement),
    countCheckedCandidatsByDepartement(departement),
    countWaitingCandidatsByDepartement(departement),
    countSuccessByCentres(centres),
    countAbsentByCentres(centres),
    countFailureByCentres(centres),
    countNotExaminedByCentres(centres),
  ])

  return {
    date,
    departement,
    invited,
    registered,
    checked,
    waiting,
    notExamined,
    absent,
    received,
    failed,
  }
}

export const countInvitedCandidatsByDepartement = departement => {
  return whitelistedModel.countDocuments({
    departement,
  })
}

export const countCandidatsByDepartement = departement => {
  return candidatModel.countDocuments({
    departement,
  })
}

export const countCheckedCandidatsByDepartement = departement => {
  return candidatModel.countDocuments({
    isValidatedByAurige: true,
    departement,
  })
}

export const countWaitingCandidatsByDepartement = departement => {
  return candidatModel.countDocuments({
    isValidatedByAurige: null,
    departement,
  })
}

export const countSuccessByCentres = centres => {
  const expression = {}
  if (centres) {
    expression['places.centre'] = { $in: centres }
  }

  return archivedCandidatModel.countDocuments({
    archiveReason: EPREUVE_PRATIQUE_OK,
    'places.archiveReason': EPREUVE_PRATIQUE_OK,
    ...expression,
  })
}

export const countAbsentByCentres = async centres => {
  const count = await countByReasonAndCentres(ABSENT, centres)
  return count
}

export const countFailureByCentres = async centres => {
  const count = await countByReasonAndCentres(ECHEC, centres)
  return count
}

export const countNotExaminedByCentres = async centres => {
  const noExamined = { $nin: [ECHEC, ABSENT] }
  const count = await countByReasonAndCentres(noExamined, centres)
  return count
}

const countByReasonAndCentres = async (reason, centres) => {
  const countForCandidats = await countNoReussitesAndPlacesByReasonAndCentres(
    candidatModel.aggregate(),
    reason,
    centres
  )
  const countForArchivedCandidats = await countNoReussitesAndPlacesByReasonAndCentres(
    archivedCandidatModel.aggregate(),
    reason,
    centres
  )
  let count = countForCandidats[0] ? countForCandidats[0].count : 0
  count += countForArchivedCandidats[0] ? countForArchivedCandidats[0].count : 0
  return count
}

const countNoReussitesAndPlacesByReasonAndCentres = (
  aggregateQuery,
  reason,
  centres
) => {
  const expression = {}
  if (centres) {
    expression['places.centre'] = { $in: centres }
  }
  return aggregateQuery
    .unwind('noReussites', 'places')
    .match({
      'noReussites.reason': reason,
      'places.archiveReason': REASON_EXAM_FAILED,
      ...expression,
      $expr: {
        $eq: [
          { $dateToString: { format: '%Y-%m-%d', date: '$noReussites.date' } },
          { $dateToString: { format: '%Y-%m-%d', date: '$places.date' } },
        ],
      },
    })
    .count('count')
    .exec()
}
