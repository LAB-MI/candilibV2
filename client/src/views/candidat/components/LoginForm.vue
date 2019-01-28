<template>
  <div>
    <h1 class="login100-form-title">
      CANDILIB
    </h1>
    <h2 class="login50-form-title">
      Réservez votre place d'examen
    </h2>
    <v-form v-model="valid" class="login-form" @submit.prevent="sendMagicLink">
      <div class="form-input">
        <v-text-field
          @focus="setEmailPlaceholder"
          @blur="removeEmailPlaceholder"
          :placeholder="emailPlaceholder"
          aria-placeholder="jean@dupont.fr"
          autofocus
          hint="ex. : jean@dupont.fr"
          label="email"
          required
          :rules="emailRules"
          tabindex="1"
          v-model="email"
        ></v-text-field>
      </div>
      <div class="form-input">
        <v-btn dark tabindex="2" color="#28a745">
          <div class="submit-label">Envoyer le magic link</div>
        </v-btn>
      </div>
      <div class="form-input">
        <v-btn flat @click="toggleForm">
          Pas encore inscrit ?
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import { email as emailRegex } from '@/util'

export default {
  props: {
    toggleForm: Function,
  },
  data: function () {
    return {
      emailPlaceholder: '',
      email: '',
      emailRules: [
        v => !!v || 'Veuillez renseigner votre email',
        v => emailRegex.test(v) || 'L\'email doit être valide',
      ],
      valid: false,
    }
  },
  methods: {
    setEmailPlaceholder () {
      this.emailPlaceholder = 'jean@dupont.fr'
    },
    removeEmailPlaceholder () {
      this.emailPlaceholder = ''
    },
    sendMagicLink () {
      // TODO: implement send magic link action
      // this.$store.dispatch(SEND_MAGIC_LINK_REQUEST)
    },
  },
}
</script>

<style lang="postcss" scoped>
.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.form-input {
  text-align: center;
  width: 80%;
}
</style>
