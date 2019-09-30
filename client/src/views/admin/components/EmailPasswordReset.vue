<template>
<v-dialog
    v-model="showDialog"
    width="500"
  >
    <v-btn
      slot="activator"
      depressed
      color="#fff"
      tabindex="8"
    >
    Réinitialiser mot de passe
    </v-btn>

    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
      Réinitialiser mot de passe
      </v-card-title>
      <v-form
        @submit.prevent="sendMailResetLink"
      >
        <div class="u-flex  u-flex--center">
          <div class="form-input">
            <v-text-field
              prepend-icon="email"
              @focus="setEmailPlaceholder"
              @blur="removeEmailPlaceholder"
              :placeholder="emailPlaceholder"
              aria-placeholder="admin@example.fr"
              :autofocus="showDialog"
              hint="ex. : admin@example.fr"
              required
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
            type="submit"
            :disabled="isSendingResetLink"
            :aria-disabled="isSendingResetLink"
            tabindex="2"
            color="#28a745"
          > Réinitialiser mot de passe
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

export default {
  data () {
    return {
      emailPlaceholder: '',
      email: '',
      showDialog: false,
    }
  },

  computed: {
    isSendingResetLink (email) {
      return this.$store.state.admin.isSendingResetLink
    },
  },

  methods: {
    async removeEmailPlaceholder () {
      this.emailPlaceholder = ''
    },
    async setEmailPlaceholder () {
      this.emailPlaceholder = 'admin@example.fr'
    },

    async sendMailResetLink () {
      if (!this.email) {
        return this.$store.dispatch(SHOW_ERROR, `l'email n'existe pas`)
      }
      try {
        await this.$store.dispatch(SEND_RESET_LINK_REQUEST, this.email)
        this.$store.dispatch(SHOW_SUCCESS, `Un email vient de vous être envoyé à l'adresse ${this.email}`)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, 'Oups ! Une erreur est survenue')
      }
      this.showDialog = false
    },
  },
}
</script>
