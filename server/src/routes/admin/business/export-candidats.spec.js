import { getCandidatsAsCsv, getBookedCandidatsAsCsv } from './export-candidats'

const candidats = [
  {
    codeNeph: '093123456789',
    prenom: 'MAX',
    nomNaissance: 'MAD',
    isValidatedByAurige: false,
    isValidatedEmail: true,
    adresse: '40 Avenue des terroirs de France 75012 Paris',
    portable: '0612345678',
    email: 'madmax@candilib.com',
    departement: '75',
  },
  {
    codeNeph: '093458736982',
    prenom: 'JESSIE',
    nomNaissance: 'ROCKATANSKY',
    isValidatedByAurige: false,
    isValidatedEmail: true,
    adresse: '40 Avenue des terroirs de France 75012 Paris',
    portable: '0645873218',
    email: 'jessierockatansky@candilib.com',
    departement: '75',
  },
]

describe('export-candidats', () => {
  it('Should return a CSV string with ";" as delimiter', async () => {
    const { codeNeph, nomNaissance, prenom, email } = candidats[0]
    const expectedFirstLine = `${codeNeph};${nomNaissance};${nomNaissance};${prenom};${email}`

    const csv = await getCandidatsAsCsv(candidats)

    expect(csv.substr(0, 51)).toContain(
      `Code NEPH;Nom de naissance;Nom d'usage;Prénom;email`
    )
    expect(csv.substr(51, 100)).toContain(expectedFirstLine)
  })
})

describe('export-candidats', () => {
  it('Should return a CSV buffer', async () => {
    const { codeNeph, nomNaissance, prenom } = candidats[0]
    candidats[0].place = {
      date: new Date(2019, 5, 12, 14, 45),
    }
    const expectedFirstLine = `,,${JSON.stringify(
      '2019-06-12 14:45'
    )},${JSON.stringify(codeNeph)},${JSON.stringify(
      nomNaissance
    )},${JSON.stringify(prenom)}`

    const csv = await getBookedCandidatsAsCsv(candidats)

    expect(csv.substr(0, 76)).toContain(
      `"inspecteur","centre","Date réservé","Code NEPH","Nom de naissance","Prénom"`
    )
    expect(csv.substr(76, 120)).toContain(expectedFirstLine)
  })
})
