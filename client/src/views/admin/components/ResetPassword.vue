<template>
  <div class="reset-card" v-bind:style="{ backgroundImage: 'url(' + backgroundImgUrl + ')' }">
    <bandeau-beta fixed />

    <div></div>

    <v-form
      @submit.prevent="updatePassword"
      v-model="isPasswordCoupleValid"
      class="reset-form"
    >
      <h2 class="text--center">ADMINISTRATEUR</h2>

      <h3 class="text--center">
        C<span class="col-red">A</span>NDILIB
      </h3>

      <div class="form-input">
        <v-text-field
          class="t-new-password"
          aria-placeholder="nouveau mot de passe"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          @click:append="showPassword = !showPassword"
          hint="Au moins 8 caractères"
          label="nouveau mot de passe"
          name="password"
          :rules="passwordRules"
          tabindex="2"
          :type="showPassword ? 'text' : 'password'"
          v-model="newPassword"
        ></v-text-field>
        </div>
        <div class="form-input">
        <v-text-field
          class="t-confirm-new-password"
          aria-placeholder="confirmation du nouveau mot de passe"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          @click:append="showPassword = !showPassword"
          hint="Au moins 8 caractères"
          label="confirmation du nouveau mot de passe"
          name="confirmNewPassword"
          :rules="confirmNewPasswordRules"
          tabindex="2"
          :type="showPassword ? 'text' : 'password'"
          v-model="confirmNewPassword"
        >
        </v-text-field>
        </div>
          <div class="form-input">
          <button
            tabindex="3"
            class="submit-btn"
            :disabled="isSendingPassword"
            :aria-disabled="isSendingPassword"
            >
            <div class="submit-bgbtn"></div>
            <div class="submit-label">Réinitialiser le mot de passe</div>
          </button>
      </div>
    </v-form>
  </div>
</template>

<script>

import backgroundImgUrl from '@/assets/bg-login.jpg'
import { SHOW_ERROR, SHOW_SUCCESS, RESET_PASSWORD_REQUEST } from '../../../store'
import { strongEnoughPassword } from '@/util'

export default {
  data () {
    return {
      backgroundImgUrl,
      newPassword: '',
      confirmNewPassword: '',
      showPassword: false,
      isPasswordCoupleValid: false,
      passwordRules: [
        value => !!value || ('Veuillez renseigner votre mot de passe'),
        value => strongEnoughPassword.every(regex => regex.test(value)) ||
          'Veuillez entrez un mot de passe fort',
      ],
      confirmNewPasswordRules: [
        value => !!value || ('Veuillez confirmer votre mot de passe'),
      ],

    }
  },

  computed: {
    isSendingPassword () {
      return this.$store.state.admin.isSendingPassword
    },
  },

  methods: {

    async updatePassword () {
      if (!this.isPasswordCoupleValid) {
        return
      }
      const { email, hash } = this.$route.query
      if (!this.newPassword) {
        return this.$store.dispatch(SHOW_ERROR, `Veuillez saisir un mot de passe`)
      }
      if (this.newPassword !== this.confirmNewPassword) {
        return this.$store.dispatch(SHOW_ERROR, `Vos mots de passe ne correspondent pas`)
      }
      try {
        await this.$store.dispatch(RESET_PASSWORD_REQUEST, {
          email,
          hash,
          newPassword: this.newPassword,
          confirmNewPassword: this.confirmNewPassword,
        })
        this.$store.dispatch(SHOW_SUCCESS, `Votre mot de passe a bien été modifié`)
        this.$router.push({ name: 'admin-login' })
      } catch (error) {
      }
    },
  },
}
</script>

<style scoped lang="postcss">
.reset-card {
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

.reset-form {
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

</style>
