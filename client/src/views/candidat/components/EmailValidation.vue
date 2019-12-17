<template>
  <div>
    <v-alert
      value="true"
      :type="messageType"
      class="rounded-corner"
    >
      <h3 class="message-title">
        {{
          messageTitle
        }}
      </h3>
      {{
        message
      }}
    </v-alert>
    <div class="text--center">
      <router-link :to="{name: 'candidat-presignup'}">
        <v-btn
          text
          dark
          :disabled="isCheckingEmail"
          :aria-disabled="isCheckingEmail"
        >
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
import {
  EMAIL_VALIDATION_IS_PENDING,
  EMAIL_VALIDATION_IN_PROGRESS,
  EMAIL_VALIDATION_CHECKED,
} from '@/constants'

export default {
  name: 'EmailValidation',
  computed: {
    candidatData () {
      return this.$store.state.candidat
    },
    message: {
      get () {
        return this.candidatData.message || EMAIL_VALIDATION_IS_PENDING
      },
      set (message) {
      },
    },
    messageType () {
      return this.candidatData.messageType || 'info'
    },
    messageTitle () {
      return this.candidatData.messageTitle || this.messageType
    },
    isCheckingEmail () {
      return this.$store.state.candidat.isCheckingEmail
    },
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
      this.message = 'email ou hash de validation introuvable'
    }
  },
}
</script>

<style lang="postcss" scoped>
  .rounded-corner {
    border-radius: 0.3em;
  }

  .message-title {
    color: #fff;
  }
</style>
