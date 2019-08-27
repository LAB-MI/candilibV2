import { connect, disconnect } from '../../mongo-connection'

import { validateEmail } from './candidat.business'
import { createCandidat } from '../../models/candidat'

jest.mock('../business/send-mail')

const uuidv4 = require('uuid/v4')

const validEmail = 'candidat-validate-email@example.com'
const portable = '0612345678'
const adresse = '10 Rue Hoche 93420 Villepinte'
const nomNaissance = 'Dupont'
const codeNeph = '123456789012'
const prenom = ' test prenom '

const validCandidat = {
  codeNeph,
  nomNaissance,
  prenom,
  portable,
  email: validEmail,
  adresse,
}

describe('Test the candidat business', () => {
  const hash = uuidv4()
  let createdCandidat
  beforeAll(async () => {
    await connect()
  })

  beforeEach(async () => {
    validCandidat.emailValidationHash = hash
    if (createdCandidat) {
      await createdCandidat.delete().catch(e => e)
    }
    createdCandidat = await createCandidat(validCandidat)
  })

  it('Should not validate email', async () => {
    const wrongHash = uuidv4()
    const validateResult = await validateEmail(validCandidat.email, wrongHash)
    expect(validateResult).toHaveProperty('success', false)
  })

  it('Should validate email', async () => {
    const validateResult = await validateEmail(validCandidat.email, hash)
    expect(validateResult).toHaveProperty('success', true)
  })

  afterAll(async () => {
    await disconnect()
  })
})
