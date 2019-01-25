<template>
  <div>
    <div class="login">
      <div class="login-form">
        <h1 class="login-form-title">
          CANDILIB
        </h1>
        <h2 class="login-form-subtitle">
          Réservez votre place d'examen
        </h2>
        <hr class="u-separator" />
        <v-form v-model="valid" class="login-form" @submit.prevent="sendMagicLink">
          <div class="form-input">
            <v-text-field
              dark
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
            <v-btn flat :to="{ name: 'candidat-signup' }">
              Pas encore inscrit ?
            </v-btn>
          </div>
        </v-form>
        <hr class="u-separator" />
      </div>
    </div>
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
        v => !v || emailRegex.test(v) || 'L\'email doit être valide',
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
.login {
  width: 40em;
  padding: 1em;
  background: linear-gradient(to bottom, #17a2b8, #063852);
  border-radius: 1em;
  box-shadow: 0em 0.1em 0.1em 0.3em #fff;

  @media (max-width: 1170px) {
    width: 24em;
  }

  &-form {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;

    &-title {
      margin: 0.2em 0;
      line-height: 1;
      font-family: 'Poppins-regular';
      font-size: 60px;
      letter-spacing: 5px;
      color: #fff;
      text-align: center;
      text-transform: uppercase;
      text-shadow: 3px 3px 0px #000;
      text-shadow: 8px 8px 12px #333;
    }

    &-subtitle {
      padding: 5px 0 15px 0;
      line-height: 1;
      font-family: 'Poppins-Medium';
      font-size: 18px;
      color: #fff;
      letter-spacing: 3px;
      text-align: center;
      text-transform: uppercase;
      text-shadow: 8px 8px 12px #333;
    }
  }
}

.form-input {
  text-align: center;
  width: 80%;

  @media (max-width: 1170px) {
    width: 100%;
  }
}
</style>
