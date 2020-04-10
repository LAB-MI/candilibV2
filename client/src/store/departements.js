import api from '@/api'
import {
  SHOW_ERROR,
} from '@/store'

export const FETCH_DEPARTEMENTS_REQUEST = 'FETCH_DEPARTEMENTS_REQUEST'
export const FETCH_DEPARTEMENTS_FAILURE = 'FETCH_DEPARTEMENTS_FAILURE'
export const FETCH_DEPARTEMENTS_SUCCESS = 'FETCH_DEPARTEMENTS_SUCCESS'

export const FETCH_DEPARTEMENTS_INFOS_REQUEST = 'FETCH_DEPARTEMENTS_INFOS_REQUEST'
export const FETCH_DEPARTEMENTS_INFOS_SUCCESS = 'FETCH_DEPARTEMENTS_INFOS_SUCCESS'
export const FETCH_DEPARTEMENTS_INFOS_FAILURE = 'FETCH_DEPARTEMENTS_INFOS_FAILURE'

export const CANDIDAT_SELECT_DEPARTEMENT = 'CANDIDAT_SELECT_DEPARTEMENT'

export default {
  state: {
    isFetchingDepartements: false,
    list: [],
    geoDepartementsInfos: [],
    isFetchingGeoDepartementsInfos: false,
    selectedDepartement: undefined,
  },

  mutations: {
    [FETCH_DEPARTEMENTS_REQUEST] (state) {
      state.isFetchingDepartements = true
    },
    [FETCH_DEPARTEMENTS_SUCCESS] (state, list) {
      state.list = list
      state.isFetchingDepartements = false
    },
    [FETCH_DEPARTEMENTS_FAILURE] (state) {
      state.isFetchingDepartements = false
    },

    [FETCH_DEPARTEMENTS_INFOS_REQUEST] (state) {
      state.isFetchingGeoDepartementsInfos = true
    },
    [FETCH_DEPARTEMENTS_INFOS_SUCCESS] (state, geoDepartementsInfos) {
      state.geoDepartementsInfos = geoDepartementsInfos
      state.isFetchingGeoDepartementsInfos = false
    },
    [FETCH_DEPARTEMENTS_INFOS_FAILURE] (state) {
      state.isFetchingGeoDepartementsInfos = false
    },

    [CANDIDAT_SELECT_DEPARTEMENT] (state, selectedDepartement) {
      state.selectedDepartement = selectedDepartement
    },
  },

  actions: {
    async [FETCH_DEPARTEMENTS_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_DEPARTEMENTS_REQUEST)

      try {
        const listFromApi = await api.public.getActiveDepartementsId()
        const list = listFromApi.departementsId
        commit(FETCH_DEPARTEMENTS_SUCCESS, list)
      } catch (error) {
        commit(FETCH_DEPARTEMENTS_FAILURE, error.message)
        dispatch(SHOW_ERROR, error.message)
      }
    },

    async [FETCH_DEPARTEMENTS_INFOS_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_DEPARTEMENTS_INFOS_REQUEST)

      try {
        const { success, message, geoDepartementsInfos } = await api.candidat.getActiveGeoDepartementsInfos()
        if (!success) {
          throw new Error(message)
        }
        commit(FETCH_DEPARTEMENTS_INFOS_SUCCESS, geoDepartementsInfos)
      } catch (error) {
        commit(FETCH_DEPARTEMENTS_INFOS_FAILURE, error.message)
        dispatch(SHOW_ERROR, error.message)
      }
    },

    async [CANDIDAT_SELECT_DEPARTEMENT] ({ commit, dispatch }, selectedDepartement) {
      commit(CANDIDAT_SELECT_DEPARTEMENT, selectedDepartement)
    },
  },
}
