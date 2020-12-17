import { connect, disconnect } from '../../mongo-connection'

import {
  countAbsentByCentres,
  countFailureByCentres,
  countNotExaminedByCentres,
  countSuccessByCentres,
  getAllPlacesProposeInFutureByDpt,
  getCountCandidatsLeaveRetentionArea,
  getResultsExamAllDpt,
  getResultsExamByDpt,
  getCountCandidatsLeaveRetentionAreaByWeek,
  countByStatuses,
} from './statistics.business'

import {
  countAbsent,
  countFailure,
  countNotExamined,
  countSuccess,
  createCandidatLeaveRetentionArea,
  createCandidatsForCountRetentionByWeek,
  createCandidatsForStat,
  createStatsForPlacesExam,
  dateReussitePratique,
  dateTimeDernierEchecPratique,
  dateTimeDernierEchecPratiqueWithPenalty,
  deleteCandidatsForCountRetentionByWeek,
  nowLuxon,
} from './__tests__/candidats-stat'

import {
  deleteCandidats,
  removeCentres,
  removePlaces,
} from '../../models/__tests__'

import { findCentresByDepartement } from '../../models/centre'

import { getFrenchLuxon, getFrenchLuxonFromISO } from '../../util'
import { createManyCountStatus } from '../../models/count-status/countStatus-queries'
import countStatusModel from '../../models/count-status/countStatus-model'

jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

