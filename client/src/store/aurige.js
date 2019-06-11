import api from '@/api'

import { SHOW_SUCCESS, SHOW_ERROR, FETCH_CANDIDATS_REQUEST } from '@/store'

export const SHOW_AURIGE_RESULT = 'SHOW_AURIGE_RESULT'
export const AURIGE_UPLOAD_CANDIDATS_REQUEST = 'AURIGE_UPLOAD_CANDIDATS_REQUEST'
export const AURIGE_UPLOAD_CANDIDATS_SUCCESS = 'AURIGE_UPLOAD_CANDIDATS_SUCCESS'
export const AURIGE_UPLOAD_CANDIDATS_FAILURE = 'AURIGE_UPLOAD_CANDIDATS_FAILURE'
const SET_LAST_FILE = 'SET_LAST_FILE'

export default {
  state: {
    isLoading: false,
    candidats: [],
    lastFile: undefined,
  },
  mutations: {
    [SET_LAST_FILE] (state, file) {
      state.lastFile = file
    },
    [AURIGE_UPLOAD_CANDIDATS_REQUEST] (state) {
      state.isLoading = true
    },
    [AURIGE_UPLOAD_CANDIDATS_SUCCESS] (state, candidats) {
      state.isLoading = false
      state.candidats = candidats
    },
    [AURIGE_UPLOAD_CANDIDATS_FAILURE] (state) {
      state.isLoading = false
    },

  },
  actions: {
    async [AURIGE_UPLOAD_CANDIDATS_REQUEST] ({ commit, dispatch }, file) {
      commit(AURIGE_UPLOAD_CANDIDATS_REQUEST)
      const data = new FormData()
      data.append('file', file)

      try {
        const result = await api.admin.uploadCandidatsJson(data)
        if (result.success === false) {
          throw new Error(result.message)
        }
        commit(AURIGE_UPLOAD_CANDIDATS_SUCCESS, result.candidats)
        commit(SET_LAST_FILE, undefined)
        dispatch(SHOW_SUCCESS, result.message)
        dispatch(FETCH_CANDIDATS_REQUEST)
      } catch (error) {
        commit(AURIGE_UPLOAD_CANDIDATS_FAILURE)
        commit(SET_LAST_FILE, file)
        dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
