import api from '@/api'
import candidatMessages from '../candidat'
import { ADMIN_TOKEN_STORAGE_KEY, CANDIDAT_TOKEN_STORAGE_KEY } from '@/constants'
import { SHOW_ERROR, SHOW_INFO } from './'

// Action names
export const CHECK_ADMIN_TOKEN = 'CHECK_ADMIN_TOKEN'
export const CHECK_CANDIDAT_TOKEN = 'CHECK_CANDIDAT_TOKEN'

export const FETCH_TOKEN_REQUEST = 'FETCH_TOKEN_REQUEST'
export const FETCH_TOKEN_FAILURE = 'FETCH_TOKEN_FAILURE'
export const FETCH_TOKEN_SUCCESS = 'FETCH_TOKEN_SUCCESS'

export const REMOVE_TOKEN = 'REMOVE_TOKEN'
export const SET_ADMIN_TOKEN = 'SET_ADMIN_TOKEN'
export const SET_CANDIDAT_TOKEN = 'SET_CANDIDAT_TOKEN'
export const SIGN_OUT_CANDIDAT = 'SIGN_OUT_CANDIDAT'
export const SIGN_OUT_ADMIN = 'SIGN_OUT_ADMIN'

// Status
export const CHECKING_AUTH_ADMIN = 'CHECKING_AUTH_ADMIN'
export const CHECKING_AUTH_CANDIDAT = 'CHECKING_AUTH_CANDIDAT'
export const BAD_CREDENTIALS = 'BAD_CREDENTIALS'
export const SIGNED_IN_AS_ADMIN = 'SIGNED_IN_AS_ADMIN'
export const SIGNED_IN_AS_CANDIDAT = 'SIGNED_IN_AS_CANDIDAT'
export const SIGNED_OUT_ADMIN = 'SIGNED_OUT_ADMIN'
export const SIGNED_OUT_CANDIDAT = 'SIGNED_OUT_CANDIDAT'
export const UNAUTHORIZED = 'UNAUTHORIZED'

export default {
  getters: {
    statusCandidat: state => {
      return state.statusCandidat
    },
    isCandidatSignedIn: state => {
      return state.statusCandidat === SIGNED_IN_AS_CANDIDAT
    },
  },

  state: {
    statusAdmin: null,
    statusCandidat: null,
    lastTokenValid: null,
  },

  mutations: {
    [CHECKING_AUTH_ADMIN] (state) {
      state.statusAdmin = CHECKING_AUTH_ADMIN
    },
    [BAD_CREDENTIALS] (state) {
      state.statusAdmin = BAD_CREDENTIALS
    },
    [SET_ADMIN_TOKEN] (state) {
      state.statusAdmin = SIGNED_IN_AS_ADMIN
    },
    [SIGN_OUT_ADMIN] (state) {
      state.statusAdmin = SIGNED_OUT_ADMIN
    },

    [CHECKING_AUTH_CANDIDAT] (state) {
      state.statusCandidat = CHECKING_AUTH_CANDIDAT
    },
    [SET_CANDIDAT_TOKEN] (state) {
      state.statusCandidat = SIGNED_IN_AS_CANDIDAT
    },
    [SIGN_OUT_CANDIDAT] (state) {
      state.statusCandidat = SIGNED_OUT_CANDIDAT
    },
  },

  actions: {
    async [CHECK_ADMIN_TOKEN] ({ commit }) {
      commit(CHECKING_AUTH_ADMIN)
      const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
      const { auth } = await api.admin.verifyToken(token)
      if (auth) {
        return commit(SET_ADMIN_TOKEN)
      }

      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
      commit(SIGN_OUT_ADMIN)
    },

    async [CHECK_CANDIDAT_TOKEN] ({ commit, dispatch }, queryToken) {
      commit(CHECKING_AUTH_CANDIDAT)
      const isTokenFromMagicLink = Boolean(queryToken)
      const token = queryToken || localStorage.getItem(CANDIDAT_TOKEN_STORAGE_KEY)
      if (!token) {
        commit(SIGN_OUT_CANDIDAT)
        return
      }

      const { auth, message } = await api.candidat.verifyToken(token, isTokenFromMagicLink)
      if (auth) {
        localStorage.setItem(CANDIDAT_TOKEN_STORAGE_KEY, token)
        commit(SET_CANDIDAT_TOKEN)
        return
      }

      dispatch(SHOW_ERROR, message)
      localStorage.removeItem(CANDIDAT_TOKEN_STORAGE_KEY)
      commit(SIGN_OUT_CANDIDAT)
    },

    async [FETCH_TOKEN_REQUEST] ({ commit }, { email, password }) {
      commit(CHECKING_AUTH_ADMIN)
      try {
        const { token } = await api.admin.requestToken(email, password)
        if (!token) {
          throw new Error(BAD_CREDENTIALS)
        }

        localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token)
        commit(SET_ADMIN_TOKEN)
      } catch (error) {
        commit(BAD_CREDENTIALS)
      }
    },

    async [FETCH_TOKEN_SUCCESS] ({ commit }, token) {
      commit(SET_ADMIN_TOKEN, token)
    },

    async [SIGN_OUT_CANDIDAT] ({ commit }) {
      localStorage.removeItem(CANDIDAT_TOKEN_STORAGE_KEY)
      commit(SIGN_OUT_CANDIDAT)
    },

    async [SIGN_OUT_ADMIN] ({ commit, dispatch }) {
      localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
      commit(SIGN_OUT_ADMIN)
      await dispatch(SHOW_INFO, candidatMessages.deconexion_message)
    },
    async [UNAUTHORIZED] ({ commit, dispatch, rootState }) {
      const isCandidat = rootState.candidat && rootState.candidat.me
      if (isCandidat) {
        localStorage.removeItem(CANDIDAT_TOKEN_STORAGE_KEY)
        await dispatch(SIGN_OUT_CANDIDAT)
        await dispatch(SHOW_ERROR, candidatMessages.expired_token_message)
      }

      const isAdmin = rootState.admin && rootState.admin.email
      if (isAdmin) {
        localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
        await dispatch(SHOW_ERROR, candidatMessages.unauthorize_action)
      }
    },
  },
}
