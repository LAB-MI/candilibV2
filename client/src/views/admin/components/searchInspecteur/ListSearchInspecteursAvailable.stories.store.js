
import delay from 'delay'

const inspecteursList = {
  Centre1: {
    '2019-06-15':
        [
          {
            _id: 1,
            matricule: '012345678910',
            nom: 'Marie',
          },
          {
            _id: 2,
            matricule: '012345678911',
            nom: 'Sophie',
          },
          {
            _id: 3,
            matricule: '012345678912',
            nom: 'Paula',
          },
        ],
  },
}

export default {
  state: {
    inspecteurs: {
      isFetching: false,
      list: [],
    },
  },
  getters: {
    activeDepartement: state => {
      return '93'
    },
  },
  mutations: {
    FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST (state) {
      state.inspecteurs.isFetching = true
    },
    FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS (state, list) {
      state.inspecteurs.list = list
      state.inspecteurs.isFetching = false
    },
  },
  actions: {
    async FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST ({ commit }, { centre, date }) {
      commit('FETCH_GET_INSPECTEURS_AVAILABLE_REQUEST')
      console.log({ centre, date })
      await delay(1000)
      const list = inspecteursList[centre][date]
      commit('FETCH_GET_INSPECTEURS_AVAILABLE_SUCCESS', list)
    },
  },
}
