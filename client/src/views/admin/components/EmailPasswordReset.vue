<template>
  <v-dialog
    v-model="showDialog"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        class="u-flex u-flex--center reset-password-btn"
        outline
        color="info"
        tabindex="8"
        v-on="on"
      >
        Réinitialiser mon mot de passe
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        Réinitialiser mon mot de passe
      </v-card-title>
      <v-form
        v-model="isValidEmail"
        @submit.prevent="sendMailResetLink"
      >
        <div class="u-flex  u-flex--center">
          <div class="form-input">
            <v-text-field
              class="t-reset-password-email"
              prepend-icon="email"
              @focus="setEmailPlaceholder"
              @blur="removeEmailPlaceholder"
              @input="setEmailToLowerCase"
              :placeholder="emailPlaceholder"
              :aria-placeholder="emailPlaceholder"
              :autofocus="showDialog"
              :hint="`ex. : ${emailPlaceholder}`"
              label="Adresse courriel"
              ref="emailInput"
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
            class="t-reset-link-btn"
            dark
            type="submit"
            :disabled="isSendingResetLink"
            :aria-disabled="isSendingResetLink"
            tabindex="2"
            color="#28a745"
          >
            Réinitialiser mon mot de passe
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  SEND_RESET_LINK_REQUEST,
  SHOW_SUCCESS,
  SHOW_ERROR,
} from '@/store'
import { email as emailRegex } from '@/util'

export default {
  data () {
    return {
      emailPlaceholder: 'admin@example.com',
      email: '',
      emailRules: [
        v => !!v || 'Veuillez renseigner votre adresse courriel',
        v => emailRegex.test(v) || "L'adresse courriel doit être valide",
      ],
      isValidEmail: false,
      showDialog: false,
    }
  },

  computed: {
    isSendingResetLink (email) {
      return this.$store.state.admin.isSendingResetLink
    },
  },

  watch: {
    showDialog (isShowing) {
      if (isShowing) {
        setTimeout(() => this.$refs.emailInput.focus())
      }
    },
  },

  methods: {
    async removeEmailPlaceholder () {
      this.emailPlaceholder = ''
    },
    async setEmailPlaceholder () {
      this.emailPlaceholder = 'admin@example.com'
    },

    async setEmailToLowerCase () {
      this.email = this.email && this.email.toLowerCase()
    },

    async sendMailResetLink () {
      if (!this.isValidEmail) {
        return
      }
      try {
        await this.$store.dispatch(SEND_RESET_LINK_REQUEST, this.email)
        this.$store.dispatch(SHOW_SUCCESS, `Un courriel vient de vous être envoyé à l'adresse ${this.email}`)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, `Cette adresse courriel n'est pas reconnue`)
      }
      this.showDialog = false
    },
  },
}
</script>

<style lang="stylus">

.reset-password-btn {
  font-family: 'Poppins-Medium', Arial, Helvetica, sans-serif;
  font-size: 15px;
  color: #fff;
  line-height: 1.2;
  text-transform: uppercase;
  padding: 0 20px;
  width: 100%;
  margin: 0.5em 0;
}

</style>
