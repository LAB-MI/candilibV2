import api from '@/api'

export const FETCH_CONFIG_REQUEST = 'FETCH_CONFIG_REQUEST'
export const FETCH_CONFIG_FAILURE = 'FETCH_CONFIG_FAILURE'
export const FETCH_CONFIG_SUCCESS = 'FETCH_CONFIG_SUCCESS'

export default {
  state: {
    lineDelay: 0,
  },

  mutations: {
    [FETCH_CONFIG_SUCCESS] (state, lineDelay) {
      state.lineDelay = lineDelay
    },
  },

  actions: {
    async [FETCH_CONFIG_REQUEST] ({ commit }) {
      const config = await api.public.getConfigCandidat()
      commit(FETCH_CONFIG_SUCCESS, config.lineDelay)
    },
  },
}
