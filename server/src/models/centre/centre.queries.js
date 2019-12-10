import Centre from './centre.model'

const caseInsensitive = nom => ({
  $regex: new RegExp('^' + nom.toLowerCase(), 'i'),
})

export const findAllCentres = async () => {
  const centres = await Centre.find({})
  return centres
}

export const findAllActiveCentres = async () => {
  const centres = await Centre.find({ active: { $ne: false } })
  return centres
}

/**
 * @deprecated nom n'est pas unique. A remplacer par findCentreByNameAndDepartement
 * @param {string} nom
 */
export const findCentreByName = async nom => {
  const centre = await Centre.findOne({
    nom: caseInsensitive(nom),
    active: { $ne: false },
  })
  return centre
}

export const createCentre = async (
  nom,
  label,
  adresse,
  lon,
  lat,
  departement
) => {
  const geoloc = {
    type: 'Point',
    coordinates: [lon, lat],
  }
  const centre = new Centre({
    nom,
    label,
    adresse,
    geoloc,
    departement,
    active: true,
  })
  await centre.save()
  return centre
}

export const deleteCentre = async centre => {
  if (!centre) {
    throw new Error('No centre given')
  }
  await centre.delete()
  return centre
}

export const disableCentre = async centre => {
  if (!centre) {
    throw new Error('No centre given')
  }
  await centre.updateOne({ active: false })
  const updatedCentre = await Centre.findById(centre._id)
  return updatedCentre
}

export const updateCentreLabel = async (
  centre,
  name,
  label,
  adresse,
  lon,
  lat
) => {
  if (!centre) {
    throw new Error('centre is undefined')
  }
  await centre.updateOne({ nom: name, label, adresse, lon, lat })
  const updatedCentre = await Centre.findById(centre._id)
  return updatedCentre
}

export const findCentresByDepartement = async (departementId, options = '-__v') => {
  const filters = {
    active: { $ne: false },
  }

  if (departementId) {
    filters.departement = departementId
  }

  const centres = await Centre.find(
    filters,
    options
  )

  return centres
}

export const findCentreByNameAndDepartement = async (nom, departement) => {
  const centre = await Centre.findOne({
    nom: caseInsensitive(nom),
    departement,
    active: { $ne: false },
  })
  return centre
}

export const findCentreById = async id => {
  const centre = await Centre.findOne({ _id: id, active: { $ne: false } })
  return centre
}

export const getDepartementsFromCentres = async () => {
  const departements = await Centre.distinct('departement')
  return departements
}
