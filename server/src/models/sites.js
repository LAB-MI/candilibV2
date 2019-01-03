import mongoose from 'mongoose'

const { Schema } = mongoose

const SiteSchema = new Schema({
  nom: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
    trim: true,
  },
  adresse: {
    type: String,
    required: true,
    trim: true,
  },
})

export const Site = mongoose.model('Site', SiteSchema)

export const findAllSites = async () => {
  const sites = await Site.findOne({})
  return sites
}

export const findSiteByName = async nom => {
  const site = await Site.findOne({ nom })
  return site
}

export const findSiteByCredentials = async (email, password) => {
  const site = await Site.findOne({ email })
  const isValidCredentials = site.comparePassword(password)
  if (!isValidCredentials) {
    return null
  }
  return site
}

export const createSite = async (nom, label, adresse) => {
  const site = new Site({ nom, label, adresse })
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
