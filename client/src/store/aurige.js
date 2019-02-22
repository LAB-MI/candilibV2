import api from '@/api'

import { SHOW_SUCCESS, SHOW_ERROR } from '@/store'

export const SHOW_AURIGE_RESULT = 'SHOW_AURIGE_RESULT'
export const AURIGE_UPLOAD_CANDIDATS = 'AURIGE_UPLOAD_CANDIDATS'

export default {
  state: {
    candidats: [],
  },
  mutations: {
    [SHOW_AURIGE_RESULT] (state, candidats) {
      state.candidats = candidats
    },
  },
  actions: {
    async [SHOW_AURIGE_RESULT] ({ commit }, result) {
      const { candidats } = result
      commit(SHOW_AURIGE_RESULT, candidats)
    },
    async [AURIGE_UPLOAD_CANDIDATS] ({ commit, dispatch, state }, file) {
      const data = new FormData()
      data.append('file', file)
      try {
        const result = await api.admin.uploadCandidatsJson(data)
        if (result.success === false) {
          throw new Error(result.message)
        }
        commit(SHOW_AURIGE_RESULT, result)
        dispatch(SHOW_SUCCESS, result.message)
      } catch (error) {
        dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
