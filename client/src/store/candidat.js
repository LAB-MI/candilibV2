import api from '@/api'

import { SHOW_ERROR } from '@/store'

export const DISPLAY_NAV_DRAWER = 'DISPLAY_NAV_DRAWER'
export const SET_MESSAGE = 'SET_MESSAGE'

export const CHECK_TOKEN_FOR_EMAIL_VALIDATION_REQUEST = 'CHECK_TOKEN_FOR_EMAIL_VALIDATION_REQUEST'
export const CHECK_TOKEN_FOR_EMAIL_VALIDATION_FAILURE = 'CHECK_TOKEN_FOR_EMAIL_VALIDATION_FAILURE'
export const CHECK_TOKEN_FOR_EMAIL_VALIDATION_SUCCESS = 'CHECK_TOKEN_FOR_EMAIL_VALIDATION_SUCCESS'

export const PRESIGNUP_REQUEST = 'PRESIGNUP_REQUEST'
export const PRESIGNUP_FAILURE = 'PRESIGNUP_FAILURE'
export const PRESIGNUP_SUCCESS = 'PRESIGNUP_SUCCESS'

export const SEND_MAGIC_LINK_REQUEST = 'SEND_MAGIC_LINK_REQUEST'
export const SEND_MAGIC_LINK_FAILURE = 'SEND_MAGIC_LINK_FAILURE'
export const SEND_MAGIC_LINK_SUCCESS = 'SEND_MAGIC_LINK_SUCCESS'

export const FETCH_MY_PROFILE_REQUEST = 'FETCH_MY_PROFILE_REQUEST'
export const FETCH_MY_PROFILE_FAILURE = 'FETCH_MY_PROFILE_FAILURE'
export const FETCH_MY_PROFILE_SUCCESS = 'FETCH_MY_PROFILE_SUCCESS'

const EMAIL_VALIDATION_IN_PROGRESS = 'Veuillez patienter pendant la validation de votre adresse courriel...'
const EMAIL_VALIDATION_IS_PENDING = `Vous allez bientôt recevoir un courriel à l'adresse que vous nous avez indiqué.
        Veuillez consulter votre boîte, et valider votre adresse courriel en cliquant sur le lien indiqué dans le message.`

const INFO_MESSAGE_TYPE = 'info'
const DEFAULT_MESSAGE_TYPE = INFO_MESSAGE_TYPE
const ERROR_MESSAGE_TYPE = 'error'
const SUCCESS_MESSAGE_TYPE = 'success'

export default {
  state: {
    isCheckingEmail: false,
    isSending: false,
    isSendingMail: false,
    isFetchingProfile: false,
    me: undefined,
    displayNavDrawer: false,
    message: '',
    messageType: undefined,
  },

  mutations: {
    [SET_MESSAGE] (state, { message, messageType }) {
      state.message = message
      state.messageType = messageType || DEFAULT_MESSAGE_TYPE
    },

    [DISPLAY_NAV_DRAWER] (state, bool) {
      state.displayNavDrawer = bool
    },

    [CHECK_TOKEN_FOR_EMAIL_VALIDATION_REQUEST] (state) {
      state.isCheckingEmail = true
      state.message = EMAIL_VALIDATION_IN_PROGRESS
      state.messageType = DEFAULT_MESSAGE_TYPE
    },
    [CHECK_TOKEN_FOR_EMAIL_VALIDATION_SUCCESS] (state, candidat) {
      state.isCheckingEmail = false
    },
    [CHECK_TOKEN_FOR_EMAIL_VALIDATION_FAILURE] (state) {
      state.isCheckingEmail = false
    },

    [PRESIGNUP_REQUEST] (state) {
      state.isSending = true
    },
    [PRESIGNUP_SUCCESS] (state, candidat) {
      state.isSending = false
      state.message = EMAIL_VALIDATION_IS_PENDING
      state.messageType = DEFAULT_MESSAGE_TYPE
    },
    [PRESIGNUP_FAILURE] (state) {
      state.isSending = false
    },

    [SEND_MAGIC_LINK_REQUEST] (state) {
      state.isSendingMail = true
    },
    [SEND_MAGIC_LINK_SUCCESS] (state, candidat) {
      state.isSendingMail = false
    },
    [SEND_MAGIC_LINK_FAILURE] (state) {
      state.isSendingMail = false
    },

    [FETCH_MY_PROFILE_REQUEST] (state) {
      state.isFetchingProfile = true
    },
    [FETCH_MY_PROFILE_SUCCESS] (state, candidat) {
      state.isFetchingProfile = false
      state.me = candidat
    },
    [FETCH_MY_PROFILE_FAILURE] (state) {
      state.isFetchingProfile = false
    },
  },

  actions: {
    async [DISPLAY_NAV_DRAWER] ({ commit }, bool) {
      commit(DISPLAY_NAV_DRAWER, bool)
    },

    async [CHECK_TOKEN_FOR_EMAIL_VALIDATION_REQUEST] ({ commit, dispatch }, { email, hash }) {
      commit(CHECK_TOKEN_FOR_EMAIL_VALIDATION_REQUEST)
      try {
        const response = await api.candidat.validateEmail(email, hash)
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(SET_MESSAGE, { message: response.message, messageType: SUCCESS_MESSAGE_TYPE })
        commit(CHECK_TOKEN_FOR_EMAIL_VALIDATION_SUCCESS, response)
      } catch (error) {
        commit(CHECK_TOKEN_FOR_EMAIL_VALIDATION_FAILURE)
        commit(SET_MESSAGE, { message: error.message, messageType: ERROR_MESSAGE_TYPE })
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async [PRESIGNUP_REQUEST] ({ commit, dispatch }, candidatData) {
      commit(PRESIGNUP_REQUEST)
      try {
        const response = await api.candidat.presignup(candidatData)
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(PRESIGNUP_SUCCESS, response)
        return response
      } catch (error) {
        commit(PRESIGNUP_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async [SEND_MAGIC_LINK_REQUEST] ({ commit, dispatch }, email) {
      commit(SEND_MAGIC_LINK_REQUEST)
      try {
        const response = await api.candidat.sendMagicLink(email)
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(SEND_MAGIC_LINK_SUCCESS, email)
      } catch (error) {
        commit(SEND_MAGIC_LINK_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async [FETCH_MY_PROFILE_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_MY_PROFILE_REQUEST)
      try {
        const response = await api.candidat.getMyProfile()
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(FETCH_MY_PROFILE_SUCCESS, response.candidat)
      } catch (error) {
        commit(FETCH_MY_PROFILE_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },
  },
}
