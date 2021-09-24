
import { connect, disconnect } from '../../mongo-connection'
import { createCandidat } from '../../models/candidat'
import candidatModel from '../../models/candidat/candidat.model'
import { modifyCandidatEmail } from './candidats-business'
import { SUBJECT_UPDATE_CANDDIAT_MAIL } from '../business'

jest.mock('../business/send-mail')
jest.mock('../../util/logger')
require('../../util/logger').setWithConsole(false)

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

  beforeEach(() => {
    require('../business/send-mail').deleteMails()
  })

  afterAll(async () => {
    await candidatModel.deleteOne({ _id: candidatCreated._id })
    await disconnect()
  })

  it('should 400 when the same e-mail ', async () => {
    try {
      const { candidat, messages } = await modifyCandidatEmail(candidatCreated, candidatToCreate.email)
      expect(candidat).toBeNull()
      expect(messages).toHaveLength(0)
    } catch (error) {
      expect(error).toHaveProperty('status', 400)
      expect(error).toHaveProperty('message', "Pas de modification pour le candidat 123456789000/NOM A TESTER. La nouvelle adresse courriel est identique à l'ancienne.")
    }
  })

  it('should update candidat email', async () => {
    const newEmail = 'test.newamil@test.com'
    const { candidat, messages } = await modifyCandidatEmail(candidatCreated, newEmail)
    expect(candidat).toBeDefined()
    expect(candidat).toHaveProperty('email', newEmail)
    expect(messages).toHaveLength(0)
    const mails = require('../business/send-mail').getMails()
    mails.forEach(mail => {
      expect([candidatToCreate.email, newEmail].includes(mail.to)).toBe(true)
      expect(mail).toHaveProperty('subject', SUBJECT_UPDATE_CANDDIAT_MAIL)
    })
  })
})
