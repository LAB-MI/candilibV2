import api from '@/api'

export const FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST = 'FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST'
export const FETCH_AUTOCOMPLETE_CANDIDATS_SUCCESS = 'FETCH_AUTOCOMPLETE_CANDIDATS_SUCCESS'
export const FETCH_AUTOCOMPLETE_CANDIDATS_FAILURE = 'FETCH_AUTOCOMPLETE_CANDIDATS_FAILURE'

export const FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST = 'FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST'
export const FETCH_AUTOCOMPLETE_INSPECTEURS_SUCCESS = 'FETCH_AUTOCOMPLETE_INSPECTEURS_SUCCESS'
export const FETCH_AUTOCOMPLETE_INSPECTEURS_FAILURE = 'FETCH_AUTOCOMPLETE_INSPECTEURS_FAILURE'

export default {
  state: {
    candidats: {
      isFetching: false,
      list: [],
      error: undefined,
    },

    inspecteurs: {
      isFetching: false,
      list: [],
      error: undefined,
    },
  },

  mutations: {
    FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST (state) {
      state.candidats.isFetching = true
      state.candidats.error = undefined
    },
    FETCH_AUTOCOMPLETE_CANDIDATS_SUCCESS (state, list) {
      state.candidats.isFetching = false
      state.candidats.list = list
    },
    FETCH_AUTOCOMPLETE_CANDIDATS_FAILURE (state, error) {
      state.candidats.isFetching = false
      state.candidats.error = error
    },

    FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST (state) {
      state.inspecteurs.isFetching = true
      state.inspecteurs.error = undefined
    },
    FETCH_AUTOCOMPLETE_INSPECTEURS_SUCCESS (state, list) {
      state.inspecteurs.isFetching = false
      state.inspecteurs.list = list
    },
    FETCH_AUTOCOMPLETE_INSPECTEURS_FAILURE (state, error) {
      state.inspecteurs.isFetching = false
      state.inspecteurs.error = error
    },
  },

  actions: {
    async FETCH_AUTOCOMPLETE_CANDIDATS_REQUEST ({ state, commit, rootState }, search) {
      try {
        const list = await api.admin.searchCandidats(search, rootState.admin.departements.active || rootState.admin.departements.list[0])
        commit(FETCH_AUTOCOMPLETE_CANDIDATS_SUCCESS, list)
      } catch (error) {
        commit(FETCH_AUTOCOMPLETE_CANDIDATS_FAILURE, error)
      }
    },

    async FETCH_AUTOCOMPLETE_INSPECTEURS_REQUEST ({ state, commit, rootState }, search) {
      try {
        const list = await api.admin.searchInspecteurs(search, rootState.admin.departements.active || rootState.admin.departements.list[0])
        commit(FETCH_AUTOCOMPLETE_INSPECTEURS_SUCCESS, list)
      } catch (error) {
        commit(FETCH_AUTOCOMPLETE_INSPECTEURS_FAILURE, error)
      }
    },
  },
}
