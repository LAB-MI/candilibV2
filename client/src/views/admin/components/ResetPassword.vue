<template>
  <div
    class="reset-card"
    :style="{ backgroundImage: 'url(' + backgroundImgUrl + ')' }"
  >
    <bandeau-beta fixed />

    <div />

    <v-form
      v-model="isPasswordCoupleValid"
      class="reset-form"
      @submit.prevent="updatePassword"
    >
      <h2 class="text--center">
        ADMINISTRATEUR
      </h2>

      <h3 class="text--center">
        C<span class="col-red">A</span>NDILIB
      </h3>
      <div class="form-input">
        <v-text-field
          v-model="newPassword"
          class="t-new-password"
          aria-placeholder="nouveau mot de passe"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          label="nouveau mot de passe"
          name="password"
          :rules="passwordRules"
          tabindex="2"
          :type="showPassword ? 'text' : 'password'"
          @click:append="showPassword = !showPassword"
        />
      </div>

      <password-checker :password="newPassword" />

      <div class="form-input">
        <v-text-field
          v-model="confirmNewPassword"
          class="t-confirm-new-password"
          aria-placeholder="confirmation du nouveau mot de passe"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          label="confirmation du nouveau mot de passe"
          name="confirmNewPassword"
          :rules="confirmNewPasswordRules"
          tabindex="2"
          :type="showPassword ? 'text' : 'password'"
          @click:append="showPassword = !showPassword"
        />
      </div>
      <div class="form-input">
        <button
          tabindex="3"
          class="submit-btn"
          :disabled="isSendingPassword"
          :aria-disabled="isSendingPassword"
        >
          <div class="submit-bgbtn" />
          <div class="submit-label">
            Réinitialiser mon mot de passe
          </div>
        </button>
      </div>
    </v-form>
  </div>
</template>

<script>

import PasswordChecker from '@/views/admin/components/PasswordChecker.vue'
import backgroundImgUrl from '@/assets/bg-login.jpg'
import { SHOW_ERROR, SHOW_SUCCESS, RESET_PASSWORD_REQUEST } from '../../../store'
import { strongEnoughPassword } from '@/util'

export default {
  components: {
    PasswordChecker,
  },
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
          'Veuillez entrer un mot de passe fort (exemple: A@5db9812)',
      ],
      confirmNewPasswordRules: [
        value => (!!value && value === this.newPassword) || ('Veuillez confirmer votre mot de passe'),
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
      try {
        await this.$store.dispatch(RESET_PASSWORD_REQUEST, {
          email,
          hash,
          newPassword: this.newPassword,
          confirmNewPassword: this.confirmNewPassword,
        })
        this.$store.dispatch(SHOW_SUCCESS, 'Votre mot de passe a bien été modifié')
        this.$router.push({ name: 'admin-login' })
      } catch (error) {
        await this.$store.dispatch(SHOW_ERROR, error.message)
        return setTimeout(() => this.$router.push({ name: 'admin-login' }), 2000)
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
