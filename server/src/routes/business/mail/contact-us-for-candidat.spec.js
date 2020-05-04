import { getContactUsForCandidat } from './contact-us-for-candidat'

describe('template contact us for candidat', () => {
  it('should have message with the word "déclaré" when departement is empty', () => {
    const message = getContactUsForCandidat('')
    expect(message).toMatch(/votre département déclaré/)
  })
  it('should have message with the departement when departement is 93', () => {
    const departement = 93
    const message = getContactUsForCandidat(departement)
    expect(message).toMatch(/du département 93/)
  })
})
