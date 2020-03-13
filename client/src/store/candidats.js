import api from '@/api'

import { SHOW_ERROR } from '@/store'

export const FETCH_CANDIDAT_REQUEST = 'FETCH_CANDIDAT_REQUEST'
export const FETCH_CANDIDAT_FAILURE = 'FETCH_CANDIDAT_FAILURE'
export const FETCH_CANDIDAT_SUCCESS = 'FETCH_CANDIDAT_SUCCESS'

export const FETCH_TOOLTIP_CANDIDAT_REQUEST = 'FETCH_TOOLTIP_CANDIDAT_REQUEST'
export const FETCH_TOOLTIP_CANDIDAT_FAILURE = 'FETCH_TOOLTIP_CANDIDAT_FAILURE'
export const FETCH_TOOLTIP_CANDIDAT_SUCCESS = 'FETCH_TOOLTIP_CANDIDAT_SUCCESS'

export const FETCH_CANDIDATS_REQUEST = 'FETCH_CANDIDATS_REQUEST'
export const FETCH_CANDIDATS_FAILURE = 'FETCH_CANDIDATS_FAILURE'
export const FETCH_CANDIDATS_SUCCESS = 'FETCH_CANDIDATS_SUCCESS'

export const RESET_CANDIDAT = 'RESET_CANDIDAT'

export default {
  state: {
    isFetching: false,
    isFetchingTooltip: false,
    isFetchingList: false,
    list: [],
    candidat: undefined,
    tooltipCandidat: undefined,
  },

  mutations: {
    [FETCH_CANDIDAT_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_CANDIDAT_SUCCESS] (state, candidat) {
      state.isFetching = false
      state.candidat = candidat
    },
    [FETCH_CANDIDAT_FAILURE] (state) {
      state.candidat = undefined
      state.isFetching = false
    },

    [FETCH_TOOLTIP_CANDIDAT_REQUEST] (state) {
      state.tooltipCandidat = undefined
      state.isFetchingTooltip = true
    },
    [FETCH_TOOLTIP_CANDIDAT_SUCCESS] (state, candidat) {
      state.isFetchingTooltip = false
      state.tooltipCandidat = candidat
    },
    [FETCH_TOOLTIP_CANDIDAT_FAILURE] (state) {
      state.tooltipCandidat = undefined
      state.isFetchingTooltip = false
    },

    [FETCH_CANDIDATS_REQUEST] (state) {
      state.isFetchingList = true
    },
    [FETCH_CANDIDATS_SUCCESS] (state, list) {
      state.isFetchingList = false
      state.list = list
    },
    [FETCH_CANDIDATS_FAILURE] (state) {
      state.isFetchingList = false
    },

    [RESET_CANDIDAT] (state) {
      state.candidat = undefined
    },
  },

  actions: {
    async [FETCH_CANDIDAT_REQUEST] ({ commit, dispatch }, { candidatId, departement }) {
      commit(FETCH_CANDIDAT_REQUEST)
      try {
        const { candidat } = await api.admin.getCandidats(candidatId, departement)
        commit(FETCH_CANDIDAT_SUCCESS, candidat)
      } catch (error) {
        commit(FETCH_CANDIDAT_FAILURE)
        return dispatch(SHOW_ERROR, 'Error while fetching candidat')
      }
    },

    async [FETCH_TOOLTIP_CANDIDAT_REQUEST] ({ commit, dispatch }, { candidatId, departement }) {
      commit(FETCH_TOOLTIP_CANDIDAT_REQUEST)
      try {
        const { candidat } = await api.admin.getCandidats(candidatId, departement)
        commit(FETCH_TOOLTIP_CANDIDAT_SUCCESS, candidat)
      } catch (error) {
        commit(FETCH_TOOLTIP_CANDIDAT_FAILURE)
        return dispatch(SHOW_ERROR, 'Error while fetching candidat')
      }
    },

    async [FETCH_CANDIDATS_REQUEST] ({ commit, dispatch }, { since, until, departement } = {}) {
      commit(FETCH_CANDIDATS_REQUEST)
      try {
        const list = await api.admin.getCandidats({ since, until }, departement)
        if (list.success === false) {
          const error = new Error(list.message || 'Error while fetching candidats')
          if (list.isTokenInvalid) {
            error.message = 'Vous devez être connecté'
          }
          throw error
        }
        commit(FETCH_CANDIDATS_SUCCESS, list)
      } catch (error) {
        commit(FETCH_CANDIDATS_FAILURE)
        return dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
