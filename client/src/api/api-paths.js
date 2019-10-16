const { CLIENT_BUILD_TARGET, NODE_ENV } = process.env

const isBuildWithAll = NODE_ENV !== 'production' || ['ALL', undefined].includes(CLIENT_BUILD_TARGET)
const isBuildWithCandidat = NODE_ENV !== 'production' || ['ALL', 'CANDIDAT'].includes(CLIENT_BUILD_TARGET)
const isBuildWithAdmin = NODE_ENV !== 'production' || ['ALL', 'ADMIN'].includes(CLIENT_BUILD_TARGET)

const apiPrefix = `${process.env.BASE_URL || '/'}api/v2`

// TODO: Use prepack to avoid presence of admin API paths for candidat build

const candidatApiPaths = (isBuildWithAll || isBuildWithCandidat) && {
  centres: `${apiPrefix}/candidat/centres`,
  evaluations: `${apiPrefix}/candidat/evaluations`,
  magicLink: `${apiPrefix}/auth/candidat/magic-link`,
  myProfile: `${apiPrefix}/candidat/me`,
  places: `${apiPrefix}/candidat/places`,
  presignup: `${apiPrefix}/candidat/preinscription`,
  reservations: `${apiPrefix}/candidat/reservations`,
  verifyToken: `${apiPrefix}/auth/candidat/verify-token`,
}

const adminApiPaths = (isBuildWithAll || isBuildWithAdmin) && {
  candidats: `${apiPrefix}/admin/candidats`,
  exportCsv: `${apiPrefix}/admin/candidats?for=aurige&format=csv`,
  exportStatsKpiCsv: `${apiPrefix}/admin/stats`,
  login: `${apiPrefix}/auth/admin/token`,
  myProfile: `${apiPrefix}/admin/me`,
  place: `${apiPrefix}/admin/place`,
  places: `${apiPrefix}/admin/places`,
  reservations: `${apiPrefix}/admin/reservations`,
  uploadCandidatsJson: `${apiPrefix}/admin/candidats`,
  searchCandidats: `${apiPrefix}/admin/candidats?matching=`,
  searchWhitelisted: `${apiPrefix}/admin/whitelisted?matching=`,
  inspecteurs: `${apiPrefix}/admin/inspecteurs`,
  uploadPlacesCSV: `${apiPrefix}/admin/places`,
  verifyToken: `${apiPrefix}/auth/admin/verify-token`,
  whitelist: `${apiPrefix}/admin/whitelisted`,
  generateBordereaux: `${apiPrefix}/admin/bordereaux`,
  resetLink: `${apiPrefix}/auth/admin/reset-link`,
}

const utilPaths = {
  adressesQuery (search) { return `https://api-adresse.data.gouv.fr/search/?q=${search}` },
}

const apiPaths = {
  candidat: candidatApiPaths,
  admin: adminApiPaths,
  util: utilPaths,
}

export default apiPaths
