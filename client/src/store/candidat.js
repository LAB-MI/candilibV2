import api from '@/api'

import { SHOW_ERROR } from '@/store'
import {
  EMAIL_VALIDATION_IS_PENDING_TITLE,
  EMAIL_VALIDATION_IS_PENDING,
  EMAIL_VALIDATION_IN_PROGRESS_TITLE,
  EMAIL_VALIDATION_IN_PROGRESS,
  EMAIL_VALIDATION_CHECKED_TITLE,
  DEFAULT_MESSAGE_TYPE,
  INFO_MESSAGE_TYPE,
  SUCCESS_MESSAGE_TYPE,
  ERROR_MESSAGE_TYPE,
} from '@/constants'
import { SHOW_SUCCESS } from './message'

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

export const SET_SHOW_EVALUATION = 'SET_SHOW_EVALUATION'

export const SEND_EVALUATION_REQUEST = 'SEND_EVALUATION_REQUEST'
export const SEND_EVALUATION_FAILURE = 'SEND_EVALUATION_FAILURE'
export const SEND_EVALUATION_SUCCESS = 'SEND_EVALUATION_SUCCESS'

export default {
  state: {
    displayNavDrawer: false,
    isCheckingEmail: false,
    isSendingEvaluation: false,
    isFetchingProfile: false,
    isSendingMagicLink: false,
    isSendingPresignup: false,
    me: undefined,
    message: '',
    messageTitle: '',
    messageType: undefined,
    showEvaluation: false,
  },

  mutations: {
    [SET_MESSAGE] (state, { messageTitle, message, messageType }) {
      state.messageTitle = messageTitle
      state.message = message
      state.messageType = messageType || DEFAULT_MESSAGE_TYPE
    },

    [DISPLAY_NAV_DRAWER] (state, bool) {
      state.displayNavDrawer = bool
    },

    [CHECK_TOKEN_FOR_EMAIL_VALIDATION_REQUEST] (state) {
      state.isCheckingEmail = true
      state.messageTitle = EMAIL_VALIDATION_IN_PROGRESS_TITLE
      state.message = EMAIL_VALIDATION_IN_PROGRESS
      state.messageType = DEFAULT_MESSAGE_TYPE
    },
    [CHECK_TOKEN_FOR_EMAIL_VALIDATION_SUCCESS] (state, response) {
      state.messageTitle = response.messageTitle || EMAIL_VALIDATION_CHECKED_TITLE
      state.message = response.message
      state.messageType = SUCCESS_MESSAGE_TYPE
      state.isCheckingEmail = false
    },
    [CHECK_TOKEN_FOR_EMAIL_VALIDATION_FAILURE] (state) {
      state.isCheckingEmail = false
    },

    [PRESIGNUP_REQUEST] (state) {
      state.isSendingPresignup = true
    },
    [PRESIGNUP_SUCCESS] (state, candidat) {
      state.isSendingPresignup = false
      state.messageTitle = EMAIL_VALIDATION_IS_PENDING_TITLE
      state.message = EMAIL_VALIDATION_IS_PENDING
      state.messageType = INFO_MESSAGE_TYPE
    },
    [PRESIGNUP_FAILURE] (state) {
      state.isSendingPresignup = false
    },

    [SEND_MAGIC_LINK_REQUEST] (state) {
      state.isSendingMagicLink = true
    },
    [SEND_MAGIC_LINK_SUCCESS] (state, candidat) {
      state.isSendingMagicLink = false
    },
    [SEND_MAGIC_LINK_FAILURE] (state) {
      state.isSendingMagicLink = false
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

    [SET_SHOW_EVALUATION] (state, showEvaluation) {
      state.showEvaluation = showEvaluation
    },

    [SEND_EVALUATION_REQUEST] (state) {
      state.isSendingEvaluation = true
    },
    [SEND_EVALUATION_FAILURE] (state) {
      state.isSendingEvaluation = false
    },
    [SEND_EVALUATION_SUCCESS] (state) {
      state.isSendingEvaluation = false
      state.me.isEvaluationDone = true
      state.showEvaluation = false
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
        commit(SET_MESSAGE, { messageTitle: 'Un problème est survenu', message: error.message, messageType: ERROR_MESSAGE_TYPE })
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

    async [FETCH_MY_PROFILE_REQUEST] ({ commit, dispatch, state }) {
      if (state.candidat && state.candidat.isFetchingProfile) {
        return
      }
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

    async [SET_SHOW_EVALUATION] ({ commit }, showEvaluation) {
      commit(SET_SHOW_EVALUATION, showEvaluation)
    },

    async [SEND_EVALUATION_REQUEST] ({ commit, dispatch }, evaluation) {
      try {
        const response = await api.candidat.sendEvaluation(evaluation)
        if (response.success === false) {
          throw new Error('Impossible d\'enregistrer votre évaluation')
        }
        commit(SEND_EVALUATION_SUCCESS)
        dispatch(SHOW_SUCCESS, 'Merci d\'avoir évalué l\'application !')
      } catch (error) {
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

  },
}
