import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'
import { getFrenchDateTimeFromIso } from '../util/frenchDateTime'

export const SHOW_AURIGE_RESULT = 'SHOW_AURIGE_RESULT'
export const AURIGE_UPLOAD_CANDIDATS_REQUEST = 'AURIGE_UPLOAD_CANDIDATS_REQUEST'
export const AURIGE_UPLOAD_CANDIDATS_SUCCESS = 'AURIGE_UPLOAD_CANDIDATS_SUCCESS'
export const AURIGE_UPLOAD_CANDIDATS_FAILURE = 'AURIGE_UPLOAD_CANDIDATS_FAILURE'
const SET_LAST_FILE = 'SET_LAST_FILE'

export const FETCH_AURIGE_LAST_DATETIME_REQUEST = 'FETCH_AURIGE_LAST_DATETIME_REQUEST'
export const FETCH_AURIGE_LAST_DATETIME_SUCCESS = 'FETCH_AURIGE_LAST_DATETIME_SUCCESS'
export const FETCH_AURIGE_LAST_DATETIME_FAILURE = 'FETCH_AURIGE_LAST_DATETIME_FAILURE'

export default {
  state: {
    isLoading: false,
    candidats: [],
    lastFile: undefined,
    lastSyncDateTime: 'La date du dernier batch Aurige n\'est pas encore renseigné',
    isLastSyncDateTimeLoading: false,
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

    [FETCH_AURIGE_LAST_DATETIME_REQUEST] (state) {
      state.isLastSyncDateTimeLoading = true
    },
    [FETCH_AURIGE_LAST_DATETIME_SUCCESS] (state, lastDateTimeAurige) {
      state.isLastSyncDateTimeLoading = false
      state.lastSyncDateTime = lastDateTimeAurige
    },
    [FETCH_AURIGE_LAST_DATETIME_FAILURE] (state) {
      state.isLastSyncDateTimeLoading = false
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
      } catch (error) {
        commit(AURIGE_UPLOAD_CANDIDATS_FAILURE)
        commit(SET_LAST_FILE, file)
        dispatch(SHOW_ERROR, error.message)
      }
    },

    async [FETCH_AURIGE_LAST_DATETIME_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_AURIGE_LAST_DATETIME_REQUEST)
      try {
        const result = await api.admin.getLastSyncAurigeDateTime()
        if (result.success === false) {
          throw new Error(result.message)
        }

        commit(FETCH_AURIGE_LAST_DATETIME_SUCCESS, getFrenchDateTimeFromIso(result.aurigeInfo.date))
      } catch (error) {
        commit(FETCH_AURIGE_LAST_DATETIME_FAILURE)
      }
    },
  },
}
