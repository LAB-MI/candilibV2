<template>
  <div v-if="withcaptcha">
    <v-card
      elevation="3"
      class="pa-1 ma-1"
    >
      <div>
        <v-btn
          v-show="!candidatCaptcha.generatedCaptcha.isReady"
          :disabled="disabledValue || isLoading"
          color="primary"
          @click="getCaptcha('start')"
        >
          <v-progress-circular
            v-show="isLoading"
            indeterminate
            :color="isLoading ? 'primary' : 'white'"
          />
          <span>
            Je ne suis pas un robot
            <v-icon>
              security
            </v-icon>
          </span>
        </v-btn>

        <div v-show="candidatCaptcha.generatedCaptcha.isReady">
          <big-loading-indicator
            :is-loading="candidatCaptcha.isGenerating"
          />
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
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-alert
              type="info"
              :value="true"
            >
              <p>
                Vous avez <strong>1</strong> minute pour répondre puis confirmer votre réservation.
              </p>
              <p>
                Nombre de tentatives: <strong>{{ candidatCaptcha.count }}</strong> / {{ candidatCaptcha.retryLimit }}
              </p>
            </v-alert>
          </v-card-text>
          <v-card-text>
            <span class="font-medium">
              Sélectionner:
            </span>
            <span class="font-semibold text-xl">
              {{ candidatCaptcha.generatedCaptcha.question }}
            </span>
            <v-card-text />
            <v-card-text>
              <v-btn
                v-for="image in candidatCaptcha.generatedCaptcha.images"
                :key="image.index"
                :disabled="candidatCaptcha.isGenerating"
                :color="(imageField !== null && imageField === image.index ) ? 'primary' : ''"
                :class="`t-image-index t-${image.value}`"
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
import { BigLoadingIndicator } from '@/components'
import { withcaptcha } from '../../../../../util/withcaptha'

export default {
  name: 'Captcha',
  components: {
    BigLoadingIndicator,
  },
  props: {
    disabledValue: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      imageField: null,
      isLoading: false,
      withcaptcha,
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
      this.isLoading = true
      await this.$store.dispatch(GENERATE_CAPTCHA_REQUEST)
      setTimeout(() => {
        this.isLoading = false
      }, 1000)
    },
    async tryCaptcha (imageField, fieldIndex) {
      await this.$store.dispatch(TRY_RESOLVE_CAPTCHA_REQUEST, imageField)
      this.imageField = fieldIndex
    },
  },
}
</script>
