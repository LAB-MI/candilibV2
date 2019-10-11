import archivedCandidatModel from '../../models/archived-candidat/archived-candidat.model'
import candidatModel from '../../models/candidat/candidat.model'
import whitelistedModel from '../../models/whitelisted/whitelisted.model'
import { countCandidatsInscritsByDepartement } from '../../models/candidat/candidat.queries'
import { countPlacesBookedOrNot } from '../../models/place/place.queries'

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

export const getResultsExamAllDpt = async (beginPeriode, endPeriode) => {
  const departements = await getDepartementsFromCentres()
  if (!departements) {
    throw new Error('Aucun département trouvé')
  }
  const results = await Promise.all(
    departements.map(departement =>
      getResultsExamByDpt(departement, beginPeriode, endPeriode)
    )
  )
  return results
}

export const getAllPlacesProposeInFutureByDpt = async beginDate => {
  const departements = await getDepartementsFromCentres()

  if (!departements) {
    throw new Error('Aucun département trouvé')
  }
  const results = await Promise.all(
    departements.map(departement => getPlacesByDpt(departement, beginDate))
  )
  return results
}

export const getPlacesByDpt = async (departement, beginDate) => {
  const centresFromDB = await findCentresByDepartement(departement, { _id: 1 })
  const centres = centresFromDB.map(({ _id }) => _id)

  return {
    beginDate,
    departement,
    totalBookedPlaces: await countPlacesBookedOrNot(centres, beginDate, true),
    totalPlaces: await countPlacesBookedOrNot(centres, beginDate, false),
    totalCandidatsInscrits: await countCandidatsInscritsByDepartement(
      departement
    ),
  }
}

export const getResultsExamByDpt = async (
  departement,
  beginPeriode,
  endPeriode
) => {
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
    countSuccessByCentres(centres, beginPeriode, endPeriode),
    countAbsentByCentres(centres, beginPeriode, endPeriode),
    countFailureByCentres(centres, beginPeriode, endPeriode),
    countNotExaminedByCentres(centres, beginPeriode, endPeriode),
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
    beginPeriode,
    endPeriode,
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

export const countSuccessByCentres = async (
  centres,
  beginPeriode,
  endPeriode
) => {
  const expression = {}
  if (centres) {
    expression['places.centre'] = { $in: centres }
  }

  if (beginPeriode || endPeriode) {
    expression['places.date'] = {}
    if (beginPeriode) {
      expression['places.date'].$gte = beginPeriode
    }
    if (endPeriode) {
      expression['places.date'].$lte = endPeriode
    }
  }

  const commonQuery = {
    'places.archiveReason': EPREUVE_PRATIQUE_OK,
    'places.centre': { ...expression['places.centre'] },
  }

  const result = await archivedCandidatModel
    .aggregate([
      {
        $match: {
          archiveReason: EPREUVE_PRATIQUE_OK,
          ...commonQuery,
        },
      },
      {
        $unwind: '$places',
      },
      {
        $match: {
          ...commonQuery,
          'places.date': { ...expression['places.date'] },
        },
      },
    ])
    .count('count')

  return result[0] ? result[0].count : 0
}

export const countAbsentByCentres = async (
  centres,
  beginPeriode,
  endPeriode
) => {
  const count = await countByReasonAndCentres(
    ABSENT,
    centres,
    beginPeriode,
    endPeriode
  )
  return count
}

export const countFailureByCentres = async (
  centres,
  beginPeriode,
  endPeriode
) => {
  const count = await countByReasonAndCentres(
    ECHEC,
    centres,
    beginPeriode,
    endPeriode
  )
  return count
}

export const countNotExaminedByCentres = async (
  centres,
  beginPeriode,
  endPeriode
) => {
  const noExamined = { $nin: [ECHEC, ABSENT] }
  const count = await countByReasonAndCentres(
    noExamined,
    centres,
    beginPeriode,
    endPeriode
  )
  return count
}

const countByReasonAndCentres = async (
  reason,
  centres,
  beginPeriode,
  endPeriode
) => {
  const countForCandidats = await countNoReussitesAndPlacesByReasonAndCentres(
    candidatModel.aggregate(),
    reason,
    centres,
    beginPeriode,
    endPeriode
  )
  const countForArchivedCandidats = await countNoReussitesAndPlacesByReasonAndCentres(
    archivedCandidatModel.aggregate(),
    reason,
    centres,
    beginPeriode,
    endPeriode
  )
  let count = countForCandidats[0] ? countForCandidats[0].count : 0
  count += countForArchivedCandidats[0] ? countForArchivedCandidats[0].count : 0
  return count
}

const countNoReussitesAndPlacesByReasonAndCentres = (
  aggregateQuery,
  reason,
  centres,
  beginPeriode,
  endPeriode
) => {
  const expression = {}
  if (centres) {
    expression['places.centre'] = { $in: centres }
  }

  if (beginPeriode || endPeriode) {
    expression['noReussites.date'] = {}
    if (beginPeriode) {
      expression['noReussites.date'].$gte = beginPeriode
    }
    if (endPeriode) {
      expression['noReussites.date'].$lte = endPeriode
    }
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
