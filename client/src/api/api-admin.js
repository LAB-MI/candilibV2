
import { ADMIN_TOKEN_STORAGE_KEY } from '../constants'

import apiPaths from './api-paths'
import apiClient from './api-utils'

const getHeadersForAdminJson = () => {
  const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

const getAdminTokenHeader = () => {
  const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
  return {
    Authorization: `Bearer ${token}`,
  }
}

const apiAdmin = {
  async requestToken (email, password) {
    const json = await apiClient.post(apiPaths.admin.login, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
    return json
  },

  async verifyToken (token) {
    const json = await apiClient.get(
        `${apiPaths.admin.verifyToken}?token=${token}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
    )
    return json
  },

  async createUser (user) {
    const json = await apiClient.post(apiPaths.admin.users, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify(user),
    })
    return json
  },

  async getMe () {
    const json = await apiClient.get(apiPaths.admin.myProfile, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async getLastSyncAurigeDateTime () {
    const json = await apiClient.get(apiPaths.admin.lastSyncAurigeDateTime, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async getLastInfosStatusCandidat () {
    const json = await apiClient.get(apiPaths.admin.lastInfosStatusCandidat, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async sortStatusCandilib (nbDays) {
    const json = await apiClient.get(`${apiPaths.admin.sortStatusCandilib}?nbDaysInactivityNeeded=${nbDays}`, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async getNbDaysInactivity () {
    const json = await apiClient.get(apiPaths.admin.getNbDaysInactivity, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async getUsers () {
    const json = await apiClient.get(apiPaths.admin.users, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async getArchivedUsers () {
    const json = await apiClient.get(`${apiPaths.admin.users}?isArchivedOnly=true`, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async updateUser (email, { status, departements, isUnArchive }) {
    const json = await apiClient.patch(apiPaths.admin.users, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({ email, status, departements, isUnArchive }),
    })
    return json
  },

  async deleteUser (emailToDelete) {
    const json = await apiClient.delete(apiPaths.admin.users, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({ email: emailToDelete }),
    })
    return json
  },

  async createTechnicalUser (user) {
    const json = await apiClient.post(apiPaths.admin.techUsers, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify(user),
    })
    return json
  },

  async getTechnicalUsers () {
    const json = await apiClient.get(apiPaths.admin.techUsers, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async getArchivedTechnicalUsers () {
    const json = await apiClient.get(`${apiPaths.admin.users}?isArchivedOnly=true`, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async deleteTechnicalUser (emailToDelete) {
    const json = await apiClient.delete(apiPaths.admin.users, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({ email: emailToDelete }),
    })
    return json
  },

  async startAutomate () {
    const json = await apiClient.post(`${apiPaths.admin.techAutomate}/start`, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async stopAutomate () {
    const json = await apiClient.post(`${apiPaths.admin.techAutomate}/stop`, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async getStatusAutomate () {
    const json = await apiClient.get(`${apiPaths.admin.techAutomate}/status`, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async getJobsAutomate () {
    const json = await apiClient.get(`${apiPaths.admin.techAutomate}/jobs`, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async sendMailResetLink (email) {
    const json = await apiClient.post(apiPaths.admin.resetLink, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    return json
  },

  async resetPassword (email, hash, newPassword, confirmNewPassword) {
    const json = await apiClient.patch(apiPaths.admin.myProfile, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        hash,
        newPassword,
        confirmNewPassword,
      }),
    })
    return json
  },

  async getAllPlacesByDepartement (departement, beginDate, endDate) {
    const departementInfo = `departement=${departement}`
    const beginDateInfo = `beginDate=${encodeURIComponent(beginDate)}`
    const endDateInfo = `endDate=${encodeURIComponent(endDate)}`
    const queryString = `${departementInfo}&${beginDateInfo}&${endDateInfo}`
    const json = await apiClient.get(
        `${apiPaths.admin.places}?${queryString}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async createPlace (centre, inspecteur, date) {
    const json = await apiClient.post(`${apiPaths.admin.places}`, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({
        departement: centre.departement,
        centre,
        inspecteur,
        date,
      }),
    })
    return json
  },

  async createPlaces ({ centre, inspecteur, dates }) {
    const json = await apiClient.post(`${apiPaths.admin.places}`, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({
        departement: centre.departement,
        centre,
        inspecteur,
        dates,
      }),
    })
    return json
  },

  async deletePlace (placeId) {
    const json = await apiClient.delete(
        `${apiPaths.admin.places}/${placeId}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async getCandidats (candidatId, departement) {
    const candidatInfo =
        candidatId && typeof candidatId === 'string' ? '/' + candidatId : ''
    const queryString = departement ? `departement=${departement}` : ''
    const json = await apiClient.get(
        `${apiPaths.admin.candidats}${candidatInfo}?${queryString}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async getCandidatsByDepartement (departement) {
    const json = await apiClient.get(
        `${apiPaths.admin.exportCandidatByDepartement}/${departement}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async searchCandidats (search, departement, startingWith, endingWith) {
    let url = `${apiPaths.admin.candidats}?matching=${search || ''}&departement=${departement}`
    if (startingWith) {
      url += '&startingWith=true'
    }
    if (endingWith) {
      url += '&endingWith=true'
    }
    const json = await apiClient.get(url, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async updateCandidatEmail (id, email) {
    const url = `${apiPaths.admin.candidats}/${id}`
    const json = await apiClient.patch(url, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({
        email,
      }),
    })
    return json
  },

  async updateCandidatHomeDepartement (id, homeDepartement) {
    const url = `${apiPaths.admin.candidats}/${id}`
    const json = await apiClient.patch(url, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({
        homeDepartement,
      }),
    })
    return json
  },

  async updateCandidatPhoneNumber (id, phoneNumber) {
    const url = `${apiPaths.admin.candidats}/${id}`
    const json = await apiClient.patch(url, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({
        phoneNumber,
      }),
    })
    return json
  },

  async removeCandidatPenalty (id) {
    const url = `${apiPaths.admin.candidats}/${id}`
    const json = await apiClient.patch(url, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({
        removePenalty: true,
      }),
    })
    return json
  },

  async getInspecteurs () {
    const json = await apiClient.get(`${apiPaths.admin.inspecteurs}`, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async createInspecteur ({ departement, email, matricule, nom, prenom, email2 }) {
    const json = await apiClient.post(`${apiPaths.admin.inspecteurs}`, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({
        departement,
        email,
        matricule,
        nom,
        prenom,
        secondEmail: email2,
      }),
    })
    return json
  },

  async updateInspecteur ({
    departement,
    email,
    ipcsrId,
    matricule,
    nom,
    prenom,
    email2,
  }) {
    const json = await apiClient.put(
        `${apiPaths.admin.inspecteurs}/${ipcsrId}`,
        {
          headers: getHeadersForAdminJson(),
          body: JSON.stringify({
            departement,
            email,
            matricule,
            nom,
            prenom,
            secondEmail: email2,
          }),
        },
    )
    return json
  },

  async disableInspecteur (ipcsrId) {
    const json = await apiClient.patch(
        `${apiPaths.admin.inspecteurs}/${ipcsrId}`,
        {
          headers: getHeadersForAdminJson(),
          body: JSON.stringify({
            active: false,
          }),
        },
    )
    return json
  },

  async getInspecteursByDepartement (departement) {
    const json = await apiClient.get(
        `${apiPaths.admin.inspecteurs}?departement=${departement}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async getInspecteursBookedByDepartement (date, departement) {
    const encodedDate = encodeURIComponent(date)
    const path = apiPaths.admin.inspecteurs
    const url = `${path}?departement=${departement}&date=${encodedDate}`
    const json = await apiClient.get(url, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async getInspecteursByCentreAndDate (centreId, begin, end) {
    const json = await apiClient.get(
        `${apiPaths.admin.inspecteurs}?centreId=${centreId}&begin=${encodeURIComponent(begin)}&end=${encodeURIComponent(end)}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async searchInspecteurs (search, departement, startingWith, endingWith) {
    let url = `${apiPaths.admin.inspecteurs}?matching=${search || ''}&departement=${departement}`
    if (startingWith) {
      url += '&startingWith=true'
    }
    if (endingWith) {
      url += '&endingWith=true'
    }
    const json = await apiClient.get(url, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async getCreneaux () {
    const json = await apiClient.get(apiPaths.creneaux(), {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async uploadCandidatsJson (body) {
    const json = await apiClient.post(apiPaths.admin.uploadCandidatsJson, {
      headers: getAdminTokenHeader(),
      body,
    })
    return json
  },

  async exportCsv (departement) {
    const departementInfo = departement ? `departement=${departement}` : ''
    const json = await apiClient.getRaw(
        `${apiPaths.admin.exportCsv}&${departementInfo}`,
        {
          headers: getAdminTokenHeader(),
        },
    )
    return json
  },

  exportResultsExamsStatsKpi (
    beginPeriod = '',
    endPeriod = '',
    isCsv = false,
    departement,
  ) {
    const queryString =
        (departement ? `departement=${departement}&` : '') +
        `isCsv=${isCsv}&beginPeriod=${encodeURIComponent(
          beginPeriod,
        )}&endPeriod=${encodeURIComponent(endPeriod)}`
    const path = `${apiPaths.admin.exportResultsExamsStatsKpi}?${queryString}`
    const headers = {
      headers: getAdminTokenHeader(),
    }

    if (isCsv) {
      return apiClient.getRaw(path, headers)
    }
    return apiClient.get(path, headers)
  },

  exportPlacesExamsStatsKpi (isCsv = false, departement) {
    const queryString =
        (departement ? `departement=${departement}&` : '') + `isCsv=${isCsv}`
    const path = `${apiPaths.admin.exportPlacesExamsStatsKpi}?${queryString}`
    const headers = {
      headers: getAdminTokenHeader(),
    }

    if (isCsv) {
      return apiClient.getRaw(path, headers)
    }
    return apiClient.get(path, headers)
  },

  exportCandidatsRetentionStatsKpi (
    beginPeriod = '',
    endPeriod = '',
    isCsv = false,
    departement,
  ) {
    const queryString =
        (departement ? `departement=${departement}&` : '') +
          `isCsv=${isCsv}&beginPeriod=${encodeURIComponent(
            beginPeriod,
          )}&endPeriod=${encodeURIComponent(endPeriod)}`
    const path = `${apiPaths.admin.exportCandidatsRetentionStatsKpi}?${queryString}`
    const headers = {
      headers: getAdminTokenHeader(),
    }

    if (isCsv) {
      return apiClient.getRaw(path, headers)
    }
    return apiClient.get(path, headers)
  },

  exportCandidatsRetentionByWeekStatsKpi (
    departement,
  ) {
    const queryString = (departement ? `departement=${departement}&` : '')
    const path = `${apiPaths.admin.exportCandidatsRetentionByWeekStatsKpi}?${queryString}`
    const headers = {
      headers: getAdminTokenHeader(),
    }
    return apiClient.get(path, headers)
  },

  async uploadPlacesCSV (body) {
    const json = await apiClient.post(apiPaths.admin.places, {
      headers: getAdminTokenHeader(),
      body,
    })
    return json
  },

  async searchWhitelisted (email, departement) {
    const json = await apiClient.get(
        `${apiPaths.admin.searchWhitelisted}${email ||
          ''}&departement=${departement}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async getWhitelist (departement) {
    const json = await apiClient.get(
        `${apiPaths.admin.whitelist}?departement=${departement}`,
        {
          headers: getAdminTokenHeader(),
        },
    )
    return json
  },

  async removeFromWhitelist (id, departement) {
    const json = await apiClient.delete(
        `${apiPaths.admin.whitelist}/${id}?departement=${departement}`,
        {
          headers: getAdminTokenHeader(),
        },
    )
    return json
  },

  async updateWhitelisted (whitelisted) {
    const json = await apiClient.put(
        `${apiPaths.admin.whitelist}/${whitelisted._id}?departement=${whitelisted.departement}`,
        {
          headers: getHeadersForAdminJson(),
          body: JSON.stringify(whitelisted),
        },
    )
    return json
  },

  async addBatchToWhitelist (emails, departement) {
    const json = await apiClient.post(apiPaths.admin.whitelist, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({ emails, departement }),
    })
    return json
  },

  async addToWhitelist (email, departement) {
    const json = await apiClient.post(apiPaths.admin.whitelist, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({ email, departement }),
    })
    return json
  },
  async deleteBookedPlace (placeId) {
    const json = await apiClient.delete(
        `${apiPaths.admin.places}/${placeId}`,
        {
          headers: getHeadersForAdminJson(),
          body: JSON.stringify({ isBookedPlace: true }),
        },
    )
    return json
  },

  async getPlacesAvailableByCentreAndDate (departement, centre, date) {
    const queryString = `departement=${departement}&centre=${centre}&date=${encodeURIComponent(date)}`
    const json = await apiClient.get(
        `${apiPaths.admin.places}?${queryString}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async updateInspecteurForResa (departement, placeId, inspecteur) {
    const json = await apiClient.patch(
        `${apiPaths.admin.places}/${placeId}`,
        {
          headers: getHeadersForAdminJson(),
          body: JSON.stringify({ departement, inspecteur }),
        },
    )
    return json
  },

  async deletePlacesInspecteur (placesToDelete) {
    const json = await apiClient.delete(`${apiPaths.admin.places}`, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({ placesToDelete }),
    })
    return json
  },

  async assignCandidatToPlace (placeId, candidatId, departement) {
    const json = await apiClient.patch(
        `${apiPaths.admin.places}/${placeId}`,
        {
          headers: getHeadersForAdminJson(),
          body: JSON.stringify({ candidatId, departement }),
        },
    )
    return json
  },

  async generateBordereaux (
    departement,
    date,
    isForInspecteurs,
    inspecteurIdListe,
  ) {
    const json = await apiClient.post(
        `${apiPaths.admin.generateBordereaux}`,
        {
          headers: getHeadersForAdminJson(),
          body: JSON.stringify({
            departement,
            date,
            isForInspecteurs,
            inspecteurIdListe,
          }),
        },
    )
    return json
  },

  async getAllCentres () {
    const url = apiPaths.admin.centres
    const json = await apiClient.get(url, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

  async createDepartement (departementId, departementEmail, isAddedRecently) {
    const json = await apiClient.post(`${apiPaths.admin.departements}`, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({ departementId, departementEmail, isAddedRecently }),
    })
    return json
  },

  async modifyCentre ({ centreId, nom, label, adresse, lon, lat, active, geoDepartement }) {
    const json = await apiClient.patch(apiPaths.admin.centres, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({
        centreId,
        nom,
        label,
        adresse,
        lon,
        lat,
        active,
        geoDepartement,
      }),
    })
    return json
  },

  async getDepartements (departementId) {
    const paramString = departementId ? `${departementId}` : ''
    const json = await apiClient.get(
        `${apiPaths.admin.departements}/${paramString}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async createCentre ({ nom, label, adresse, lon, lat, departement, geoDepartement }) {
    const json = await apiClient.post(apiPaths.admin.centres, {
      headers: getHeadersForAdminJson(),
      body: JSON.stringify({ nom, label, adresse, lon, lat, departement, geoDepartement }),
    })
    return json
  },
  async updateDepartement (departementId, newEmail, isAddedRecently, disableAt) {
    const json = await apiClient.patch(
        `${apiPaths.admin.departements}/${departementId}`,
        {
          headers: getHeadersForAdminJson(),
          body: JSON.stringify({ newEmail, isAddedRecently, disableAt }),
        },
    )
    return json
  },

  async deleteDepartement (departementId) {
    const paramString = departementId ? `${departementId}` : ''
    const json = await apiClient.delete(
        `${apiPaths.admin.departements}/${paramString}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async getlogsPeerPages ({ page, start, end, isByHomeDepartement }) {
    const startAnEnd = `start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    const isByHomeDpt = isByHomeDepartement ? `&isByHomeDepartement=${encodeURIComponent(isByHomeDepartement)}` : ''
    const json = await apiClient.get(
        `${apiPaths.admin.statsLogs}?pageNumber=${page || 0}&${startAnEnd}${isByHomeDpt}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async getStatsCountStatuses (begin, end) {
    let queryString = '?'
    if (begin && end) {
      queryString += `beginPeriod=${encodeURIComponent(begin)}&endPeriod=${encodeURIComponent(end)}`
    }
    const json = await apiClient.get(
      `${apiPaths.admin.statsCountStatuses}${queryString}`,
      {
        headers: getHeadersForAdminJson(),
      },
    )
    return json
  },

  async getCountsLastConnections (page) {
    let query = ''
    if (page !== undefined) {
      query = `?page=${page}`
    }
    const json = await apiClient.get(
        `${apiPaths.admin.statsCountLastConnections}${query}`,
        {
          headers: getHeadersForAdminJson(),
        },
    )
    return json
  },

  async getTotalLoggable () {
    const json = await apiClient.get(
      `${apiPaths.admin.statsTotalLoggable}`,
      {
        headers: getHeadersForAdminJson(),
      },
    )
    return json
  },

  async getInfoPlacesExamByIpcsrAndDate (ipcsrId, date) {
    const url = `${apiPaths.admin.placesExam}?ipcsr=${ipcsrId}&date=${encodeURIComponent(date)}`
    const json = await apiClient.get(url, {
      headers: getHeadersForAdminJson(),
    })
    return json
  },

}
export default apiAdmin
