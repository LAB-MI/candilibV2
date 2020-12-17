import api from '@/api'

export const FETCH_INFOS_BORNE_STATUS_REQUEST = 'FETCH_INFOS_BORNE_STATUS_REQUEST'
export const FETCH_INFOS_BORNE_STATUS_SUCCESS = 'FETCH_INFOS_BORNE_STATUS_SUCCESS'
export const FETCH_INFOS_BORNE_STATUS_FAILURE = 'FETCH_INFOS_BORNE_STATUS_FAILURE'

export default {
  state: {
    infos: [],
    isFetchingInfosBorneStatus: false,
  },
  mutations: {
    [FETCH_INFOS_BORNE_STATUS_REQUEST] (state) {
      state.isFetchingInfosBorneStatus = true
    },
    [FETCH_INFOS_BORNE_STATUS_SUCCESS] (state, infosBorneStatus) {
      state.isFetchingInfosBorneStatus = false
      state.infos = infosBorneStatus
    },
    [FETCH_INFOS_BORNE_STATUS_FAILURE] (state) {
      state.isFetchingInfosBorneStatus = false
    },
  },
  actions: {
    async [FETCH_INFOS_BORNE_STATUS_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_INFOS_BORNE_STATUS_REQUEST)
      try {
        const { success, borneStatusInfos, message } = await api.admin.getLastInfosStatusCandidat()
        if (success === false) {
          throw new Error(message)
        }

        const { infosBorneStatus, date } = borneStatusInfos
        commit(FETCH_INFOS_BORNE_STATUS_SUCCESS, { borneByStatus: infosBorneStatus, date })
      } catch (error) {
        commit(FETCH_INFOS_BORNE_STATUS_FAILURE)
      }
    },
  },
}
