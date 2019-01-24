const apiPrefix = `${process.env.PUBLIC_URL || ''}/api/v2`

export default {
  admin: {
    login: `${apiPrefix}/auth/admin/token`,
    verifyToken: `${apiPrefix}/auth/admin/verify-token`,
    candidats: `${apiPrefix}/admin/candidats`,
    uploadCandidatsJson: `${apiPrefix}/admin/candidats`,
    uploadCandidatsCsv: `${apiPrefix}/admin/places`,
    exportCsv: `${apiPrefix}/admin/candidats?for=aurige&format=csv`,
    uploadPlacesCSV: `${apiPrefix}/admin/candidats`,
    whitelist: `${apiPrefix}/admin/whitelisted`,
  },
}
