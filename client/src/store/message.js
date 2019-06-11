import delay from 'delay'

export const SHOW_ERROR = 'SHOW_ERROR'
export const SHOW_INFO = 'SHOW_INFO'
export const SHOW_MESSAGE = 'SHOW_MESSAGE'
export const SHOW_SUCCESS = 'SHOW_SUCCESS'
export const SHOW_WARNING = 'SHOW_WARNING'

export const HIDE_MESSAGE = 'HIDE_MESSAGE'

const defaultTimeout = 9000

export default {
  state: {
    timeout: defaultTimeout,
    content: '',
    color: 'info',
    show: false,
  },

  mutations: {
    [SHOW_MESSAGE] (state, { color = 'info', content, timeout }) {
      state.content = content
      state.show = true
      state.color = color
      state.timeout = timeout || defaultTimeout
    },
    [HIDE_MESSAGE] (state) {
      state.content = ''
      state.show = false
    },
  },

  actions: {
    async [SHOW_INFO] ({ commit }, content, timeout) {
      commit(HIDE_MESSAGE)
      await delay(10)
      commit(SHOW_MESSAGE, { color: 'info', content, timeout })
    },

    async [SHOW_ERROR] ({ commit }, content, timeout) {
      commit(HIDE_MESSAGE)
      await delay(10)
      commit(SHOW_MESSAGE, { color: 'error', content, timeout })
    },

    async [SHOW_SUCCESS] ({ commit }, content, timeout) {
      commit(HIDE_MESSAGE)
      await delay(10)
      commit(SHOW_MESSAGE, { color: 'success', content, timeout })
    },

    async [SHOW_WARNING] ({ commit }, content, timeout) {
      commit(HIDE_MESSAGE)
      await delay(10)
      commit(SHOW_MESSAGE, { color: 'warning', content, timeout })
    },

    [HIDE_MESSAGE] ({ commit }) {
      commit(HIDE_MESSAGE)
    },
  },
}
