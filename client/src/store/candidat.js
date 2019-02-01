import api from '@/api'

import { SHOW_ERROR } from '@/store'

export const PRESIGNUP_REQUEST = 'PRESIGNUP_REQUEST'
export const PRESIGNUP_FAILURE = 'PRESIGNUP_FAILURE'
export const PRESIGNUP_SUCCESS = 'PRESIGNUP_SUCCESS'

export const SEND_MAGIC_LINK_REQUEST = 'SEND_MAGIC_LINK_REQUEST'
export const SEND_MAGIC_LINK_FAILURE = 'SEND_MAGIC_LINK_FAILURE'
export const SEND_MAGIC_LINK_SUCCESS = 'SEND_MAGIC_LINK_SUCCESS'

export default {
  state: {
    isSending: false,
    isSendingMail: false,
    isMailSent: true,
    me: undefined,
  },

  mutations: {
    [PRESIGNUP_REQUEST] (state) {
      state.isSending = true
    },
    [PRESIGNUP_SUCCESS] (state, candidat) {
      state.isSending = false
      state.me = candidat
    },
    [PRESIGNUP_FAILURE] (state) {
      state.isSending = false
    },

    [SEND_MAGIC_LINK_REQUEST] (state) {
      state.isSendingMail = true
    },
    [SEND_MAGIC_LINK_SUCCESS] (state, candidat) {
      state.isSendingMail = false
      state.me = candidat
    },
    [SEND_MAGIC_LINK_FAILURE] (state) {
      state.isSendingMail = false
    },
  },

  actions: {
    async [PRESIGNUP_REQUEST] ({ commit, dispatch }, candidatData) {
      commit(PRESIGNUP_REQUEST)
      try {
        const response = await api.candidat.presignup(candidatData)
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(PRESIGNUP_SUCCESS, response)
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
  },
}
