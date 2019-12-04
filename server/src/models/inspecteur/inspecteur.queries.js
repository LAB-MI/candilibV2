import Inspecteur from './inspecteur.model'

export const createInspecteur = async ({
  email,
  matricule,
  nom,
  prenom,
  departement,
}) => {
  const inspecteur = new Inspecteur({
    email,
    matricule,
    nom,
    prenom,
    departement,
  })
  await inspecteur.save()
  return inspecteur
}

export const findInspecteurById = async id => Inspecteur.findById(id)

export const findInspecteurByMatricule = async matricule =>
  Inspecteur.findOne({ matricule })

export const findInspecteurByDepartement = async departement =>
  Inspecteur.find({ departement })

export const findInspecteursMatching = async $search => {
  const search = new RegExp($search, 'i')

  const inspecteurs = await Inspecteur.find({
    $or: [
      { nom: search },
      { prenom: search },
      { matricule: search },
      { email: search },
    ],
  })

  const fullTextInspecteurs = await Inspecteur.find(
    { $text: { $search } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } })

  return [
    ...inspecteurs,
    ...fullTextInspecteurs.filter(
      inspecteur =>
        !inspecteurs.some(
          ins => ins._id.toString() === inspecteur._id.toString()
        )
    ),
  ]
}

export const findInspecteurByName = async (prenom, nom) => {
  const inspecteur = {}
  if (nom) {
    inspecteur.nom = nom
  }
  if (prenom) {
    inspecteur.prenom = prenom
  }
  return Inspecteur.findOne(inspecteur)
}

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

export const findAllInspecteurs = async () => {
  const inspecteurs = await Inspecteur.find()
  return inspecteurs
}
