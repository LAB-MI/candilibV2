import mongoose from 'mongoose'
import { connect, disconnect } from '../../mongo-connection'
import { getFrenchLuxon } from '../../util'
import archivedCandidatStatusModel from './archived-candidat-status-model'
import { createManyArchivedCandidatStatus, updateArchivedCandidatStatus, setIsArchivedCandidatStatus } from './archived-candidat-status-queries'

const { Types } = mongoose
const { ObjectId } = Types

describe('archived candidat status', () => {
  let candidatsIds
  let candidatsIds2
  beforeAll(async () => {
    await connect()
    candidatsIds = [ObjectId(), ObjectId(), ObjectId(), ObjectId()]
    candidatsIds2 = candidatsIds.slice(2)
  })

  afterAll(async () => {
    await disconnect()
  })

  afterEach(async () => {
    await archivedCandidatStatusModel.deleteMany()
  })
  it('Should create archived candidat status', async () => {
    const result = await createManyArchivedCandidatStatus('2', candidatsIds)
    expect(result).toBeDefined()
    expect(result).toHaveProperty('n', 4)
  })

  it('Should update lastSavedAt archived candidat status', async () => {
    const now = getFrenchLuxon().toJSDate()
    await createManyArchivedCandidatStatus('2', candidatsIds)
    await createManyArchivedCandidatStatus('3', candidatsIds2)

    const result = await updateArchivedCandidatStatus('3', candidatsIds, now)

    expect(result).toBeDefined()
    expect(result).toHaveProperty('n', 2)

    const status3 = await archivedCandidatStatusModel.findOne({ status: '3', candidatId: candidatsIds2[0] })
    expect(status3).toBeDefined()
    expect(status3).toHaveProperty('lastSavedAt', now)

    const status2 = await archivedCandidatStatusModel.findOne({ status: '2', candidatId: candidatsIds[0] })
    expect(status2).toBeDefined()
    expect(status2.lastSavedAt).toBeUndefined()
  })

  it('Should update flag isArchived', async () => {
    const now = getFrenchLuxon().toJSDate()
    await createManyArchivedCandidatStatus('2', candidatsIds)
    await createManyArchivedCandidatStatus('3', candidatsIds2)

    await updateArchivedCandidatStatus('3', candidatsIds, now)

    const result = await setIsArchivedCandidatStatus('3', candidatsIds2, now)
    expect(result).toBeDefined()
    expect(result).toHaveProperty('n', 2)

    const status3 = await archivedCandidatStatusModel.findOne({ status: '3', candidatId: candidatsIds2[0] })
    expect(status3).toBeDefined()
    expect(status3).toHaveProperty('isArchived', false)

    const status2 = await archivedCandidatStatusModel.findOne({ status: '2', candidatId: candidatsIds[0] })
    expect(status2).toBeDefined()
    expect(status3).toHaveProperty('isArchived', false)

    const status4 = await archivedCandidatStatusModel.findOne({ status: '2', candidatId: candidatsIds2[0] })
    expect(status4).toBeDefined()
    expect(status4).toHaveProperty('lastSavedAt', now)
    expect(status4).toHaveProperty('isArchived', true)
  })
})
