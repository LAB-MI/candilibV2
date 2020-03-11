import api from '@/api'
import { SHOW_ERROR, SHOW_SUCCESS } from '@/store'
import { getFrenchDateTimeFromIso } from '../util/frenchDateTime'

export const SHOW_AURIGE_RESULT = 'SHOW_AURIGE_RESULT'
export const AURIGE_UPLOAD_CANDIDATS_REQUEST = 'AURIGE_UPLOAD_CANDIDATS_REQUEST'
export const AURIGE_UPLOAD_CANDIDATS_SUCCESS = 'AURIGE_UPLOAD_CANDIDATS_SUCCESS'
export const AURIGE_UPLOAD_CANDIDATS_FAILURE = 'AURIGE_UPLOAD_CANDIDATS_FAILURE'

export const FETCH_AURIGE_LAST_DATETIME_REQUEST = 'FETCH_AURIGE_LAST_DATETIME_REQUEST'
export const FETCH_AURIGE_LAST_DATETIME_SUCCESS = 'FETCH_AURIGE_LAST_DATETIME_SUCCESS'
export const FETCH_AURIGE_LAST_DATETIME_FAILURE = 'FETCH_AURIGE_LAST_DATETIME_FAILURE'

export const SET_AURIGE_FEED_BACK = 'SET_AURIGE_FEED_BACK'

export default {
  state: {
    isLoading: false,
    candidats: [],
    feedBack: [],
    lastSyncDateTime: 'La date du dernier batch Aurige n\'est pas encore renseigné',
    isLastSyncDateTimeLoading: false,
  },
  mutations: {
    [SET_AURIGE_FEED_BACK] (state, feedBack) {
      state.candidats = feedBack
    },
    [AURIGE_UPLOAD_CANDIDATS_REQUEST] (state) {
      state.isLoading = true
    },
    [AURIGE_UPLOAD_CANDIDATS_SUCCESS] (state, candidats) {
      state.isLoading = false
      state.feedBack = candidats
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
    async [AURIGE_UPLOAD_CANDIDATS_REQUEST] ({ commit, dispatch, state }, file) {
      commit(AURIGE_UPLOAD_CANDIDATS_REQUEST)
      const data = new FormData()
      data.append('file', file)

      try {
        const result = await api.admin.uploadCandidatsJson(data)
        if (result.success === false) {
          throw new Error(result.message)
        }
        commit(AURIGE_UPLOAD_CANDIDATS_SUCCESS, result.candidats)
      } catch (error) {
        commit(AURIGE_UPLOAD_CANDIDATS_FAILURE)
        throw new Error(error.message)
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

    async [SET_AURIGE_FEED_BACK] ({ commit, dispatch }, feedBack) {
      commit(SET_AURIGE_FEED_BACK, feedBack.success)
      if (feedBack && feedBack.errors.length) {
        dispatch(SHOW_ERROR, 'Une ou plusieurs erreurs on été détecté sur le formatage du fichier .json merci de vérifier son contenu.')
        return
      }
      if (feedBack.success.length) {
        dispatch(SHOW_SUCCESS, 'Le fichier a bien été synchronisé.')
        return
      }
      dispatch(SHOW_ERROR, 'La synchro c\'est bien déroulé cependant il semblerais que aucun candidats n\'est été mis à jours.')
    },
  },
}
