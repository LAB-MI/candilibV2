<template>
  <div class="contact-us-form">
    <v-form
      ref="contactForm"
      v-model="valid"
      class="t-contact-us-form contact-us-form"
      @submit.prevent="sendContactUs"
    >
      <form-group-info-candidat
        v-model="candidat"
        :dark="dark"
        is-contact
        :readonly="readonly"
        :available-departements="availableDepartements"
      >
        <template
          v-if="withHadSingup"
          v-slot:before
        >
          <div
            class="form-input"
          >
            <v-checkbox
              v-model="hadSingup"
              :dark="dark"
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
          :dark="dark"
          :color="dark?'#fff':''"
          :placeholder="subjectPlaceholder"
          aria-placeholder="Réservation pour demain"
          hint="ex. : Réservation pour demain"
          required
          tabindex="2"
        />
      </div>

      <div class="form-input">
        <v-textarea
          v-model="message"
          outlined
          name="message"
          :label="labelMessage"
          rows="20"
          :dark="dark"
          :color="dark?'#fff':''"
          required
          :rules="messageRules"
        />
      </div>
      <div class="form-input  form-input-group">
        <v-btn
          type="submit"
          :disabled="!isCompleted || isSending"
          :aria-disabled="!isCompleted || isSending"
          class="contact-us-button"
          :dark="dark"
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
import { FETCH_DEPARTEMENTS_REQUEST, SHOW_ERROR, FETCH_SEND_CONTACT_US_REQUEST } from '@/store'

import FormGroupInfoCandidat from '../FormGroupInfoCandidat'
import { mapState } from 'vuex'
const messageMaxLength = 2000

export default {
  components: {
    FormGroupInfoCandidat,
  },
  props: {
    defaultCandidat: {
      type: Object,
      default () { },
    },
    dark: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    withHadSingup: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      valid: false,
      candidat: this.defaultCandidat,
      hadSingup: false,
      message: '',
      subject: '',
      subjectPlaceholder: '',
      messageRules: [
        v => v.length <= messageMaxLength || this.$formatMessage({ id: 'constat_us_message_too_long' }),
      ],
    }
  },
  computed: {
    ...mapState({
      availableDepartements: state => state.departements && state.departements.list,
      isSending: state => state.contactUs && state.contactUs.isFetching,
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
    async sendContactUs () {
      if (!this.valid) {
        return this.$store.dispatch(SHOW_ERROR, this.$formatMessage({ id: 'contact_us_formulaire_invalide' }))
      }
      try {
        await this.$store.dispatch(FETCH_SEND_CONTACT_US_REQUEST, {
          candidat: this.candidat,
          subject: this.subject,
          message: this.message,
          hadSignup: this.hadSingup,
        })
        this.$router.push({ name: 'home' })
      } catch (error) {
      }
    },
  },
}
</script>

<style lang="postcss" scoped>
.contact-us-form {
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

.c-candidat-message__subtitle {
  padding: 5px 0 15px 0;
  line-height: 1;
  font-family: 'Poppins-Medium', Arial, Helvetica, sans-serif;
  font-size: 14px;
  color: #fff;
  letter-spacing: 3px;
  text-align: center;
  text-transform: uppercase;
  text-shadow: 8px 8px 12px #333;
}

.contact-us-button {
  width: 100%;
}

</style>
