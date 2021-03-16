
import api from '@/api'
import { SHOW_ERROR } from './message'

export const GENERATE_CAPTCHA_REQUEST = 'GENERATE_CAPTCHA_REQUEST'
export const GENERATE_CAPTCHA_SUCCESS = 'GENERATE_CAPTCHA_SUCCESS'
export const GENERATE_CAPTCHA_FAILURE = 'GENERATE_CAPTCHA_FAILURE'

export const TRY_RESOLVE_CAPTCHA_REQUEST = 'TRY_RESOLVE_CAPTCHA_REQUEST'
export const TRY_RESOLVE_CAPTCHA_SUCCESS = 'TRY_RESOLVE_CAPTCHA_SUCCESS'
export const TRY_RESOLVE_CAPTCHA_FAILURE = 'TRY_RESOLVE_CAPTCHA_FAILURE'

export const RESET_CAPTCHA = 'RESET_CAPTCHA'

export default {
  state: {
    generatedCaptcha: { isReady: false, images: [], selectedResponse: false, imageFieldName: undefined },
    isGenerating: false,
    isTrying: false,
    // TODO: Get next value from api
    retryLimit: 3,
    count: 0,
  },

  mutations: {
    [GENERATE_CAPTCHA_REQUEST] (state) {
      state.isGenerating = true
      state.generatedCaptcha.isReady = false
    },
    [GENERATE_CAPTCHA_SUCCESS] (state, { allImages, imageName, imageFieldName, count }) {
      state.generatedCaptcha.question = imageName
      state.generatedCaptcha.images = allImages
      state.generatedCaptcha.imageFieldName = imageFieldName
      state.count = count
      state.isGenerating = false
      state.generatedCaptcha.isReady = true
    },
    [GENERATE_CAPTCHA_FAILURE] (state) {
      state.isGenerating = false
      state.generatedCaptcha.isReady = false
    },

    [TRY_RESOLVE_CAPTCHA_REQUEST] (state) {
      state.isTrying = true
      state.generatedCaptcha.selectedResponse = false
    },
    [TRY_RESOLVE_CAPTCHA_SUCCESS] (state, selectedResponse) {
      state.generatedCaptcha.selectedResponse = selectedResponse
      state.isTrying = false
      state.generatedCaptcha.isReady = true
    },
    [TRY_RESOLVE_CAPTCHA_FAILURE] (state) {
      state.isTrying = false
      state.generatedCaptcha.isReady = false
      state.generatedCaptcha.selectedResponse = false
    },

    [RESET_CAPTCHA] (state) {
      state.generatedCaptcha = { isReady: false, images: [], selectedResponse: false, imageFieldName: undefined }
      state.isGenerating = false
      state.isTrying = false
    },
  },

  actions: {
    async [RESET_CAPTCHA] ({ commit }) {
      commit(RESET_CAPTCHA)
    },

    async [GENERATE_CAPTCHA_REQUEST] ({ commit, dispatch }) {
      commit(GENERATE_CAPTCHA_REQUEST)

      try {
        const newCaptcha = await api.candidat.startRoute()
        if (!newCaptcha?.success) {
          throw new Error(newCaptcha.message)
        }

        const allImages = await Promise.all(
          newCaptcha.captcha.values.map(
            async (value, index) => {
              const response = await api.candidat.getImage(index)
              const data = await response.blob()
              const url = URL.createObjectURL(data)

              return { index, url, value }
            },
          ),
        )

        commit(GENERATE_CAPTCHA_SUCCESS, {
          allImages,
          imageName: newCaptcha.captcha.imageName,
          imageFieldName: newCaptcha.captcha.imageFieldName,
          count: newCaptcha.count,
        })
      } catch (error) {
        commit(GENERATE_CAPTCHA_FAILURE)
        dispatch(SHOW_ERROR, error.message || 'Error de récupération du captcha.')
      }
    },

    async [TRY_RESOLVE_CAPTCHA_REQUEST] ({ state, commit, dispatch }, imageField) {
      commit(TRY_RESOLVE_CAPTCHA_REQUEST)

      try {
        const { imageFieldName } = state.generatedCaptcha
        const selectedResponse = { [imageFieldName]: imageField }
        commit(TRY_RESOLVE_CAPTCHA_SUCCESS, selectedResponse)
      } catch (error) {
        commit(TRY_RESOLVE_CAPTCHA_FAILURE)
        dispatch(SHOW_ERROR, 'Réponse invalide')
      }
    },
  },
}
