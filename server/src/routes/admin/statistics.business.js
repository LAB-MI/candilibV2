import archivedCandidatModel from '../../models/archived-candidat/archived-candidat.model'
import candidatModel from '../../models/candidat/candidat.model'
import {
  countCandidatsInscritsByDepartement,
  countCandidatsInscritsByDepartementAndWeek,
  findCandidatsSignIn,
} from '../../models/candidat/candidat.queries'
import { countPlacesBookedOrNot } from '../../models/place/place.queries'

import {
  ABSENT,
  ECHEC,
} from '../../models/candidat/objetDernierNonReussite.values'
import {
  findCentresByDepartement,
  getDepartementsFromCentres,
} from '../../models/centre'
import { EPREUVE_PRATIQUE_OK, getFrenchLuxon, DATETIME_FULL, getFrenchLuxonFromISO, getFrenchLuxonFromJSDate } from '../../util'
import { REASON_EXAM_FAILED } from '../common/reason.constants'
import { findCountStatus } from '../../models/count-status/countStatus-queries'
import { candidatStatuses } from '../common/candidat-status-const'
import { getTokenDateCreated } from '../../util/token'

export const getResultsExamAllDpt = async (
  departements,
  beginPeriode,
  endPeriode,
) => {
  let dpts = departements

  if (!(departements && departements.length)) {
    dpts = await getDepartementsFromCentres()
  }

  if (!(dpts && dpts.length)) {
    throw new Error('Aucun département trouvé')
  }
  const results = await Promise.all(
    dpts.map(departement =>
      getResultsExamByDpt(departement, beginPeriode, endPeriode),
    ),
  )
  return results
}

export const getAllPlacesProposeInFutureByDpt = async beginDate => {
  const departements = await getDepartementsFromCentres()

  if (!departements) {
    throw new Error('Aucun département trouvé')
  }
  const results = await Promise.all(
    departements.map(departement =>
      getPlacesAndCandidatsInscritsByDpt(departement, beginDate),
    ),
  )
  return results
}

export const getPlacesAndCandidatsInscritsByDpt = async (
  departement,
  beginDate,
) => {
  const centresFromDB = await findCentresByDepartement(departement, { _id: 1 })
  const centres = centresFromDB.map(({ _id }) => _id)

  return {
    beginDate,
    departement,
    totalBookedPlaces: await countPlacesBookedOrNot(centres, beginDate, true),
    totalAvailablePlaces: await countPlacesBookedOrNot(
      centres,
      beginDate,
      false,
    ),
    totalCandidatsInscrits: await countCandidatsInscritsByDepartement(
      departement,
    ),
  }
}

