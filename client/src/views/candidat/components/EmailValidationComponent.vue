<template>
  <div>
    <v-alert
      v-model="show"
      :type="messageType"
      class="rounded-corner"
    >
      {{
        message
      }}
    </v-alert>
    <div class="text--center">
      <router-link :to="{name: 'candidat-presignup'}">
        <v-btn flat dark>
          Retour au formulaire de pré-inscription
        </v-btn>
      </router-link>
    </div>
  </div>
</template>

<script>
import {
  CHECK_TOKEN_FOR_EMAIL_VALIDATION_REQUEST,
} from '@/store'

const EMAIL_VALIDATION_IS_PENDING = `Vous allez bientôt recevoir un courriel à l'adresse que vous nous avez indiqué.
        Veuillez consulter votre boîte, et valider votre adresse courriel en cliquant sur le lien indiqué dans le message.`
const EMAIL_VALIDATION_IN_PROGRESS = 'Veuillez patienter pendant la validation de votre adresse courriel...'
const EMAIL_VALIDATION_CHECKED = 'Votre email est validé, vous allez recevoir un email de confirmation de pré-inscription.'

export default {
  computed: {
    candidatData () {
      return this.$store.state.candidat
    },
    message () {
      return this.$store.state.candidat.message || EMAIL_VALIDATION_IS_PENDING
    },
    messageType () {
      return this.$store.state.candidat.messageType || 'info'
    },
  },

  data () {
    return {
      show: true,
    }
  },

  async mounted () {
    if (this.$route.name.includes('pending')) {
      this.message = EMAIL_VALIDATION_IS_PENDING
      return
    }

    const { h: hash, e: email } = this.$route.query

    if (hash && email) {
      this.message = EMAIL_VALIDATION_IN_PROGRESS
      try {
        await this.$store.dispatch(CHECK_TOKEN_FOR_EMAIL_VALIDATION_REQUEST, { hash, email })
        this.alertType = 'success'
        this.message = EMAIL_VALIDATION_CHECKED
      } catch (error) {
        this.alertType = 'error'
        this.message = error.message
      }
    } else {
      this.alertType = 'warning'
      this.message = 'email ou Hash de validation introuvable'
    }
  },
}
</script>

<style lang="postcss" scoped>
  .rounded-corner {
    border-radius: 0.3em;
  }
</style>
