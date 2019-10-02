<template>
  <v-dialog
    v-model="showDialog"
    width="500"
    class="already-signed-up"
  >
    <v-btn
      slot="activator"
      depressed
      color="#fff"
      tabindex="8"
    >
      {{getMsg('preinscription_bouton_deja_inscrit') }}
    </v-btn>

    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        {{getMsg('preinscription_magic_link_title') }}
      </v-card-title>

      <v-form
        ref="magicLinkForm"
        v-model="magicLinkValid"
        @submit.prevent="sendMagicLink"
      >
        <div class="u-flex  u-flex--center">
          <div class="form-input">
            <v-text-field
              :class="`t-magic-link-input-${testClassSuffix}`"
              :label="getMsg('preinscription_email')"
              prepend-icon="email"
              @focus="setEmailPlaceholder"
              @blur="removeEmailPlaceholder"
              :placeholder="emailPlaceholder"
              aria-placeholder="jean@dupont.fr"
              :autofocus="showDialog"
              hint="ex. : jean@dupont.fr"
              required
              :rules="emailRules"
              tabindex="1"
              v-model="email"
            ></v-text-field>
          </div>
        </div>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            dark
            :class="`t-magic-link-button-${testClassSuffix}`"
            type="submit"
            :disabled="isSendingMagicLink"
            :aria-disabled="isSendingMagicLink"
            tabindex="2"
            color="#28a745"
          >
            <div class="submit-label">
              {{getMsg('preinscription_bouton_magic_link')}}
            </div>
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  SEND_MAGIC_LINK_REQUEST,
  SHOW_ERROR,
  SHOW_SUCCESS,
} from '@/store'
import { email as emailRegex } from '@/util'

export default {
  props: {
    testClassSuffix: String,
  },

  data () {
    return {
      emailPlaceholder: '',
      email: '',
      emailRules: [
        v => v !== '' || this.getMsg('preinscription_email_vide'),
        v => emailRegex.test(v) || this.getMsg('preinscription_email_erreur'),
      ],
      magicLinkValid: false,
      showDialog: false,
    }
  },

  computed: {
    isSendingMagicLink () {
      return this.$store.state.candidat.isSendingMagicLink
    },
  },

  methods: {
    getMsg (id) {
      return this.$formatMessage({ id })
    },

    async removeEmailPlaceholder () {
      this.emailPlaceholder = ''
    },
    async setEmailPlaceholder () {
      this.emailPlaceholder = 'jean@dupont.fr'
    },

    async sendMagicLink () {
      if (!this.magicLinkValid) {
        return this.$store.dispatch(SHOW_ERROR, this.getMsg('preinscription_magic_link_invalide'))
      }
      try {
        await this.$store.dispatch(SEND_MAGIC_LINK_REQUEST, this.email)
        this.$refs.magicLinkForm.reset()
        this.$store.dispatch(SHOW_SUCCESS, this.getMsg('preinscription_magic_link_envoyé'))
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
      this.showDialog = false
    },
  },
}
</script>

<style lang="stylus" scoped>
.already-signed-up {
  @media (max-width: 599px) {
    order: -1;
  }
}

.form-input {
  width: 90%;
  text-align: center;
  display: flex;
  justify-content: center;

  @media (max-width: 599px) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }
}

</style>
