import { createInspecteur } from '../inspecteur'

export const inspecteursTests = [
  {
    nom: 'Mulder',
    prenom: 'Fox',
    matricule: '047101111',
    email: 'fox.mulder@x-files.com',
    departement: '93',
  },
  {
    nom: 'Scully',
    prenom: 'Dana',
    matricule: '0331613',
    email: 'dana.scully@x-files.com',
    departement: '93',
  },
]

let inspecteurs

export const createInspecteurs = async () => {
  if (inspecteurs) {
    return inspecteurs
  }
  inspecteurs = await Promise.all(inspecteursTests.map(createInspecteur))
  return inspecteurs
}

export const removeInspecteur = async () => inspecteursTests.deleteMany({})
