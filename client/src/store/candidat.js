import api from '@/api'

import { SHOW_ERROR } from '@/store'

export const DISPLAY_NAV_DRAWER = 'DISPLAY_NAV_DRAWER'

export const PRESIGNUP_REQUEST = 'PRESIGNUP_REQUEST'
export const PRESIGNUP_FAILURE = 'PRESIGNUP_FAILURE'
export const PRESIGNUP_SUCCESS = 'PRESIGNUP_SUCCESS'

export const SEND_MAGIC_LINK_REQUEST = 'SEND_MAGIC_LINK_REQUEST'
export const SEND_MAGIC_LINK_FAILURE = 'SEND_MAGIC_LINK_FAILURE'
export const SEND_MAGIC_LINK_SUCCESS = 'SEND_MAGIC_LINK_SUCCESS'

export const FETCH_MY_PROFILE_REQUEST = 'FETCH_MY_PROFILE_REQUEST'
export const FETCH_MY_PROFILE_FAILURE = 'FETCH_MY_PROFILE_FAILURE'
export const FETCH_MY_PROFILE_SUCCESS = 'FETCH_MY_PROFILE_SUCCESS'

export default {
  state: {
    isSending: false,
    isSendingMail: false,
    isFetchingProfile: false,
    isMailSent: true,
    me: undefined,
    displayNavDrawer: false,
  },

  mutations: {
    [DISPLAY_NAV_DRAWER] (state, bool) {
      state.displayNavDrawer = bool
    },

    [PRESIGNUP_REQUEST] (state) {
      state.isSending = true
    },
    [PRESIGNUP_SUCCESS] (state, candidat) {
      state.isSending = false
    },
    [PRESIGNUP_FAILURE] (state) {
      state.isSending = false
    },

    [SEND_MAGIC_LINK_REQUEST] (state) {
      state.isSendingMail = true
    },
    [SEND_MAGIC_LINK_SUCCESS] (state, candidat) {
      state.isSendingMail = false
    },
    [SEND_MAGIC_LINK_FAILURE] (state) {
      state.isSendingMail = false
    },

    [FETCH_MY_PROFILE_REQUEST] (state) {
      state.isFetchingProfile = true
    },
    [FETCH_MY_PROFILE_SUCCESS] (state, candidat) {
      state.isFetchingProfile = false
      state.me = candidat
    },
    [FETCH_MY_PROFILE_FAILURE] (state) {
      state.isFetchingProfile = false
    },
  },

  actions: {
    async [DISPLAY_NAV_DRAWER] ({ commit }, bool) {
      commit(DISPLAY_NAV_DRAWER, bool)
    },

    async [PRESIGNUP_REQUEST] ({ commit, dispatch }, candidatData) {
      commit(PRESIGNUP_REQUEST)
      try {
        const response = await api.candidat.presignup(candidatData)
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(PRESIGNUP_SUCCESS, response)
      } catch (error) {
        commit(PRESIGNUP_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async [SEND_MAGIC_LINK_REQUEST] ({ commit, dispatch }, email) {
      commit(SEND_MAGIC_LINK_REQUEST)
      try {
        const response = await api.candidat.sendMagicLink(email)
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(SEND_MAGIC_LINK_SUCCESS, email)
      } catch (error) {
        commit(SEND_MAGIC_LINK_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },

    async [FETCH_MY_PROFILE_REQUEST] ({ commit, dispatch }) {
      commit(FETCH_MY_PROFILE_REQUEST)
      try {
        const response = await api.candidat.getMyProfile()
        if (response.success === false) {
          throw new Error(response.message)
        }
        commit(FETCH_MY_PROFILE_SUCCESS, response.candidat)
      } catch (error) {
        commit(FETCH_MY_PROFILE_FAILURE)
        dispatch(SHOW_ERROR, error.message)
        throw error
      }
    },
  },
}
