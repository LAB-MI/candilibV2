<template>
  <div>
    Page de contact
    <v-form
      ref="presignupForm"
      v-model="valid"
      class="t-presignup-form presignup-form"
      @submit.prevent="presignup"
    >
      <form-group-info-candidat
        :value="candidat || me "
        :dark="me ? false : true"
        is-contact
        :readonly="me?true:false"
        :available-departements="availableDepartements"
        @input="setValues"
      >
        <template
          v-if="!me"
          v-slot:before
        >
          <div
            class="form-input"
          >
            <v-checkbox
              v-model="hadSingup"
              :dark="me? false: true"
              class="t-checkbox"
              :label="$formatMessage({ id: 'contact_us_had_signup' })"
            />
          </div>
        </template>
      </form-group-info-candidat>
      <div class="form-input">
        <v-text-field
          v-model="subject"
          :label="`${$formatMessage({ id:'contact_us_subject'}) } *`"
          :dark="me? false: true"
          :color="me?'':'#fff'"
          :placeholder="subjectPlaceholder"
          aria-placeholder="Réservation pour demain"
          hint="ex. : Réservation pour demain"
          required
          tabindex="2"
        />
      </div>

      <div class="form-input">
        <v-textarea
          outlined
          name="message"
          :label="labelMessage"
          rows="20"
          :dark="me? false: true"
          :color="me?'':'#fff'"
          required
          :rules="messageRules"
          @keydown="onKeyDownMessage"
        />
      </div>
      <div class="form-input  form-input-group">
        <v-btn
          type="submit"
          :disabled="!isCompleted || isSending"
          :aria-disabled="!isCompleted || isSending"
          class="contact-us-button"
          :dark="me ? false : true"
          tabindex="8"
          color="#28a745"
        >
          <div class="submit-label">
            {{ $formatMessage({ id:'contact_us_submit'}) }}
          </div>
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import { FETCH_DEPARTEMENTS_REQUEST, SHOW_ERROR } from '@/store'

import FormGroupInfoCandidat from '../FormGroupInfoCandidat'
import { mapState } from 'vuex'
const messageMaxLength = 2000

export default {
  components: {
    FormGroupInfoCandidat,

  },
  data () {
    return {
      valid: false,
      candidat: undefined,
      hadSingup: false,
      message: '',
      subject: '',
      subjectPlaceholder: '',
      isSending: false,
      messageRules: [
        v => v.length <= messageMaxLength || this.$formatMessage({ id: 'constat_us_message_too_long' }),
      ],
    }
  },
  computed: {
    ...mapState({
      me: state => state.candidat.me,
      availableDepartements: state => state.departements && state.departements.list,
    }),
    isCompleted: function () {
      return this.valid && this.candidat && this.candidat.codeNeph && this.candidat.nomNaissance && this.candidat.email && this.candidat.departement && this.subject && this.message
    },
    labelMessage: function () {
      return this.$formatMessage({ id: 'contact_us_message' }) + '*' + ` (${messageMaxLength - this.message.length} caractéres restant)`
    },
  },
  mounted () {
    this.$store.dispatch(FETCH_DEPARTEMENTS_REQUEST)
  },

  methods: {
    onKeyDownMessage (evt) {
      if (this.message.length >= messageMaxLength) {
        evt.preventDefault()
      }
    },
    setValues (value) {
      this.candidat = value
    },
    sendContactUs () {
      console.log(this.candidat)
      if (!this.valid) {
        return this.$store.dispatch(SHOW_ERROR, this.$formatMessage({ id: 'contact_us_formulaire_invalide' }))
      }
      // const {
      //   codeNeph,
      //   nomNaissance,
      //   prenom,
      //   email,
      //   portable,
      //   departement,
      // } = this.candidat

      // try {
      //   const response = await this.$store.dispatch(PRESIGNUP_REQUEST, {
      //     codeNeph,
      //     nomNaissance,
      //     prenom,
      //     email,
      //     portable,
      //     departement,
      //   })
      //   this.$refs.presignupForm.reset()
      //   this.$router.push({ name: 'email-validation', params: { response } })
      // } catch (error) {
      //   this.$store.dispatch(SHOW_ERROR, error.message)
      // }
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
