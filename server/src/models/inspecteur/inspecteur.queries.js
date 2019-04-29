import Inspecteur from './inspecteur.model'

export const createInspecteur = async ({ email, matricule, nom, prenom }) => {
  const inspecteur = new Inspecteur({ email, matricule, nom, prenom })
  await inspecteur.save()
  return inspecteur
}

export const findInspecteurById = async id => Inspecteur.findById(id)

export const findInspecteurByMatricule = async matricule =>
  Inspecteur.findOne({ matricule })

export const findInspecteursMatching = async search => {
  const inspecteurs = await Inspecteur.find({
    nom: new RegExp(search, 'i'),
  })
  return inspecteurs
}

export const findInspecteurByName = async prenom =>
  Inspecteur.findOne({ prenom })

export const findInspecteurByEmail = async email =>
  Inspecteur.findOne({ email })

export const deleteInspecteurByMatricule = async matricule => {
  const inspecteur = await findInspecteurByMatricule(matricule)
  if (!inspecteur) {
    throw new Error(`No inspecteur found with matricule ${matricule}`)
  }
  await inspecteur.delete()
  return inspecteur
}

export const deleteInspecteurById = async id => {
  const inspecteur = await findInspecteurById(id)
  if (!inspecteur) {
    throw new Error(`No inspecteur found with id ${id}`)
  }
  await inspecteur.delete()
  return inspecteur
}
