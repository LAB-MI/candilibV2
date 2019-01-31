import Centre from './centre.model'

export const findAllCentres = async () => {
  const centres = await Centre.findOne({})
  return centres
}

export const findCentreByName = async nom => {
  const centre = await Centre.findOne({ nom })
  return centre
}

export const createCentre = async (nom, label, adresse, departement) => {
  const centre = new Centre({ nom, label, adresse, departement })
  await centre.save()
  return centre
}

export const deleteCentreByName = async nom => {
  const centre = await Centre.findOne({ nom })
  if (!centre) {
    throw new Error('No centre found')
  }
  await centre.delete()
  return centre
}

export const deleteCentre = async centre => {
  if (!centre) {
    throw new Error('No centre given')
  }
  await centre.delete()
  return centre
}

export const updateCentreLabel = async (centre, name, label, adresse) => {
  if (!centre) {
    throw new Error('centre is undefined')
  }
  await centre.update({ name, label, adresse })
  const updatedCentre = await Centre.findById(centre._id)
  return updatedCentre
}
