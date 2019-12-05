<template>
  <div
    class="login"
    :style="{ backgroundImage: 'url(' + backgroundImgUrl + ')' }"
  >
    <bandeau-beta fixed />

    <div class="login-bg-filter" />

    <v-form
      v-model="valid"
      class="login-form"
      @submit.prevent="getToken"
    >
      <h2 class="text--center">
        ADMINISTRATEUR
      </h2>

      <h3 class="text--center">
        C<span class="col-red">A</span>NDILIB
      </h3>

      <div class="form-input">
        <v-text-field
          v-model="email"
          class="t-login-email"
          aria-placeholder="jean@dupont.fr"
          autofocus
          hint="ex. : jean@dupont.fr"
          label="email"
          required
          :rules="emailRules"
          tabindex="1"
        />
      </div>

      <div class="form-input">
        <v-text-field
          v-model="password"
          aria-placeholder="mot de passe"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          hint="Au moins 8 caractères"
          label="mot de passe"
          name="password"
          :rules="passwordRules"
          tabindex="2"
          :type="showPassword ? 'text' : 'password'"
          @click:append="showPassword = !showPassword"
        />
      </div>

      <div class="form-input">
        <button
          tabindex="3"
          class="submit-btn"
        >
          <div class="submit-bgbtn" />
          <div class="submit-label">
            Connexion
          </div>
        </button>
        <email-password-reset class="u-flex u-flex--center" />
      </div>

      <admin-version />
    </v-form>
  </div>
</template>

<script>
import backgroundImgUrl from '@/assets/bg-login.jpg'
import { email as emailRegex } from '@/util'
import {
  BAD_CREDENTIALS,
  FETCH_TOKEN_REQUEST,
  SHOW_ERROR,
  SHOW_INFO,
  SHOW_SUCCESS,
  SIGNED_IN_AS_ADMIN,
} from '@/store'

import AdminVersion from '@/components/AppVersion.vue'
import EmailPasswordReset from './EmailPasswordReset'

export default {
  name: 'Login',

  components: {
    AdminVersion,
    EmailPasswordReset,
  },

  data () {
    return {
      backgroundImgUrl,
      email: '',
      password: '',
      emailRules: [
        v => !!v || 'Veuillez renseigner votre email',
        v => emailRegex.test(v) || 'L\'email doit être valide',
      ],
      passwordRules: [v => !!v || 'Veuillez renseigner votre mot de passe'],
      showPassword: false,
      valid: false,
      showDialog: false,
    }
  },

  computed: {
    authStatus () {
      return this.$store.state.auth.statusAdmin
    },
  },

  methods: {
    showMessage (content) {
      this.$store.dispatch(SHOW_INFO, content)
    },

    showSuccess (content) {
      this.$store.dispatch(SHOW_SUCCESS, content)
    },

    showError (content) {
      this.$store.dispatch(SHOW_ERROR, content)
    },

    async getToken () {
      if (!this.valid) {
        const message = 'Veuillez remplir le formulaire'
        this.showError(message)
        return
      }
      const { email, password } = this
      this.showMessage('Vérification des identifiants en cours...')
      await this.$store.dispatch(FETCH_TOKEN_REQUEST, { email, password })
      if (this.authStatus === SIGNED_IN_AS_ADMIN) {
        this.showSuccess('Vous êtes identifié')
        this.$router.push(this.$route.query.nextPath || '/admin')
      }
      if (this.authStatus === BAD_CREDENTIALS) {
        const message = 'Identifiants invalides'
        this.showError(message)
      }
    },
  },
}
</script>

<style scoped lang="postcss">
.login {
  display: flex;
  min-height: 100vh;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  position: relative;
}

.login::before {
  content: "";
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: linear-gradient(to top, #005bea, #00c6fb);
  opacity: 0.5;
}

.login-form {
  z-index: 1;
  background: #fff;
  border-radius: 10px;
  padding: 3.5em 3.5em 2em 3.5em;
  box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.9);
}

.form-input {
  margin: 1.5em 0;
}

.submit-btn {
  position: relative;
  font-family: 'Poppins-Medium', Arial, Helvetica, sans-serif;
  font-size: 15px;
  color: #fff;
  line-height: 1.2;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  width: 100%;
  height: 50px;
  overflow: hidden;
}

.submit-bgbtn {
  position: absolute;
  z-index: -1;
  width: 300%;
  height: 100%;
  background: linear-gradient(to left, #21d4fd, #b721ff, #21d4fd, #b721ff);
  top: 0;
  left: -100%;
  transition: all 0.4s;
}

.submit-label {
  z-index: 1;
}

.submit-btn:hover .submit-bgbtn {
  left: 0;
}

.forgotten-password {
  color: #888;
  text-decoration: none;

  &:hover {
    color: #555;
  }
}

.v-messages {
  min-height: 1.2em;
}
</style>
