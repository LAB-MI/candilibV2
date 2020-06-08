<template>
  <div class="presignup-form">
    <covid-message-exam />
    <v-form
      ref="presignupForm"
      v-model="valid"
      dark
      class="t-presignup-form presignup-form"
      @submit.prevent="presignup"
    >
      <form-group-info-candidat
        v-model="candidat"
        dark
        :available-departements="availableDepartements"
        :show-dialog="showDialog"
      />
      <div class="form-input">
        <v-btn
          type="submit"
          :disabled="!candidat.departement || isSendingPresignup"
          :aria-disabled="!candidat.departement || isSendingPresignup"
          class="submit-button"
          dark
          tabindex="7"
          color="#28a745"
        >
          <div class="submit-label">
            {{ getMsg('preinscription_bouton_submit') }}
          </div>
        </v-btn>
      </div>
      <div class="form-input  form-input-group">
        <v-btn
          text
          color="#fff"
          tag="a"
          :to="{ name: 'mentions-legales' }"
          tabindex="9"
        >
          {{ getMsg('preinscription_bouton_mentions_legales') }}
        </v-btn>
        <already-signed-up />
        <v-btn
          text
          color="#fff"
          tag="a"
          :to="{ name: 'faq' }"
          tabindex="10"
        >
          {{ getMsg('preinscription_bouton_faq') }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import {
  PRESIGNUP_REQUEST,
  SEND_MAGIC_LINK_REQUEST,
  SHOW_ERROR,
  SHOW_SUCCESS,
  FETCH_DEPARTEMENTS_REQUEST,
} from '@/store'

import AlreadySignedUp from './AlreadySignedUp'
import CovidMessageExam from '@/views/candidat/components/CovidMessageExam'
import FormGroupInfoCandidat from './FormGroupInfoCandidat'
import { mapState } from 'vuex'

export default {
  name: 'SignupForm',
  components: {
    AlreadySignedUp,
    CovidMessageExam,
    FormGroupInfoCandidat,
  },
  props: {
    toggleForm: {
      type: Function,
      default () {},
    },
  },
  data: function () {
    return {
      magicLinkValid: false,
      valid: false,
      showDialog: false,
      candidat: {
        codeNeph: '',
        nomNaissance: '',
        prenom: '',
        email: '',
        portable: '',
        departement: '',
      },
    }
  },

  computed: mapState({
    isSendingPresignup (state) {
      return state.candidat.isSendingPresignup
    },
    isSendingMagicLink (state) {
      return state.candidat.isSendingMagicLink
    },
    availableDepartements (state) {
      return state.departements && state.departements.list
    },
  }),

  mounted () {
    this.$store.dispatch(FETCH_DEPARTEMENTS_REQUEST)
  },

  methods: {
    getMsg (id) {
      return this.$formatMessage({ id })
    },
    async presignup () {
      if (!this.valid) {
        return this.$store.dispatch(SHOW_ERROR, this.getMsg('preinscription_formulaire_invalide'))
      }

      const {
        codeNeph,
        nomNaissance,
        prenom,
        email,
        portable,
        departement,
      } = this.candidat

      try {
        const response = await this.$store.dispatch(PRESIGNUP_REQUEST, {
          codeNeph,
          nomNaissance,
          prenom,
          email,
          portable,
          departement,
        })
        this.$refs.presignupForm.reset()
        this.$router.push({ name: 'email-validation', params: { response } })
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },

    async sendMagicLink () {
      if (!this.magicLinkValid) {
        return this.$store.dispatch(SHOW_ERROR, this.getMsg('preinscription_magic_link_invalide'))
      }
      try {
        await this.$store.dispatch(SEND_MAGIC_LINK_REQUEST, this.email)
        this.$refs.presignupForm.reset()
        this.$store.dispatch(SHOW_SUCCESS, this.getMsg('preinscription_magic_link_envoyé'))
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
      this.showDialog = false
    },
  },
}
</script>

<style lang="postcss" scoped>
.presignup-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.form-input {
  width: 90%;
  text-align: center;
  display: flex;
  justify-content: space-between;

  @media (max-width: 599px) {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.already-signed-up {
  @media (max-width: 599px) {
    order: -1;
  }
}

.submit-button {
  width: 100%;
}
</style>
