import { CANDIDAT_TOKEN_STORAGE_KEY } from '../constants'

import apiPaths from './api-paths'
import apiClient from './api-utils'

const getHeadersForJson = () => {
  const token = localStorage.getItem(CANDIDAT_TOKEN_STORAGE_KEY)
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

const apiCandidat = {
  async verifyToken (token, isTokenFromMagicLink) {
    const options = {
      headers: {
        'x-magic-link': isTokenFromMagicLink,
      },
    }
    const json = await apiClient.get(
        `${apiPaths.candidat.verifyToken}?token=${token}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        },
    )
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

  async getCentre (centreId) {
    const queryString = `centreId=${centreId}`
    const json = await apiClient.get(
        `${apiPaths.candidat.centres}?${queryString}`,
        {
          headers: getHeadersForJson(),
        },
    )
    return json
  },

  async getCentres (departement, end) {
    const queryString = `departement=${departement}&end=${encodeURIComponent(
        end,
      )}`
    const json = await apiClient.get(
        `${apiPaths.candidat.centres}?${queryString}`,
        {
          headers: getHeadersForJson(),
        },
    )
    return json
  },

  async getConfig () {
    const json = await apiClient.get(`${apiPaths.candidat.config}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return json
  },

  async getPlaces (centreId, begin, end) {
    const queryString = `begin=${encodeURIComponent(
        begin,
      )}&end=${encodeURIComponent(end)}`
    const json = await apiClient.get(
        `${apiPaths.candidat.places}/${centreId}?${queryString}`,
        {
          headers: getHeadersForJson(),
        },
    )
    return json
  },

  async checkPlacesAvailability (centreId, date) {
    const queryString = `dateTime=${encodeURIComponent(date)}`
    const json = await apiClient.get(
        `${apiPaths.candidat.places}/${centreId}?${queryString}`,
        {
          headers: getHeadersForJson(),
        },
    )
    return json
  },

  async getReservations () {
    const json = await apiClient.get(`${apiPaths.candidat.places}`, {
      headers: getHeadersForJson(),
    })
    return json
  },

  async setReservations (centreId, date, isAccompanied, hasDualControlCar) {
    const json = await apiClient.patch(`${apiPaths.candidat.places}`, {
      body: JSON.stringify({
        id: centreId,
        date,
        isAccompanied,
        hasDualControlCar,
      }),
      headers: getHeadersForJson(),
    })
    return json
  },

  async sendEmail () {
    const json = await apiClient.get(
        `${apiPaths.candidat.places}?byMail=${true}`,
        {
          headers: getHeadersForJson(),
        },
    )
    return json
  },

  async deleteReservation () {
    const json = await apiClient.delete(`${apiPaths.candidat.places}`, {
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

  async getActiveGeoDepartementsInfos () {
    const json = await apiClient.get(`${apiPaths.candidat.departements}`, {
      headers: getHeadersForJson(),
    })
    return json
  },
}

export default apiCandidat
