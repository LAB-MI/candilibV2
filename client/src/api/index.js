import 'whatwg-fetch'

import store, { UNAUTHORIZED } from '../store'
import apiPaths from './api-paths'
import { ADMIN_TOKEN_STORAGE_KEY, CANDIDAT_TOKEN_STORAGE_KEY } from '../constants'

const checkStatus = async response => {
  if (response.status === 401) {
    await store.dispatch(UNAUTHORIZED)
  }
  return response
}

const checkValidJson = async response => {
  let data
  try {
    data = await response.json()
    return data
  } catch (e) {
    throw new Error('Oups, une petite erreur est survenue.')
  }
}

export const fetchClient = (url, options) => fetch(url, options).then(checkStatus)
export const jsonClient = (url, options) => fetchClient(url, options).then(checkValidJson)

const apiClient = {
  post: (url, options) => jsonClient(url, { ...options, method: 'post' }),
  get: (url, options) => jsonClient(url, { ...options, method: 'GET' }),
  getRaw: (url, options) => fetchClient(url, { ...options, method: 'GET' }),
  put: (url, options) => jsonClient(url, { ...options, method: 'PUT' }),
  patch: (url, options) => jsonClient(url, { ...options, method: 'PATCH' }),
  delete: (url, options) => jsonClient(url, { ...options, method: 'DELETE' }),
}

