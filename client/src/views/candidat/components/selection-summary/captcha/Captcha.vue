<template>
  <div>
    <v-card
      elevation="3"
      shaped
      class="pa-3 ma-3"
    >
      <div v-if="isCaptchaValidate">
        <span class="font-semibold">
          Si la reponse sélectionnée est valide la place sera réservée
        </span>
        <v-icon
          x-large
          color="primary"
        >
          check_circle_outline
        </v-icon>
      </div>
      <div v-else>
        <v-btn
          v-show="!candidatCaptcha.generatedCaptcha.isReady"
          :disabled="disabledValue"
          color="primary"
          @click="getCaptcha('start')"
        >
          Je ne suis pas un robot
          <v-icon>
            security
          </v-icon>
        </v-btn>

        <div v-show="candidatCaptcha.generatedCaptcha.isReady">
          <v-card-text>
            <span class="font-medium text-xl">
              Selectionner:
            </span>
            <span class="font-semibold text-xl">
              {{ candidatCaptcha.generatedCaptcha.question }}
            </span>
          </v-card-text>
          <v-btn
            v-for="image in candidatCaptcha.generatedCaptcha.images"
            :key="image.index"
            @click="tryCaptcha(image.value)"
          >
            <img
              :src="image.url"
              alt="valid"
            >
          </v-btn>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import {
  GENERATE_CAPTCHA_REQUEST,
  TRY_RESOLVE_CAPTCHA_REQUEST,
} from '@/store'
import { mapState } from 'vuex'

export default {
  name: 'Captcha',

  props: {
    disabledValue: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      isCaptchaValidate: false,
    }
  },

  computed: {
    ...mapState([
      'candidatCaptcha',
    ]),
  },

  methods: {
    async getCaptcha () {
      await this.$store.dispatch(GENERATE_CAPTCHA_REQUEST)
    },
    async tryCaptcha (imageField) {
      await this.$store.dispatch(TRY_RESOLVE_CAPTCHA_REQUEST, imageField)
      this.isCaptchaValidate = true
    },
  },
}
</script>