export const getResultsExamByDpt = async (
  departement,
  beginPeriode,
  endPeriode,
) => {
  const date = getFrenchLuxon().toLocaleString(DATETIME_FULL)
  const centresFromDB = await findCentresByDepartement(departement, { _id: 1 })
  const centres = centresFromDB.map(({ _id }) => _id)
  const [
    registered,
    checked,
    waiting,
    received,
    absent,
    failed,
    notExamined,
  ] = await Promise.all([
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
  endPeriode,
) => {
  const expression = {}
  if (centres && centres.length) {
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
  endPeriode,
) => {
  const count = await countByReasonAndCentres(
    ABSENT,
    centres,
    beginPeriode,
    endPeriode,
  )
  return count
}

export const countFailureByCentres = async (
  centres,
  beginPeriode,
  endPeriode,
) => {
  const count = await countByReasonAndCentres(
    ECHEC,
    centres,
    beginPeriode,
    endPeriode,
  )
  return count
}

export const countNotExaminedByCentres = async (
  centres,
  beginPeriode,
  endPeriode,
) => {
  const noExamined = { $nin: [ECHEC, ABSENT] }
  const count = await countByReasonAndCentres(
    noExamined,
    centres,
    beginPeriode,
    endPeriode,
  )

  return count
}

const countByReasonAndCentres = async (
  reason,
  centres,
  beginPeriode,
  endPeriode,
) => {
  const countForCandidats = await countNoReussitesAndPlacesByReasonAndCentres(
    candidatModel.aggregate(),
    reason,
    centres,
    beginPeriode,
    endPeriode,
  )

  const countForArchivedCandidats = await countNoReussitesAndPlacesByReasonAndCentres(
    archivedCandidatModel.aggregate(),
    reason,
    centres,
    beginPeriode,
    endPeriode,
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
  endPeriode,
) => {
  const expression = {}
  if (centres && centres.length) {
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

export const getCountCandidatsLeaveRetentionArea = async (
  departements,
  beginPeriode,
  endPeriode,
) => {
  const expression = {}
  if (beginPeriode) {
    expression.$gte = beginPeriode
  } else {
    expression.$gte = getFrenchLuxon()
      .startOf('day')
      .toJSDate()
  }

  if (endPeriode) {
    expression.$lt = endPeriode
  }

  const result = await candidatModel.aggregate([
    {
      $match: {
        departement: { $in: departements },
        canAccessAt: {
          ...expression,
        },
      },
    },
    {
      $group: {
        _id: '$departement',
        count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        beginPeriode,
        endPeriode,
        count: 1,
      },
    },
  ])
  return result
}

const setDateOfWeek = (weekNumber, flag) => {
  if (weekNumber && !flag) {
    const toReturn = getFrenchLuxon()
      .startOf('week')
      .plus({ weeks: weekNumber })
      .startOf('day')
    return toReturn
  } else {
    const toReturn = getFrenchLuxon()
      .startOf('week')
      .plus({ weeks: weekNumber })
      .startOf('day')
    return toReturn
  }
}

const countCandidatsInscritsByDeptAndWeek = async (
  departement,
  shapedArray,
) => {
  const weeks = shapedArray.map(async (useless, index) => {
    const startWeekDate = setDateOfWeek(index, false)
    const endWeekDate = setDateOfWeek(index + 1, index === 0)
    return {
      weekNumber: index,
      weekDate: startWeekDate.startOf('week').toLocaleString(),
      value: await countCandidatsInscritsByDepartementAndWeek(
        departement,
        startWeekDate,
        endWeekDate,
      ),
    }
  })
  return Promise.all(weeks)
}

export const getCountCandidatsLeaveRetentionAreaByWeek = async departements => {
  const numberOfWeekToDisplay = 5
  const shapedArray = Array(numberOfWeekToDisplay).fill(true)

  if (departements && departements.length && departements.length === 1) {
    const result = [
      {
        departement: departements[0],
        candidatsLeaveRetentionByWeek: await countCandidatsInscritsByDeptAndWeek(
          departements[0],
          shapedArray,
        ),
      },
    ]
    return Promise.all(result)
  }
  const result = departements.map(async departement => {
    return {
      departement,
      candidatsLeaveRetentionByWeek: await countCandidatsInscritsByDeptAndWeek(
        departement,
        shapedArray,
      ),
    }
  })
  return Promise.all(result)
}

const initResultStatus = () => {
  const initResultStatus = {}
  for (let i = 0; i < candidatStatuses.nbStatus; i++) {
    initResultStatus[`${i}`] = 0
  }
  initResultStatus.date = ''
  return initResultStatus
}

const getByDepartements = (foundCountStatuses) => {
  const result = foundCountStatuses.reduce((acc, curr) => {
    const { createdAt, departement, candidatStatus, count } = curr
    const dateCreated = getFrenchLuxonFromJSDate(createdAt)
    const dateCurr = getFrenchLuxonFromJSDate(createdAt).toISODate()
    if (!acc[dateCurr]) {
      acc[dateCurr] = {}
    }
    if (!acc[dateCurr][departement]) {
      acc[dateCurr][departement] = initResultStatus()
    }
    acc[dateCurr][departement][candidatStatus] = count
    acc[dateCurr][departement].date = dateCreated.toISO()
    return acc
  }, {})

  return result
}

export const countByStatuses = async (begin, end) => {
  let beginDate
  let endDate
  if (!begin || !end) {
    beginDate = getFrenchLuxon().minus({ days: 1 }).startOf('day')
    endDate = getFrenchLuxon().endOf('day')
  } else {
    beginDate = getFrenchLuxonFromISO(begin).startOf('day')
    endDate = getFrenchLuxonFromISO(end).endOf('day')
  }

  const foundCountStatuses = await findCountStatus(beginDate, endDate)
  return getByDepartements(foundCountStatuses)
}

const getDaysAfterConnection = ({ token, tokenAddedAt, lastConnection, createdAt, canAccesAt }) => {
  if (lastConnection) {
    return -(getFrenchLuxonFromJSDate(lastConnection).diffNow('days').days | 0)
  }
  if (tokenAddedAt) {
    return -(getFrenchLuxonFromJSDate(tokenAddedAt).diffNow('days').days | 0)
  }
  if (token) {
    const dateFromToken = getTokenDateCreated(token)
    return -(getFrenchLuxonFromJSDate(dateFromToken).diffNow('days').days | 0)
  }
  //  if(canAccesAt) {
  //   return getFrenchLuxonFromJSDate(canAccesAt).diffNow('days')
  //  }
  //  if(createdAt) {
  //   return getFrenchLuxonFromJSDate(createdAt).diffNow('days')
  //  }
  return -1
}

export const countLastConnection = async (page) => {
  const candidats = await findCandidatsSignIn(undefined, { token: 1, tokenAddedAt: 1, lastConnection: 1, canAccesAt: 1, createdAt: 1 }, page)

  const nbByTranche = candidats.reduce((acc, candidat) => {
    const nbDays = getDaysAfterConnection(candidat)
    if (nbDays < 0) {
      acc[4] += 1
      return acc
    }
    const idx = 0 + (nbDays > 60) + (nbDays > 90) + (nbDays > 120)
    acc[idx] += 1
    return acc
  }, [0, 0, 0, 0, 0])

  return {
    total: candidats.length,
    nbByTranche,
  }
}
