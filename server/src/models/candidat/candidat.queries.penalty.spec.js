import { addCanBookFrom, createCandidat, deleteCandidatCanBookFrom, findCandidatById } from '.'
import { connect, disconnect } from '../../mongo-connection'
import { BY_AURIGE } from '../../routes/admin/business'
import { getFrenchLuxon } from '../../util'
import { createUser } from '../user'
import { candidatWithPenaltyAndHistory, candidatWithPenaltyAndNoHistory, users } from '../__tests__'
import '../../__tests__/jest.utils'
import { REASON_ABSENT_EXAM, REASON_EXAM_FAILED, REASON_UNKNOWN } from '../../routes/common/reason.constants'
describe('Candidat penalty queries', () => {
  let admin
  beforeAll(async () => {
    await connect()
    const { email, password, departements, status } = users[0]
    admin = await createUser(email, password, departements, status)
  })
  afterAll(async () => {
    await disconnect()
  })

  it('should remove penalty and create a history ', async () => {
    let candidatCreated
    try {
      candidatCreated = await createCandidat(candidatWithPenaltyAndNoHistory)
    } catch (error) {
      expect(error).toBeUndefined()
    }
    const { canBookFrom } = candidatCreated
    await deleteCandidatCanBookFrom(candidatCreated, admin)
    const candidatUpdated = await findCandidatById(candidatCreated._id)
    expect(candidatUpdated).toHaveProperty('canBookFrom', undefined)
    expect(candidatUpdated).toHaveProperty('canBookFroms')
    expect(candidatUpdated.canBookFroms[0]).toHaveProperty('canBookFrom', canBookFrom)
    expect(candidatUpdated.canBookFroms[0]).toHaveProperty('reason', REASON_UNKNOWN)
    expect(candidatUpdated.canBookFroms[0]).toHavePropertyAtNow('deletedAt')
    expect(candidatUpdated.canBookFroms[0].deleteBy).toBeDefined()
    expect(candidatUpdated.canBookFroms[0].deleteBy.email).toBe(admin.email)
  })

  it('should remove penalty and add a history ', async () => {
    let candidatCreated
    let canBookFrom
    try {
      candidatCreated = await createCandidat(candidatWithPenaltyAndHistory)
      canBookFrom = candidatCreated.canBookFrom
      addCanBookFrom(candidatCreated, getFrenchLuxon().minus({ days: 45 }), REASON_ABSENT_EXAM, BY_AURIGE)
      const candidatWithCanBookFroms = addCanBookFrom(candidatCreated, canBookFrom, REASON_EXAM_FAILED, BY_AURIGE)
      await candidatWithCanBookFroms.save()
    } catch (error) {
      expect(error).toBeUndefined()
    }
    await deleteCandidatCanBookFrom(candidatCreated, admin)
    const candidatUpdated = await findCandidatById(candidatCreated._id)
    expect(candidatUpdated).toHaveProperty('canBookFrom', undefined)
    expect(candidatUpdated).toHaveProperty('canBookFroms')
    const lastCanBookFrom = candidatUpdated.canBookFroms[candidatUpdated.canBookFroms.length - 1]
    expect(lastCanBookFrom).toHaveProperty('canBookFrom', canBookFrom)
    expect(lastCanBookFrom).toHaveProperty('reason', REASON_EXAM_FAILED)
    expect(lastCanBookFrom).toHavePropertyAtNow('deletedAt')
    expect(lastCanBookFrom.deleteBy).toBeDefined()
    expect(lastCanBookFrom.deleteBy.email).toBe(admin.email)
  })
})
