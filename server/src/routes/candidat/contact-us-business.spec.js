import { sendMessageByContactUs } from './contact-us-business'
import { findDepartementById } from '../../models/departement'
import {
  DEPARTEMENT_EMAIL_MISSING,
  CONTACT_US_CONFIRM_SEND,
} from './message.constants'
import { findCandidatById } from '../../models/candidat'

jest.mock('../business/send-mail')
jest.mock('../../models/departement')
jest.mock('../../models/candidat')

const loggerContent = { section: 'test' }
const candidat = {
  codeNeph: '012345678901',
  nomNaissance: 'TEST NOM',
  prenom: 'Test Prénom',
  portable: '06012345678',
  email: 'test@test.com',
  departement: '93',
}
const subjectTest = 'subject test'
const message = 'test message'
const candidatId = 'candidatId'

describe('Test business of contact us', () => {
  beforeEach(() => {
    require('../business/send-mail').deleteMails()
  })
  it('Should throw error when departement is not found', async () => {
    findDepartementById.mockResolvedValue(null)
    try {
      const response = await sendMessageByContactUs(
        loggerContent,
        undefined,
        candidat,
        false,
        subjectTest,
        message,
      )
      expect(response).toBeUndefined()
    } catch (error) {
      expect(error).toHaveProperty('message', DEPARTEMENT_EMAIL_MISSING)
    }
    const bodyMails = require('../business/send-mail').getMails()
    expect(bodyMails).toHaveLength(0)
  })

  it('Should Send mail contact us for candidat unsigned', async () => {
    const departementEmail = 'test@departement.com'
    findDepartementById.mockResolvedValue({ email: departementEmail })

    const response = await sendMessageByContactUs(
      loggerContent,
      undefined,
      candidat,
      false,
      subjectTest,
      message,
    )
    expect(response).toBe(CONTACT_US_CONFIRM_SEND(candidat.email))
    const bodyMails = require('../business/send-mail').getMails()
    expect(bodyMails).toHaveLength(2)
    expect(bodyMails.map(({ to }) => to)).toEqual(
      expect.arrayContaining([candidat.email, departementEmail]),
    )
  })

  it('Should Send mail contact us for candidat signed and not archived', async () => {
    const departementEmail = 'test@departement.com'
    const departement75Email = 'test.75@departement.com'
    findDepartementById.mockImplementation(dep =>
      dep === candidatInDB.departement
        ? { email: departement75Email }
        : { email: departementEmail },
    )
    const candidatInDB = {
      ...candidat,
      homeDepartement: '93',
      departement: '75',
      email: 'test@new.mail.com',
    }
    findCandidatById.mockResolvedValue(candidatInDB)
    const response = await sendMessageByContactUs(
      loggerContent,
      candidatId,
      candidat,
      false,
      subjectTest,
      message,
    )
    expect(response).toBe(CONTACT_US_CONFIRM_SEND(candidatInDB.email))
    const bodyMails = require('../business/send-mail').getMails()
    expect(bodyMails).toHaveLength(2)
    expect(bodyMails.map(({ to }) => to)).toEqual(
      expect.arrayContaining([candidatInDB.email, departement75Email]),
    )

    bodyMails.forEach(({ to, subject, html }) => {
      if (to === candidatInDB.email) {
        expect(subject).toBe('Prise en compte de votre demande')
        expect(html).toMatch(/du département 75/)
      }
      if (to === departement75Email) {
        expect(subject).toBe(subjectTest)
        const contentMessage1 = `mailto\\:${candidatInDB.email}\\?subject=RE\\:${subjectTest}`
        expect(html).toMatch(new RegExp(contentMessage1))
        expect(html).toMatch(/Département de résidence: 93/)
        expect(html).toMatch(/Candidat pré-inscrit ou inscrit: OUI/)
      }
    })
  })

  it('Should Send mail contact us for candidat signed and archived', async () => {
    const departementEmail = 'test@departement.com'
    const departement75Email = 'test.75@departement.com'
    findDepartementById.mockImplementation(dep =>
      dep === '75' ? { email: departement75Email } : { email: departementEmail },
    )
    findCandidatById.mockResolvedValue(null)
    const response = await sendMessageByContactUs(
      loggerContent,
      candidatId,
      candidat,
      false,
      subjectTest,
      message,
    )
    expect(response).toBe(CONTACT_US_CONFIRM_SEND(candidat.email))
    const bodyMails = require('../business/send-mail').getMails()
    expect(bodyMails).toHaveLength(2)
    expect(bodyMails.map(({ to }) => to)).toEqual(
      expect.arrayContaining([candidat.email, departementEmail]),
    )

    bodyMails.forEach(({ to, subject, html }) => {
      if (to === candidat.email) {
        expect(subject).toBe('Prise en compte de votre demande')
        expect(html).toMatch(/votre département déclaré/)
      }
      if (to === departement75Email) {
        expect(subject).toBe(subjectTest)
        const contentMessage1 = `mailto\\:${candidat.email}\\?subject=RE\\:${subjectTest}`
        expect(html).toMatch(new RegExp(contentMessage1))
        expect(html).toMatch(/Département de résidence: 93/)
        expect(html).toMatch(/Candidat pré-inscrit ou inscrit: NON/)
      }
    })
  })
})
