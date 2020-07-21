
import { connect, disconnect } from '../../mongo-connection'
import { createCandidat } from '../../models/candidat'
import candidatModel from '../../models/candidat/candidat.model'
import { modifyCandidatEmail } from './candidats-business'

describe('Update Email of a candidat', () => {
  const candidatToCreate = {
    codeNeph: '123456789000',
    nomNaissance: 'Nom à tester',
    prenom: 'Prénom à tester n°1',
    email: 'test1.test@test.com',
    portable: '0612345678',
    departement: '93',
    homeDepartement: '75',
  }

  let candidatCreated
  beforeAll(async () => {
    await connect()
    candidatCreated = await createCandidat(candidatToCreate)
  })

  afterAll(async () => {
    await candidatModel.deleteOne({ _id: candidatCreated._id })
    await disconnect()
  })
  it('should 400 when the same e-mail ', async () => {
    try {
      const candidat = await modifyCandidatEmail(candidatCreated._id, candidatToCreate.email)
      expect(candidat).toBeNull()
    } catch (error) {
      expect(error).toHaveProperty('status', 400)
    }
  })
  it('should update candidat email', async () => {
    const newEmail = 'test.newamil@test.com'
    const candidat = await modifyCandidatEmail(candidatCreated._id, newEmail)
    expect(candidat).toBeDefined()
    expect(candidat).toHaveProperty('email', newEmail)
  })
})
