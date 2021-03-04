import {
  getSessionByCandidatId,
  createSession,
} from './session-candidat-queries'
import { connect, disconnect } from '../../mongo-connection'
import { createCandidat } from '../candidat'

const validEmail = 'candidat@example.com'
const portable = '0612345678'
const adresse = '10 Rue Hoche 93420 Villepinte'
const nomNaissance = 'Dupont'
const prenom = 'Jean'
const codeNeph = '123456789012'

describe('SessionCandidat', () => {
  let candidat1
  beforeAll(async () => {
    await connect()

    candidat1 = await createCandidat({
      codeNeph,
      nomNaissance,
      prenom,
      email: validEmail,
      portable,
      adresse,
    })
  })

  afterAll(async () => {
    await disconnect()
  })

  it('should save an session candidat', async () => {
    // Given
    const sessionFake = {
      userId: candidat1._id,
      session: JSON.stringify({ key: 'value' }),
      expires: new Date(),
    }

    try {
      // When
      const savedSessionCandidat = await createSession(sessionFake)
      const sessionInfos = await getSessionByCandidatId(candidat1._id)
      console.log({ savedSessionCandidat, sessionInfos })
      expect(savedSessionCandidat).toHaveProperty('isNew', false)
    } catch (error) {
      console.log({ error })
    }

    // Then
  })
})
