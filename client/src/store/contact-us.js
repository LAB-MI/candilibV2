import api from '@/api'
import {
  SHOW_SUCCESS,
  SHOW_ERROR,
} from '@/store'

export const FETCH_SEND_CONTACT_US_REQUEST = 'FETCH_SEND_CONTACT_US_REQUEST'
export const FETCH_SEND_CONTACT_US_SUCCESS = 'FETCH_SEND_CONTACT_US_SUCCESS'
export const FETCH_SEND_CONTACT_US_FAILED = 'FETCH_SEND_CONTACT_US_FAILED'

export default {
  state: {
    isFetching: false,
  },
  mutations: {
    [FETCH_SEND_CONTACT_US_REQUEST] (state) {
      state.isFetching = true
    },
    [FETCH_SEND_CONTACT_US_SUCCESS] (state) {
      state.isFetching = false
    },
    [FETCH_SEND_CONTACT_US_FAILED]  (state) {
      state.isFetching = false
    },
  },
  actions: {
    async [FETCH_SEND_CONTACT_US_REQUEST] ({ commit, dispatch }, { candidat, subject, message, hadSignup }) {
      commit(FETCH_SEND_CONTACT_US_REQUEST)
      try {
        const result = await api.candidat.sendContactUs(candidat, subject, message, hadSignup)
        if (result.success === false) {
          throw new Error("Désolé, votre demande n'a pas pu être envoyé. Veuillez réessayer plus tard.")
        }
        commit(FETCH_SEND_CONTACT_US_SUCCESS)
        dispatch(SHOW_SUCCESS, 'Votre demande a été envoyé.')
      } catch (error) {
        commit(FETCH_SEND_CONTACT_US_FAILED)
        dispatch(SHOW_ERROR, error.message)
        throw (error)
      }
    },
  },
}
