import { ValidationError } from 'joi'
import { candidatValidator } from './candidat-validator'

describe('validator candidat', () => {
  it('should have error when is empty', async () => {
    const adresse = ''
    const codeNeph = ''
    const email = ''
    const emailValidationHash = ''
    const isValidatedEmail = ''
    const nomNaissance = ''
    const portable = ''
    const prenom = ''
    const departement = ''
    const homeDepartement = ''

    let validated
    try {
      validated = await candidatValidator.validateAsync({
        adresse,
        codeNeph,
        email,
        emailValidationHash,
        isValidatedEmail,
        nomNaissance,
        portable,
        prenom,
        departement,
        homeDepartement,
      })
      expect(validated).toHaveProperty('error')
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError)
    }
  })

  it('should true when is completed', async () => {
    const adresse = 'adresse test'
    const codeNeph = '012345678901'
    const email = 'test@test.com'
    const emailValidationHash = 'test hash'
    const isValidatedEmail = true
    const nomNaissance = 'TEST'
    const portable = '0612345678'
    const prenom = 'test'
    const departement = '95'
    const homeDepartement = '95'
    const validated = await candidatValidator.validateAsync({
      adresse,
      codeNeph,
      email,
      emailValidationHash,
      isValidatedEmail,
      nomNaissance,
      portable,
      prenom,
      departement,
      homeDepartement,
    })
    expect(validated).toBeDefined()
    expect(validated).toHaveProperty('adresse', adresse)
    expect(validated).toHaveProperty('codeNeph', codeNeph)
    expect(validated).toHaveProperty('email', email)
    expect(validated).toHaveProperty('emailValidationHash', emailValidationHash)
    expect(validated).toHaveProperty('isValidatedEmail', isValidatedEmail)
    expect(validated).toHaveProperty('nomNaissance', nomNaissance)
    expect(validated).toHaveProperty('portable', portable)
    expect(validated).toHaveProperty('prenom', prenom)
    expect(validated).toHaveProperty('departement', departement)
    expect(validated).toHaveProperty('homeDepartement', homeDepartement)
  })
})
