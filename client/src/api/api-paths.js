const { CLIENT_BUILD_TARGET, NODE_ENV } = process.env

const isBuildWithAll = NODE_ENV !== 'production' || ['ALL', undefined].includes(CLIENT_BUILD_TARGET)
const isBuildWithCandidat = NODE_ENV !== 'production' || ['ALL', 'CANDIDAT'].includes(CLIENT_BUILD_TARGET)
const isBuildWithAdmin = NODE_ENV !== 'production' || ['ALL', 'ADMIN'].includes(CLIENT_BUILD_TARGET)
const basePrefix = `${process.env.BASE_URL || '/'}`
const apiPrefix = `${basePrefix}api/v2`

// TODO: Use prepack to avoid presence of admin API paths for candidat build

const candidatApiPaths = (isBuildWithAll || isBuildWithCandidat) && {
  centres: `${apiPrefix}/candidat/centres`,
  config: `${apiPrefix}/candidat/config`,
  evaluations: `${apiPrefix}/candidat/evaluations`,
  magicLink: `${apiPrefix}/auth/candidat/magic-link`,
  myProfile: `${apiPrefix}/candidat/me`,
  places: `${apiPrefix}/candidat/places`,
  presignup: `${apiPrefix}/candidat/preinscription`,
  verifyToken: `${apiPrefix}/auth/candidat/verify-token`,
  departements: `${apiPrefix}/candidat/departements`,
  contactUs: `${apiPrefix}/candidat/contact-us`,
}

const adminApiPaths = (isBuildWithAll || isBuildWithAdmin) && {
  candidats: `${apiPrefix}/admin/candidats`,
  centres: `${apiPrefix}/admin/centres`,
  exportCsv: `${apiPrefix}/admin/candidats?for=aurige&format=csv`,
  lastSyncAurigeDateTime: `${apiPrefix}/admin/last-sync-aurige-info`,
  exportResultsExamsStatsKpi: `${apiPrefix}/admin/stats-results-exams`,
  exportPlacesExamsStatsKpi: `${apiPrefix}/admin/stats-places-exams`,
  exportCandidatsRetentionStatsKpi: `${apiPrefix}/admin/stats-candidats-retention`,
  exportCandidatsRetentionByWeekStatsKpi: `${apiPrefix}/admin/stats-candidats-retention-by-week`,
  login: `${apiPrefix}/auth/admin/token`,
  myProfile: `${apiPrefix}/admin/me`,
  places: `${apiPrefix}/admin/places`,
  uploadCandidatsJson: `${apiPrefix}/admin/candidats`,
  users: `${apiPrefix}/admin/users`,
  searchCandidats: `${apiPrefix}/admin/candidats?matching=`,
  searchWhitelisted: `${apiPrefix}/admin/whitelisted?matching=`,
  inspecteurs: `${apiPrefix}/admin/inspecteurs`,
  verifyToken: `${apiPrefix}/auth/admin/verify-token`,
  whitelist: `${apiPrefix}/admin/whitelisted`,
  generateBordereaux: `${apiPrefix}/admin/bordereaux`,
  resetLink: `${apiPrefix}/auth/admin/reset-link`,
  departements: `${apiPrefix}/admin/departements`,
}

const publicPaths = {
  configCandidat: `${basePrefix}config-candilib.json`,
  departements: `${apiPrefix}/public/departements`,
  centres: `${apiPrefix}/public/centres`,
}

const apiPaths = {
  candidat: candidatApiPaths,
  admin: adminApiPaths,
  public: publicPaths,
}

export default apiPaths
