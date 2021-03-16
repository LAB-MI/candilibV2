<template>
  <div>
    <v-card
      elevation="3"
      shaped
      class="pa-1 ma-1"
    >
      <div>
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
          <v-card-title>
            <v-icon>
              security
            </v-icon>
            <v-spacer />
            <v-btn
              color="primary"
              rounded
              @click="getCaptcha('start')"
            >
              <v-icon>
                autorenew
              </v-icon>
              {{ candidatCaptcha.count }} / {{ candidatCaptcha.retryLimit }}
            </v-btn>
          </v-card-title>
          <v-card-text>
            <span class="font-medium">
              Selectionner:
            </span>
            <span class="font-semibold text-xl">
              {{ candidatCaptcha.generatedCaptcha.question }}
            </span>
            <v-card-text />
            <v-card-text>
              <v-btn
                v-for="image in candidatCaptcha.generatedCaptcha.images"
                :key="image.index"
                :color="(imageField !== null && imageField === image.index ) ? 'primary' : ''"
                @click="tryCaptcha(image.value, image.index)"
              >
                <img
                  :src="image.url"
                  alt="valid"
                >
              </v-btn>
            </v-card-text>
          </v-card-text>
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
      imageField: null,
    }
  },

  computed: {
    ...mapState([
      'candidatCaptcha',
    ]),
  },

  methods: {
    async getCaptcha () {
      this.imageField = null
      await this.$store.dispatch(GENERATE_CAPTCHA_REQUEST)
    },
    async tryCaptcha (imageField, fieldIndex) {
      await this.$store.dispatch(TRY_RESOLVE_CAPTCHA_REQUEST, imageField)
      this.imageField = fieldIndex
    },
  },
}
</script>
