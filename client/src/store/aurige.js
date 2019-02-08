export const SHOW_AURIGE_RESULT = 'SHOW_AURIGE_RESULT'

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
  },
}
