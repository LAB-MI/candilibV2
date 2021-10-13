import { v4 as uuid } from 'uuid'
import { version } from '../../package.json'
import { CANDIDAT_TOKEN_STORAGE_KEY } from '../constants'

import apiPaths from './api-paths'
import apiClient, { xuserid } from './api-utils'
const clientid = `${uuid()}.${version || 'DEV'}.${process.env.clientid || ''}`

const getHeadersClientId = () => {
  const headers = {
    'X-REQUEST-ID': uuid(),
  }
  if (clientid) {
    headers['X-CLIENT-ID'] = clientid
  }
  return headers
}

const getHeadersForJson = () => {
  const token = localStorage.getItem(CANDIDAT_TOKEN_STORAGE_KEY)
  const Authorization = token ? `Bearer ${token}` : undefined

  const headers = {
    'Content-Type': 'application/json',
    'X-USER-ID': xuserid,
    ...getHeadersClientId(),
  }

  if (Authorization) { headers.Authorization = Authorization }

  return headers
}

const apiCandidat = {
  async verifyToken (token, isTokenFromMagicLink) {
    const options = {
      headers: {
        'x-magic-link': isTokenFromMagicLink,
        ...getHeadersClientId(),
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
        ...getHeadersClientId(),
      },
      body: JSON.stringify(candidat),
    })
    return json
  },

  async sendMagicLink (email) {
    const json = await apiClient.post(apiPaths.candidat.magicLink, {
      headers: {
        'Content-Type': 'application/json',
        ...getHeadersClientId(),
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
        ...getHeadersClientId(),
      },
    })
    return json
  },

  async getPlaces (geoDepartement, nomCentre, begin, end) {
    const queryString = `begin=${encodeURIComponent(
        begin,
        )}&end=${encodeURIComponent(end)}&geoDepartement=${geoDepartement}&nomCentre=${nomCentre}`
    const json = await apiClient.get(
      `${apiPaths.candidat.places}?${queryString}`,
      {
        headers: getHeadersForJson(),
      },
    )
    return json
  },

  async checkPlacesAvailability (centreId, nomCentre, date, geoDepartement) {
    const queryDate = `dateTime=${encodeURIComponent(date)}`
    const queryGeoDepartement = `geoDepartement=${geoDepartement}`
    const queryNomCentre = `nomCentre=${nomCentre}`
    const fullQuery = centreId
      ? `/${centreId}?${queryDate}` : `?${queryDate}&${queryNomCentre}&${queryGeoDepartement}`
    const json = await apiClient.get(
      `${apiPaths.candidat.places}${fullQuery}`,
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

  async setReservations (nomCentre, geoDepartement, date, isAccompanied, hasDualControlCar, isModification, captchaResponse) {
    const json = await apiClient.patch(`${apiPaths.candidat.places}`, {
      body: JSON.stringify({
        nomCentre,
        geoDepartement,
        date,
        isAccompanied,
        hasDualControlCar,
        isModification,
        ...captchaResponse,
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

  async sendContactUs (candidat, subject, message, hadSignUp) {
    const json = await apiClient.post(`${apiPaths.candidat.contactUs}`, {
      headers: getHeadersForJson(),
      body: JSON.stringify({
        candidat, subject, message, hadSignUp,
      }),
    })
    return json
  },

  async getImage (index, { geoDepartement, nomCentre, date }) {
    const queryDate = `dateTime=${encodeURIComponent(date)}`
    const queryGeoDepartement = `geoDepartement=${geoDepartement}`
    const queryNomCentre = `nomCentre=${nomCentre}`
    const fullQuery = `?${queryDate}&${queryNomCentre}&${queryGeoDepartement}`
    const json = await apiClient.getRaw(`${apiPaths.candidat.captcha}/image/${index}${fullQuery}`, {
      headers: getHeadersForJson(),
    })
    return json
  },

  async startRoute () {
    const json = await apiClient.get(`${apiPaths.candidat.captcha}/start`, {
      headers: getHeadersForJson(),
    })
    return json
  },

  async trySubmission (imageField) {
    const json = await apiClient.post(`${apiPaths.candidat.captcha}/try`, {
      headers: getHeadersForJson(),
      body: JSON.stringify(imageField),
    })
    return json
  },
}

export default apiCandidat
