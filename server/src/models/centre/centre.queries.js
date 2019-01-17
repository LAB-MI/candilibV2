import Site from './centre.model'

export const findAllSites = async () => {
  const sites = await Site.findOne({})
  return sites
}

export const findSiteByName = async nom => {
  const site = await Site.findOne({ nom })
  return site
}

export const createSite = async (nom, label, adresse, departement) => {
  const site = new Site({ nom, label, adresse, departement })
  await site.save()
  return site
}

export const deleteSiteByName = async nom => {
  const site = await Site.findOne({ nom })
  if (!site) {
    throw new Error('No site found')
  }
  await site.delete()
  return site
}

export const deleteSite = async site => {
  if (!site) {
    throw new Error('No site given')
  }
  await site.delete()
  return site
}

export const updateSiteLabel = async (site, name, label, adresse) => {
  if (!site) {
    throw new Error('site is undefined')
  }
  await site.update({ name, label, adresse })
  const updatedSite = await Site.findById(site._id)
  return updatedSite
}
