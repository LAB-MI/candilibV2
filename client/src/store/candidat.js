import api from '@/api'

import { SHOW_ERROR } from '@/store'

export const PRESIGNUP_REQUEST = 'PRESIGNUP_REQUEST'
export const PRESIGNUP_FAILURE = 'PRESIGNUP_FAILURE'
export const PRESIGNUP_SUCCESS = 'PRESIGNUP_SUCCESS'

export default {
  state: {
    isSending: false,
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
  },

  actions: {
    async [PRESIGNUP_REQUEST] ({ commit, dispatch }, candidatData) {
      commit(PRESIGNUP_REQUEST)
      try {
        const candidat = await api.candidat.presignup(candidatData)
        commit(PRESIGNUP_SUCCESS, candidat)
      } catch (error) {
        commit(PRESIGNUP_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },
  },
}
