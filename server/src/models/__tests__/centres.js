import { createCentre } from '../centre/centre.queries'
import Centre from '../centre/centre.model'

export const centres = [
  {
    departement: '92',
    nom: 'Centre 1',
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

let createdCentres
let creatingCentres = false

export const createCentres = async () => {
  if (createdCentres || creatingCentres) {
    return createdCentres
  }
  creatingCentres = true
  createdCentres = Promise.all(
    centres.map(centre => {
      const { nom, label, adresse, departement } = centre
      return createCentre(nom, label, adresse, departement)
    })
  )
  creatingCentres = false
  return createdCentres
}

export const removeCentres = async () => Centre.deleteMany({})