describe('test statistics', () => {
  beforeAll(async () => {
    await connect()
    await createCandidatsForStat()
    await createCandidatLeaveRetentionArea()
    await createStatsForPlacesExam()
  })
  afterAll(async () => {
    await removePlaces()
    await removeCentres()
    await deleteCandidats()
    await disconnect()
  })
  it('Should have nb success', async () => {
    const centres = await findCentresByDepartement('92', { _id: 1 })
    const results = await countSuccessByCentres(
      centres.map(({ _id }) => _id),
      dateReussitePratique.toJSDate(),
      dateReussitePratique.toJSDate(),
    )

    expect(results).toBeDefined()
    expect(results).toBe(
      countSuccess('92', dateReussitePratique, dateReussitePratique),
    )
  })

  it('Should have nb absent', async () => {
    const centres = await findCentresByDepartement('92', { _id: 1 })
    const begin = dateTimeDernierEchecPratiqueWithPenalty(45 * 3).toJSDate()
    const end = dateTimeDernierEchecPratique.toJSDate()

    const results = await countAbsentByCentres(centres.map(({ _id }) => _id))
    expect(results).toBeDefined()
    expect(results).toBe(countAbsent('92', begin, end))
  })

  it('Should have nb failure', async () => {
    const centres = await findCentresByDepartement('91', { _id: 1 })
    const results = await countFailureByCentres(
      centres.map(({ _id }) => _id),
      dateReussitePratique,
      dateReussitePratique,
    )
    expect(results).toBeDefined()
    expect(results).toBe(countFailure('91'))
  })

  it('Should have nb not examined', async () => {
    const centres = await findCentresByDepartement('92', { _id: 1 })
    const begin = dateTimeDernierEchecPratiqueWithPenalty(45 * 3).toJSDate()
    const end = dateTimeDernierEchecPratique
    const results = await countNotExaminedByCentres(
      centres.map(({ _id }) => _id),
      begin,
      end.toJSDate(),
    )
    expect(results).toBeDefined()
    expect(results).toBe(countNotExamined('92', begin, end))
  })

  it('Should have nb not examined, absent, received, failed', async () => {
    const begin = dateTimeDernierEchecPratiqueWithPenalty(45 * 3)
    const end = dateReussitePratique

    const result = await getResultsExamByDpt(
      '92',
      begin.toJSDate(),
      end.toJSDate(),
    )
    expect(result).toBeDefined()
    expect(result).toHaveProperty(
      'notExamined',
      countNotExamined('92', begin, end),
    )
    expect(result).toHaveProperty('absent', countAbsent('92', begin, end))
    expect(result).toHaveProperty('failed', countFailure('92', begin, end))
    expect(result).toHaveProperty('received', countSuccess('92', begin, end))
  })

  it('Should have, for all departement, nb not examined, absent, received, failed', async () => {
    const begin = dateTimeDernierEchecPratiqueWithPenalty(45 * 3)
    const end = dateReussitePratique

    const results = await getResultsExamAllDpt(['91', '92'], begin, end)

    expect(results).toBeDefined()
    expect(results).toHaveLength(2)
    results.forEach(result => {
      expect(result).toHaveProperty('date')
      expect(result).toHaveProperty('departement')
      expect(result).toHaveProperty(
        'notExamined',
        countNotExamined(result.departement, begin, end),
      )
      expect(result).toHaveProperty(
        'absent',
        countAbsent(result.departement, begin, end),
      )

      expect(result).toHaveProperty(
        'received',
        countSuccess(result.departement, begin, end),
      )

      expect(result).toHaveProperty(
        'failed',
        countFailure(result.departement, begin, end),
      )
    })
  })

  it('Should have stats in future with total subscript', async () => {
    const dateBeginPeriode = nowLuxon.startOf('day').toJSDate()
    const result = await getAllPlacesProposeInFutureByDpt(dateBeginPeriode)
    const expectedResult = [
      {
        beginDate: dateBeginPeriode,
        departement: '92',
        totalBookedPlaces: 1,
        totalAvailablePlaces: 1,
        totalCandidatsInscrits: 1,
      },
      {
        beginDate: dateBeginPeriode,
        departement: '91',
        totalBookedPlaces: 0,
        totalAvailablePlaces: 0,
        totalCandidatsInscrits: 0,
      },
    ]

    expect(result).toEqual(expect.arrayContaining(expectedResult))
  })

  it('Should have two candidat stats by departement leave retention area', async () => {
    const dpts = ['93', '92']
    const dateBeginPeriode = nowLuxon.startOf('day').toJSDate()
    const dateEndPeriode = nowLuxon
      .plus({ days: 20 })
      .startOf('day')
      .toJSDate()
    const result = await getCountCandidatsLeaveRetentionArea(
      dpts,
      dateBeginPeriode,
      dateEndPeriode,
    )
    expect(typeof result).toEqual(typeof [])
    expect(result.length).toEqual(2)
    expect(result).toEqual(
      expect.arrayContaining([
        {
          _id: dpts[0],
          count: 2,
          beginPeriode: dateBeginPeriode,
          endPeriode: dateEndPeriode,
        },
        {
          _id: dpts[1],
          count: 2,
          beginPeriode: dateBeginPeriode,
          endPeriode: dateEndPeriode,
        },
      ]),
    )
  })

  it('Should have one candidat in stats of all départements leave retention area', async () => {
    const dpts = ['94', '93', '92']
    const dateBeginPeriode = nowLuxon
      .plus({ days: 20 })
      .startOf('day')
      .toJSDate()
    const dateEndPeriode = nowLuxon
      .plus({ days: 45 })
      .startOf('day')
      .toJSDate()
    const result = await getCountCandidatsLeaveRetentionArea(
      dpts,
      dateBeginPeriode,
      dateEndPeriode,
    )

    expect(typeof result).toEqual(typeof [])
    expect(result.length).toEqual(1)
    expect(result).toEqual(
      expect.arrayContaining([
        {
          _id: dpts[0],
          count: 1,
          beginPeriode: dateBeginPeriode,
          endPeriode: dateEndPeriode,
        },
      ]),
    )
  })

  it('Should get all candidats in stats of all départements leave retention area', async () => {
    const departements = ['79', '78', '76']

    const candidatCreated = await Promise.all(
      departements.map(async dept => {
        const createdCandidats = await createCandidatsForCountRetentionByWeek(
          5,
          dept,
        )
        return {
          dept,
          createdCandidats,
        }
      }),
    )

    const dateNow = () => getFrenchLuxon()

    const candidatsLeaveRetentionByWeek = [
      {
        value: { count: 1 },
        weekDate: dateNow()
          .plus({ weeks: 0 })
          .startOf('week')
          .toLocaleString(),
        weekNumber: 0,
      },
      {
        value: { count: 1 },
        weekDate: dateNow()
          .plus({ weeks: 1 })
          .startOf('week')
          .toLocaleString(),
        weekNumber: 1,
      },
      {
        value: { count: 1 },
        weekDate: dateNow()
          .plus({ weeks: 2 })
          .startOf('week')
          .toLocaleString(),
        weekNumber: 2,
      },
      {
        value: { count: 1 },
        weekDate: dateNow()
          .plus({ weeks: 3 })
          .startOf('week')
          .toLocaleString(),
        weekNumber: 3,
      },
      {
        value: { count: 1 },
        weekDate: dateNow()
          .plus({ weeks: 4 })
          .startOf('week')
          .toLocaleString(),
        weekNumber: 4,
      },
    ]
    const exptedObject = [
      {
        candidatsLeaveRetentionByWeek,
        departement: '79',
      },
      {
        candidatsLeaveRetentionByWeek,
        departement: '78',
      },
      {
        candidatsLeaveRetentionByWeek,
        departement: '76',
      },
    ]

    const result = await getCountCandidatsLeaveRetentionAreaByWeek(departements)

    expect(typeof result).toEqual(typeof [])
    expect(result.length).toEqual(3)
    expect(result).toEqual(expect.arrayContaining(exptedObject))

    await Promise.all(
      candidatCreated.map(el => {
        return deleteCandidatsForCountRetentionByWeek(el.createdCandidats)
      }),
    )
  })

  it('Should get all candidats in stats of one départements leave retention area', async () => {
    const departements = ['76']

    const candidatCreated = await Promise.all(
      departements.map(async dept => {
        const createdCandidats = await createCandidatsForCountRetentionByWeek(
          5,
          dept,
        )
        return {
          dept,
          createdCandidats,
        }
      }),
    )

    const dateNow = () => getFrenchLuxon()

    const candidatsLeaveRetentionByWeek = [
      {
        value: { count: 1 },
        weekDate: dateNow()
          .plus({ weeks: 0 })
          .startOf('week')
          .toLocaleString(),
        weekNumber: 0,
      },
      {
        value: { count: 1 },
        weekDate: dateNow()
          .plus({ weeks: 1 })
          .startOf('week')
          .toLocaleString(),
        weekNumber: 1,
      },
      {
        value: { count: 1 },
        weekDate: dateNow()
          .plus({ weeks: 2 })
          .startOf('week')
          .toLocaleString(),
        weekNumber: 2,
      },
      {
        value: { count: 1 },
        weekDate: dateNow()
          .plus({ weeks: 3 })
          .startOf('week')
          .toLocaleString(),
        weekNumber: 3,
      },
      {
        value: { count: 1 },
        weekDate: dateNow()
          .plus({ weeks: 4 })
          .startOf('week')
          .toLocaleString(),
        weekNumber: 4,
      },
    ]
    const exptedObject = [
      {
        candidatsLeaveRetentionByWeek,
        departement: '76',
      },
    ]

    const result = await getCountCandidatsLeaveRetentionAreaByWeek(departements)

    expect(typeof result).toEqual(typeof [])
    expect(result.length).toEqual(1)
    expect(result).toEqual(expect.arrayContaining(exptedObject))

    await Promise.all(
      candidatCreated.map(el => {
        return deleteCandidatsForCountRetentionByWeek(el.createdCandidats)
      }),
    )
  })

  it('Should count by status', async () => {
    const yesterday = getFrenchLuxon().minus({ days: 1 })
    const statuses = [{
      departement: '93',
      candidatStatus: '1',
      count: 1,
      createdAt: yesterday,
    },
    {
      departement: '92',
      candidatStatus: '1',
      count: 1,
      createdAt: yesterday,
    },
    {
      departement: '95',
      candidatStatus: '2',
      count: 2,
      createdAt: yesterday,
    },
    {
      departement: '91',
      candidatStatus: '3',
      count: 3,
      createdAt: yesterday,
    },
    {
      departement: '95',
      candidatStatus: '3',
      count: 3,
      createdAt: yesterday,
    }]

    await createManyCountStatus(statuses)

    const expecteds = {
      0: 0,
      1: 2,
      2: 2,
      3: 6,
      4: 0,
      5: 0,
    }

    const results = await countByStatuses()
    const result = results[yesterday.toISODate()]
    Object.entries(expecteds).forEach(([status, count]) => {
      expect(result).toHaveProperty(status, count)
    })

    await countStatusModel.deleteMany({})
  })

  it('Should count by status and by departements', async () => {
    const twoDaysAgo = getFrenchLuxon().minus({ days: 2 })
    const yesterday = getFrenchLuxon().minus({ days: 1 })
    const statusesYesterday = [{
      departement: '93',
      candidatStatus: '1',
      count: 1,
      createdAt: yesterday,
    },
    {
      departement: '92',
      candidatStatus: '1',
      count: 1,
      createdAt: yesterday,
    },
    {
      departement: '95',
      candidatStatus: '2',
      count: 2,
      createdAt: yesterday,
    },
    {
      departement: '91',
      candidatStatus: '3',
      count: 3,
      createdAt: yesterday,
    },
    {
      departement: '95',
      candidatStatus: '3',
      count: 3,
      createdAt: yesterday,
    }]

    const statusesTwoDaysAgo = [{
      departement: '93',
      candidatStatus: '1',
      count: 1,
      createdAt: twoDaysAgo,
    },
    {
      departement: '92',
      candidatStatus: '1',
      count: 1,
      createdAt: twoDaysAgo,
    },
    {
      departement: '95',
      candidatStatus: '2',
      count: 2,
      createdAt: twoDaysAgo,
    },
    {
      departement: '91',
      candidatStatus: '3',
      count: 3,
      createdAt: twoDaysAgo,
    },
    {
      departement: '95',
      candidatStatus: '3',
      count: 3,
      createdAt: twoDaysAgo,
    }]

    const statuses = [...statusesYesterday, ...statusesTwoDaysAgo]
    await createManyCountStatus(statuses)

    const results = await countByStatuses(twoDaysAgo, getFrenchLuxon(), true)
    Object.entries(results).forEach(([date, byDep]) => {
      const dateLuxon = getFrenchLuxonFromISO(date).hasSame(yesterday, 'days') ? yesterday : twoDaysAgo
      Object.entries(byDep).forEach(([dep, byStatus]) => {
        Object.entries(byStatus).forEach(([status, count]) => {
          const resultStatus = statuses.find(({ departement, candidatStatus, createdAt }) => dateLuxon.equals(createdAt) && departement === dep && candidatStatus === status)
          expect(resultStatus || {
            count: 0,
            candidatStatus: status,
          }).toHaveProperty('count', count)
        })
      })
    })

    await countStatusModel.deleteMany({})
  })
})
