import { connect, disconnect } from '../../mongo-connection'
import {
  countAbsentByCentres,
  countFailureByCentres,
  countNotExaminedByCentres,
  countSuccessByCentres,
  getResultsExamByDpt,
  getResultsExamAllDpt,
} from './statistics.business'
import {
  countAbsent,
  countFailure,
  countSuccess,
  createCandidatsForStat,
  countNotExamined,
} from './__tests__/candidats-stat'
import { findCentresByDepartement } from '../../models/centre'

describe('test statistics', () => {
  beforeAll(async () => {
    await connect()
    await createCandidatsForStat()
  })
  afterAll(async () => {
    await disconnect()
  })
  it('should to have nb success', async () => {
    const centres = await findCentresByDepartement('92', { _id: 1 })
    const results = await countSuccessByCentres(centres.map(({ _id }) => _id))
    expect(results).toBeDefined()
    expect(results).toBe(countSuccess('92'))
  })

  it('should to have nb absent', async () => {
    const centres = await findCentresByDepartement('92', { _id: 1 })
    const results = await countAbsentByCentres(centres.map(({ _id }) => _id))
    expect(results).toBeDefined()
    expect(results).toBe(countAbsent('92'))
  })
  it('should to have nb failure', async () => {
    const centres = await findCentresByDepartement('91', { _id: 1 })
    const results = await countFailureByCentres(centres.map(({ _id }) => _id))
    expect(results).toBeDefined()
    expect(results).toBe(countFailure('91'))
  })
  it('should to have nb not examined', async () => {
    const centres = await findCentresByDepartement('92', { _id: 1 })
    const results = await countNotExaminedByCentres(
      centres.map(({ _id }) => _id)
    )
    expect(results).toBeDefined()
    expect(results).toBe(countNotExamined('92'))
  })
  it('should to have nb not examined, absent, recieved, failed', async () => {
    const result = await getResultsExamByDpt('92')
    expect(result).toBeDefined()
    expect(result).toHaveProperty('notExamined', countNotExamined('92'))
    expect(result).toHaveProperty('absent', countAbsent('92'))
    expect(result).toHaveProperty('recieved', countSuccess('92'))
    expect(result).toHaveProperty('failed', countFailure('92'))
  })
  it('Should to have, for all departement, nb not examined, absent, recieved, failed', async () => {
    const results = await getResultsExamAllDpt()
    expect(results).toBeDefined()
    expect(results).toHaveLength(2)
    results.forEach(result => {
      expect(result).toHaveProperty('date')
      expect(result).toHaveProperty('departement')
      expect(result).toHaveProperty(
        'notExamined',
        countNotExamined(result.departement)
      )
      expect(result).toHaveProperty('absent', countAbsent(result.departement))
      expect(result).toHaveProperty(
        'recieved',
        countSuccess(result.departement)
      )
      expect(result).toHaveProperty('failed', countFailure(result.departement))
    })
  })
})
