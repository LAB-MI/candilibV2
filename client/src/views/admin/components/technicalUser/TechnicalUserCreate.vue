<template>
  <v-form
    ref="createTechnicalUserForm"
    v-model="valid"
    @submit.prevent="createdTechnicalUser"
  >
    <v-container class="u-flex  u-flex--between  u-full-width">
      <v-text-field
        v-model="email"
        class="t-input-tech-email"
        prepend-icon="email"
        :aria-placeholder="emailPlaceholder"
        :hint="`ex. : ${emailPlaceholder}`"
        tabindex="0"
        :rules="emailRules"
        label="Adresse courriel"
        :placeholder="emailPlaceholder"
        required
        @focus="setEmailPlaceholder"
        @blur="removeEmailPlaceholder"
        @input="setEmailToLowerCase"
      />

      <v-spacer />

      <v-btn
        class="t-create-tech-btn"
        type="submit"
        :disabled="!valid || isSendingTechnicalUser"
        :aria-disabled="!valid || isSendingTechnicalUser"
        tabindex="0"
        raised
        color="success"
      >
        Ajouter
        <v-icon>
          add_circle
        </v-icon>
      </v-btn>
    </v-container>
  </v-form>
</template>

<script>
import { email as emailRegex } from '@/util'

import {
  CREATE_TECHNICAL_USER_REQUEST,
} from '@/store'

export default {
  components: {
  },

  data () {
    return {
      valid: false,
      email: '',
      emailRules: [
        email => !!email || 'Veuillez renseigner votre adresse courriel',
        email => emailRegex.test(email) || "L'adresse courriel doit être valide",
      ],
      emailPlaceholder: '',
    }
  },

  computed: {
    isSendingTechnicalUser () {
      return this.$store.state.technicalUser.isSendingTechnicalUser
    },
  },

  methods: {
    setEmailPlaceholder () {
      this.emailPlaceholder = 'jean@dupont.fr'
    },

    removeEmailPlaceholder () {
      this.emailPlaceholder = ''
    },

    setEmailToLowerCase () {
      this.email = this.email.toLowerCase().trim()
    },

    async createdTechnicalUser () {
      const {
        email,
      } = this

      try {
        await this.$store.dispatch(CREATE_TECHNICAL_USER_REQUEST, {
          email,
        })
        this.$refs.createTechnicalUserForm.reset()
      } catch (error) {
      }
    },
  },
}
</script>
