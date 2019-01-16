<template>
  <div class="login" v-bind:style="{ backgroundImage: 'url(' + backgroundImgUrl + ')' }">
    <div class="login-bg-filter"></div>
    <v-form v-model="valid" class="login-form" @submit.prevent="getToken">
      <h2>ADMINISTRATEUR</h2>
      <h3>
        C<span class="col-red">A</span>NDILIB
      </h3>
      <div class="form-input">
        <v-text-field
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
        <v-text-field
          aria-placeholder="mot de passe"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          @click:append="showPassword = !showPassword"
          hint="Au moins 8 caractères"
          label="mot de passe"
          name="password"
          :rules="passwordRules"
          tabindex="2"
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
        ></v-text-field>
      </div>
      <div class="form-input">
        <button tabindex="3" class="submit-btn">
          <div class="submit-bgbtn"></div>
          <div class="submit-label">Connexion</div>
        </button>
      </div>
      <div class="text-center">
        <a
          tag="a"
          tabindex="4"
          @click="showModal"
          class="forgotten-password"
          data-toggle="modal"
        >Mot de passe oublié ?</a>
      </div>
    </v-form>
  </div>
</template>

<script>
import backgroundImgUrl from '@/assets/bg-login.jpg'
import { email as emailRegex } from '@/util'
import { FETCH_TOKEN_REQUEST } from '@/store'

export default {
  name: 'Login',
  data () {
    return {
      backgroundImgUrl,
      email: '',
      password: '',
      emailRules: [
        v => !!v || 'Veuillez renseigner votre email',
        v => emailRegex.test(v) || 'E-mail must be valid',
      ],
      passwordRules: [v => !!v || 'Veuillez renseigner votre mot de passe'],
      showPassword: false,
      valid: false,
    }
  },
  methods: {
    showModal () {
      console.log('Showing modal')
    },
    hideModal () {
      console.log('Hiding modal')
    },
    getToken () {
      const { email, password } = this
      this.$store.dispatch(FETCH_TOKEN_REQUEST, { email, password })
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

.login:before {
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
  box-shadow: 0 5px 10px 0px rgba(0, 0, 0, 0.9);
}

.form-input {
  margin: 1.5em 0;
}

.submit-btn {
  position: relative;
  font-family: Poppins-Medium;
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
