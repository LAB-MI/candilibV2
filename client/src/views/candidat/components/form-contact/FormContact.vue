<template>
  <div>
    Page de contact
    <v-form
      ref="presignupForm"
      v-model="valid"
      dark
      class="t-presignup-form presignup-form"
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
          @change="removeSpaceCodeNeph"
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
        <select-departement
          :dark="true"
          class="t-select-departements"
          :available-departements="availableDepartements"
          :multiple="false"
          label="Mon département de résidence"
          prepend-icon="location_city"
          aria-placeholder="93"
          :persistent-hint="true"
          :rules="departementRules"
          required
          @change-departements="newDep => departement = newDep "
        />
      </div>
      <div class="form-input">
        <v-textarea
          outlined
          name="input-7-4"
          label="Message:"
          :value="messageContent"
        />
      </div>
    </v-form>
  </div>
</template>

<script>
import { email as emailRegex, neph as nephRegex } from '@/util'
import SelectDepartement from '@/views/admin/components/SelectDepartements'

import {
  PRESIGNUP_REQUEST,
  SHOW_ERROR,
} from '@/store'

export default {
  components: {
    SelectDepartement,
  },
  data () {
    return {
      messageContent: '',
      nephPlaceholder: '',
      codeNeph: '',
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
      emailPlaceholder: '',
      email: '',
      emailRules: [
        v => v !== '' || this.getMsg('preinscription_email_vide'),
        v => emailRegex.test(v) || this.getMsg('preinscription_email_erreur'),
      ],

      // ----------------------------------------------------------------------
      magicLinkValid: false,
      valid: false,
      showDialog: false,
    }
  },

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
    removeSpaceCodeNeph (value) {
      this.codeNeph = value.replace(/ /g, '')
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
