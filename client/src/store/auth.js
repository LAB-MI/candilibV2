import api from '@/api'
import { STORAGE_TOKEN_KEY } from '@/constants'

export const CHECK_ADMIN_TOKEN = 'CHECK_ADMIN_TOKEN'
export const CHECK_CANDIDAT_TOKEN = 'CHECK_CANDIDAT_TOKEN'

export const FETCH_TOKEN_REQUEST = 'FETCH_TOKEN_REQUEST'
export const FETCH_TOKEN_FAILURE = 'FETCH_TOKEN_FAILURE'
export const FETCH_TOKEN_SUCCESS = 'FETCH_TOKEN_SUCCESS'

export const REMOVE_TOKEN = 'REMOVE_TOKEN'
export const SET_ADMIN_TOKEN = 'SET_ADMIN_TOKEN'
export const SET_CANDIDAT_TOKEN = 'SET_CANDIDAT_TOKEN'
export const SIGN_OUT = 'SIGN_OUT'

export const FETCHING_TOKEN = 'FETCHING_TOKEN'
export const BAD_CREDENTIALS = 'BAD_CREDENTIALS'
export const SIGNED_IN_AS_ADMIN = 'SIGNED_IN_AS_ADMIN'
export const SIGNED_IN_AS_CANDIDAT = 'SIGNED_IN_AS_CANDIDAT'
export const SIGNED_OUT = 'SIGNED_OUT'

export default {
  state: {
    status: null,
  },

  mutations: {
    [FETCH_TOKEN_REQUEST] (state, token) {
      state.status = FETCHING_TOKEN
    },
    [SET_ADMIN_TOKEN] (state) {
      state.status = SIGNED_IN_AS_ADMIN
    },
    [SET_CANDIDAT_TOKEN] (state) {
      state.status = SIGNED_IN_AS_CANDIDAT
    },
    [BAD_CREDENTIALS] (state, token) {
      state.status = BAD_CREDENTIALS
    },
    [SIGN_OUT] (state, token) {
      state.status = SIGNED_OUT
    },
  },

  actions: {
    async [CHECK_ADMIN_TOKEN] ({ commit }) {
      const token = localStorage.getItem(STORAGE_TOKEN_KEY)
      const { auth } = await api.admin.verifyToken(token)
      if (auth) {
        commit(SET_ADMIN_TOKEN)
      }
    },
    
    async [CHECK_CANDIDAT_TOKEN] ({ commit }, queryToken) {
      const token = queryToken || localStorage.getItem(STORAGE_TOKEN_KEY)
      if (!token) {
        commit(SIGN_OUT)
      }
      const { auth } = await api.candidat.verifyToken(token)
      if (auth) {
        localStorage.setItem(STORAGE_TOKEN_KEY, token)
        commit(SET_CANDIDAT_TOKEN)
      } else {
        commit(SIGN_OUT)
      }
    },

    async [FETCH_TOKEN_REQUEST] ({ commit }, { email, password }) {
      commit(FETCH_TOKEN_REQUEST)
      try {
        const { token } = await api.admin.requestToken(email, password)
        if (!token) {
          throw new Error(BAD_CREDENTIALS)
        }
        localStorage.setItem(STORAGE_TOKEN_KEY, token)
        commit(SET_ADMIN_TOKEN)
      } catch (error) {
        commit(BAD_CREDENTIALS)
      }
    },

    async [FETCH_TOKEN_SUCCESS] ({ commit }, token) {
      commit(SET_TOKEN, token)
    },

    async [SIGN_OUT] ({ commit }) {
      localStorage.removeItem(STORAGE_TOKEN_KEY)
      commit(SIGN_OUT)
    },
  },
}
