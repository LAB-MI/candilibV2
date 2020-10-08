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
  {
    nom: 'Scully01',
    prenom: 'Dana01',
    matricule: '033161301',
    email: 'dana.scully01@x-files.com',
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

export const removeInspecteur = async () => {
  const tmp =
    inspecteurs &&
    (await Promise.all(
      inspecteurs.map(async inspecteur => {
        const tmp = await inspecteur.delete()
        return tmp
      }),
    ))
  return tmp
}
export const resetCreatedInspecteurs = () => {
  inspecteurs = undefined
}

export const setInitCreatedInspecteurs = () => {
  inspecteurs = undefined
}