const getHeadersForJson = () => {
  const token = localStorage.getItem(CANDIDAT_TOKEN_STORAGE_KEY)
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

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

export default {
  candidat: {
    async verifyToken (token, isTokenFromMagicLink) {
      const options = {
        headers: {
          'x-magic-link': isTokenFromMagicLink,
        },
      }
      const json = await apiClient.get(`${apiPaths.candidat.verifyToken}?token=${token}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      return json
    },

    async presignup (candidat) {
      const json = await apiClient.post(apiPaths.candidat.presignup, {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidat),
      })
      return json
    },

    async sendMagicLink (email) {
      const json = await apiClient.post(apiPaths.candidat.magicLink, {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      return json
    },

    async getMyProfile () {
      const json = await apiClient.get(apiPaths.candidat.myProfile, {
        headers: getHeadersForJson(),
      })
      return json
    },

    async getCentre (departement, nom) {
      const queryString = `departement=${departement}&nom=${nom}`
      const json = await apiClient.get(`${apiPaths.candidat.centres}?${queryString}`, {
        headers: getHeadersForJson(),
      })
      return json
    },

    async getCentres (departement, end) {
      const queryString = `departement=${departement}&end=${encodeURIComponent(end)}`
      const json = await apiClient.get(`${apiPaths.candidat.centres}?${queryString}`, {
        headers: getHeadersForJson(),
      })
      return json
    },

    async getPlaces (centreId, begin, end) {
      const queryString = `begin=${encodeURIComponent(begin)}&end=${encodeURIComponent(end)}`
      const json = await apiClient.get(`${apiPaths.candidat.places}/${centreId}?${queryString}`, {
        headers: getHeadersForJson(),
      })
      return json
    },

    async checkPlacesAvailability (centreId, date) {
      const queryString = `dateTime=${encodeURIComponent(date)}`
      const json = await apiClient.get(`${apiPaths.candidat.places}/${centreId}?${queryString}`, {
        headers: getHeadersForJson(),
      })
      return json
    },

    async getReservations () {
      const json = await apiClient.get(`${apiPaths.candidat.reservations}`, {
        headers: getHeadersForJson(),
      })
      return json
    },

    async setReservations (centreId, date, isAccompanied, hasDualControlCar) {
      const json = await apiClient.post(`${apiPaths.candidat.reservations}`, {
        body: JSON.stringify({ id: centreId, date, isAccompanied, hasDualControlCar }),
        headers: getHeadersForJson(),
      })
      return json
    },

    async sendEmail () {
      const json = await apiClient.get(`${apiPaths.candidat.reservations}?bymail=${true}`, {
        headers: getHeadersForJson(),
      })
      return json
    },

    async deleteReservation () {
      const json = await apiClient.delete(`${apiPaths.candidat.reservations}`, {
        headers: getHeadersForJson(),
      })
      return json
    },

    async validateEmail (email, hash) {
      const json = await apiClient.put(apiPaths.candidat.myProfile, {
        headers: getHeadersForJson(),
        body: JSON.stringify({
          email,
          hash,
        }),
      })
      return json
    },

    async sendEvaluation (evaluation) {
      const json = await apiClient.post(apiPaths.candidat.evaluations, {
        headers: getHeadersForJson(),
        body: JSON.stringify({
          evaluation,
        }),
      })
      return json
    },
  },

  admin: {
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
      const json = await apiClient.get(`${apiPaths.admin.verifyToken}?token=${token}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      return json
    },

    async getMe () {
      const json = await apiClient.get(apiPaths.admin.myProfile, {
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
      const json = await apiClient.patch(apiPaths.admin.resetPassword, {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email, hash, newPassword, confirmNewPassword,
        }),
      })
      return json
    },

    async getAllPlacesByDepartement (departement, beginDate, endDate) {
      const departementInfo = `departement=${departement}`
      const beginDateInfo = `beginDate=${encodeURIComponent(beginDate)}`
      const endDateInfo = `endDate=${encodeURIComponent(endDate)}`
      const queryString = `${departementInfo}&${beginDateInfo}&${endDateInfo}`
      const json = await apiClient.get(`${apiPaths.admin.places}?${queryString}`, {
        headers: getHeadersForAdminJson(),
      })
      return json
    },

    async createPlace (centre, inspecteur, date) {
      const json = await apiClient.post(`${apiPaths.admin.place}`, {
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

    async deletePlace (placeId) {
      const json = await apiClient.delete(`${apiPaths.admin.place}/${placeId}`, {
        headers: getHeadersForAdminJson(),
      })
      return json
    },

    async getCandidats (candidatId, departement) {
      const candidatInfo = candidatId && typeof candidatId === 'string' ? '/' + candidatId : ''
      const queryString = departement ? `departement=${departement}` : ''
      const json = await apiClient.get(`${apiPaths.admin.candidats}${candidatInfo}?${queryString}`, {
        headers: getHeadersForAdminJson(),
      })
      return json
    },

    async searchCandidats (search, departement) {
      const json = await apiClient.get(`${apiPaths.admin.searchCandidats}${search || ''}&departement=${departement}`, {
        headers: getHeadersForAdminJson(),
      })
      return json
    },

    async getInspecteursByDepartement (departement) {
      const json = await apiClient.get(`${apiPaths.admin.inspecteurs}?departement=${departement}`, {
        headers: getHeadersForAdminJson(),
      })
      return json
    },

    async getInspecteursByCentreAndDate (centreId, begin, end) {
      const json = await apiClient.get(
        `${apiPaths.admin.inspecteurs}?centreId=${centreId}&begin=${begin}&end=${end}`,
        {
          headers: getHeadersForAdminJson(),
        }
      )
      return json
    },

    async searchInspecteurs (search, departement) {
      const json = await apiClient.get(
        `${apiPaths.admin.inspecteurs}?matching=${search || ''}&departement=${departement}`,
        {
          headers: getHeadersForAdminJson(),
        }
      )
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
      const json = await apiClient.getRaw(`${apiPaths.admin.exportCsv}&${departementInfo}`, {
        headers: getAdminTokenHeader(),
      })
      return json
    },

    async exportStatsKpiCsv () {
      const json = await apiClient.getRaw(`${apiPaths.admin.exportStatsKpiCsv}`, {
        headers: getAdminTokenHeader(),
      })
      return json
    },

    async uploadPlacesCSV (body) {
      const json = await apiClient.post(apiPaths.admin.uploadPlacesCSV, {
        headers: getAdminTokenHeader(),
        body,
      })
      return json
    },

    async searchWhitelisted (email, departement) {
      const json = await apiClient.get(`${apiPaths.admin.searchWhitelisted}${email || ''}&departement=${departement}`, {
        headers: getHeadersForAdminJson(),
      })
      return json
    },

    async getWhitelist (departement) {
      const json = await apiClient.get(`${apiPaths.admin.whitelist}?departement=${departement}`, {
        headers: getAdminTokenHeader(),
      })
      return json
    },

    async removeFromWhitelist (id, departement) {
      const json = await apiClient.delete(`${apiPaths.admin.whitelist}/${id}?departement=${departement}`, {
        headers: getAdminTokenHeader(),
      })
      return json
    },

    async updateWhitelisted (whitelisted) {
      const json = await apiClient.put(
        `${apiPaths.admin.whitelist}/${whitelisted._id}?departement=${whitelisted.departement}`,
        {
          headers: getHeadersForAdminJson(),
          body: JSON.stringify(whitelisted),
        }
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
      const json = await apiClient.delete(`${apiPaths.admin.reservations}/${placeId}`, {
        headers: getHeadersForAdminJson(),
      })
      return json
    },

    async getPlacesAvailableByCentreAndDate (departement, centre, date) {
      const queryString = `departement=${departement}&centre=${centre}&date=${encodeURIComponent(date)}`
      const json = await apiClient.get(`${apiPaths.admin.places}?${queryString}`, {
        headers: getHeadersForAdminJson(),
      })
      return json
    },

    async updateInspecteurForResa (departement, placeId, inspecteur) {
      const json = await apiClient.patch(`${apiPaths.admin.places}/${placeId}`, {
        headers: getHeadersForAdminJson(),
        body: JSON.stringify({ departement, inspecteur }),
      })
      return json
    },

    async deletePlacesInspecteur (placesToDelete) {
      const json = await apiClient
        .delete(`${apiPaths.admin.places}`, {
          headers: getHeadersForAdminJson(),
          body: JSON.stringify({ placesToDelete }),
        })
      return json
    },

    async assignCandidatToPlace (placeId, candidatId, departement) {
      const json = await apiClient.patch(`${apiPaths.admin.places}/${placeId}`, {
        headers: getHeadersForAdminJson(),
        body: JSON.stringify({ candidatId, departement }),
      })
      return json
    },

    async generateBordereaux (departement, date, isForInspecteurs) {
      const json = await apiClient.post(`${apiPaths.admin.generateBordereaux}`, {
        headers: getHeadersForAdminJson(),
        body: JSON.stringify({ departement, date, isForInspecteurs }),
      })
      return json
    },
  },

  util: {
    async searchAdresses (query) {
      const json = await apiClient.get(apiPaths.util.adressesQuery(query), {
        headers: {},
      })
      return json
    },
  },
}
