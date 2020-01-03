<template>
  <div class="presignup-form">
    <v-form
      ref="presignupForm"
      v-model="valid"
      dark
      class="presignup-form"
      @submit.prevent="presignup"
    >
      * Champs obligatoires
      <div class="form-input">
        <v-text-field
          v-model="codeNeph"
          :label="`${getMsg('preinscription_neph')} *`"
          prepend-icon="assignment"
          dark
          color="#fff"
          :placeholder="nephPlaceholder"
          aria-placeholder="012345678912"
          :autofocus="!showDialog"
          hint="ex. : 0123456789"
          required
          :rules="nephRules"
          tabindex="1"
          @focus="setNephPlaceholder"
          @blur="removeNephPlaceholder"
        />
      </div>
      <div class="form-input">
        <v-text-field
          v-model="nomNaissance"
          :label="`${getMsg('preinscription_nom_naissance')} *`"
          prepend-icon="account_box"
          dark
          color="#fff"
          :placeholder="nomPlaceholder"
          aria-placeholder="Dupont"
          hint="ex. : Dupont"
          required
          tabindex="2"
          @focus="setNomPlaceholder"
          @blur="removeNomPlaceholder"
          @input="setNomNaissance"
        />
      </div>
      <div class="form-input">
        <v-text-field
          v-model="prenom"
          :label="getMsg('preinscription_prenom')"
          prepend-icon="perm_identity"
          dark
          color="#fff"
          :placeholder="prenomPlaceholder"
          aria-placeholder="Jean"
          hint="ex. : Jean"
          required
          tabindex="3"
          @focus="setPrenomPlaceholder"
          @blur="removePrenomPlaceholder"
        />
      </div>
      <div class="form-input">
        <v-text-field
          v-model="email"
          :label="`${getMsg('preinscription_email')} *`"
          prepend-icon="email"
          dark
          color="#fff"
          :placeholder="emailPlaceholder"
          aria-placeholder="jean@dupont.fr"
          hint="ex. : jean@dupont.fr"
          required
          :rules="emailRules"
          tabindex="4"
          @focus="setEmailPlaceholder"
          @blur="removeEmailPlaceholder"
          @input="setEmailToLowerCase"
        />
      </div>

      <div class="form-input">
        <v-text-field
          v-model="portable"
          :label="`${getMsg('preinscription_mobile')} *`"
          prepend-icon="smartphone"
          dark
          color="#fff"
          :placeholder="portablePlaceholder"
          aria-placeholder="Jean"
          hint="ex. : 0612345678"
          required
          tabindex="5"
          :rules="portableRules"
          @focus="setPortablePlaceholder"
          @blur="removePortablePlaceholder"
        />
      </div>
      <div class="form-input">
        <v-select
          v-model="departement"
          class="t-select-departements"
          :items="availableDepartements"
          label="Département"
          prepend-icon="location_city"
          aria-placeholder="93"
          persistent-hint
          hint="Vous devez dès à présent choisir votre département de passage à l'examen.
          Votre choix permet à l'administration de provisionner un nombre de place d'examen suffisant pour chaque département où Candilib est disponible"
          :rules="departementRules"
          required
        />
      </div>
      <div
        v-show="departement"
        class="form-input"
      >
        <v-checkbox
          v-model="isCheckDepartement"
          class="t-checkbox"
          :label="$formatMessage({ id: 'confirmation_choix_departement' })"
        />
      </div>
      <div class="form-input">
        <v-btn
          type="submit"
          :disabled="!isCheckDepartement || isSendingPresignup"
          :aria-disabled="!isCheckDepartement || isSendingPresignup"
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

import { email as emailRegex, neph as nephRegex, phone as phoneRegex } from '@/util'
import {
  PRESIGNUP_REQUEST,
  SEND_MAGIC_LINK_REQUEST,
  SHOW_ERROR,
  SHOW_SUCCESS,
} from '@/store'

import AlreadySignedUp from './AlreadySignedUp'
import { mapState } from 'vuex'

export default {
  name: 'SignupForm',
  components: {
    AlreadySignedUp,
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
      nephPlaceholder: '',
      codeNeph: '',
      isCheckDepartement: false,
      nephRules: [
        v => nephRegex.test(v) || this.getMsg('preinscription_neph_erreur'),
      ],
      departement: undefined,
      departementRules: [
        dpt => !!dpt ||
          'Veuillez renseigner un département',
      ],
      nomPlaceholder: '',
      nomNaissance: '',
      prenomPlaceholder: '',
      prenom: '',
      emailPlaceholder: '',
      email: '',
      emailRules: [
        v => v !== '' || this.getMsg('preinscription_email_vide'),
        v => emailRegex.test(v) || this.getMsg('preinscription_email_erreur'),
      ],
      portablePlaceholder: '',
      portable: '',
      portableRules: [
        v => phoneRegex.test(v) || this.getMsg('preinscription_mobile_erreur'),
      ],
      valid: false,
      showDialog: false,

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
      return (state.departements && state.departements.list) ||
        ['38', '69', '75', '77', '78', '91', '92', '93', '94', '95']
    },
  }),

  methods: {
    getMsg (id) {
      return this.$formatMessage({ id })
    },
    setEmailPlaceholder () {
      this.emailPlaceholder = 'jean@dupont.fr'
    },
    removeEmailPlaceholder () {
      this.emailPlaceholder = ''
    },
    setNephPlaceholder () {
      this.nephPlaceholder = '012345678912'
    },
    removeNephPlaceholder () {
      this.nephPlaceholder = ''
    },
    setNomPlaceholder () {
      this.nomPlaceholder = 'Dupont'
    },
    removeNomPlaceholder () {
      this.nomPlaceholder = ''
    },
    setPrenomPlaceholder () {
      this.prenomPlaceholder = 'Jean'
    },
    removePrenomPlaceholder () {
      this.prenomPlaceholder = ''
    },
    setPortablePlaceholder () {
      this.portablePlaceholder = '0612345678'
    },
    removePortablePlaceholder () {
      this.portablePlaceholder = ''
    },
    setEmailToLowerCase () {
      this.email = this.email.toLowerCase().trim()
    },
    setNomNaissance () {
      this.nomNaissance = this.nomNaissance.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
      } = this

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
