import { createCentre } from '../centre.queries'
import Centre from '../centre.model'

export const centres = [
  {
    departement: '92',
    nom: 'centre 1',
    label: "Centre d'examen 1",
    adresse: '1 rue Test, ville test, FR, 92001',
  },
  {
    departement: '93',
    nom: 'Centre 2',
    label: "Centre d'examen 2",
    adresse: '2 Avenue test, Ville test 2, FR, 93420',
  },
  {
    departement: '93',
    nom: 'Centre 3',
    label: "Centre d'examen 3",
    adresse: '3 Avenue test, ville test 3, FR, 93000',
  },
]

export const nbCentres = departement =>
  departement
    ? centres.filter(centre => centre.departement === departement).length
    : centres.length
export const createCentres = async () => {
  return centres.map(centre => {
    const { nom, label, adresse, departement } = centre
    return createCentre(nom, label, adresse, departement)
  })
}

export const removeCentres = async () => {
  Centre.remove()
}
