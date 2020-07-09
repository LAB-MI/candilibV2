<template>
  <div class="form-group-input-candidat">
    * Champs obligatoires
    <slot name="before" />
    <div class="form-input">
      <v-text-field
        v-model="codeNeph"
        :label="`${getMsg('preinscription_neph')} *`"
        prepend-icon="assignment"
        :dark="dark"
        :color="dark?'#fff':''"
        :placeholder="nephPlaceholder"
        aria-placeholder="012345678912"
        :autofocus="!showDialog"
        hint="ex. : 0123456789"
        required
        :rules="nephRules"
        tabindex="1"
        :readonly="readonly"
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
        :dark="dark"
        :color="dark?'#fff':''"
        :placeholder="nomPlaceholder"
        aria-placeholder="Dupont"
        hint="ex. : Dupont"
        required
        :rules="lastNameRules"
        tabindex="2"
        :readonly="readonly"
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
        :dark="dark"
        :color="dark?'#fff':''"
        :placeholder="prenomPlaceholder"
        aria-placeholder="Jean"
        hint="ex. : Jean"
        required
        :rules="firstNameRules"
        tabindex="3"
        :readonly="readonly"
        @focus="setPrenomPlaceholder"
        @blur="removePrenomPlaceholder"
      />
    </div>
    <div class="form-input">
      <v-text-field
        v-model="email"
        :label="`${getMsg('preinscription_email')} *`"
        prepend-icon="email"
        :dark="dark"
        :color="dark?'#fff':''"
        :placeholder="emailPlaceholder"
        aria-placeholder="jean@dupont.fr"
        hint="ex. : jean@dupont.fr"
        required
        :rules="emailRules"
        tabindex="4"
        :readonly="readonly"
        @focus="setEmailPlaceholder"
        @blur="removeEmailPlaceholder"
        @input="setEmailToLowerCase"
      />
    </div>

    <div
      class="form-input"
    >
      <v-text-field
        v-model="portable"
        :label="`${getMsg('preinscription_mobile') + (portableRequired?' *':'')}`"
        prepend-icon="smartphone"
        :dark="dark"
        :color="dark?'#fff':''"
        :placeholder="portablePlaceholder"
        aria-placeholder="Jean"
        hint="ex. : 0612345678"
        :required="portableRequired"
        tabindex="5"
        :rules="portableRules"
        :readonly="readonly"
        @focus="setPortablePlaceholder"
        @blur="removePortablePlaceholder"
      />
    </div>
    <div class="form-input">
      <select-departement
        :dark="dark"
        class="t-select-departements"
        :available-departements="availableDepartements"
        :multiple="false"
        :label="`${getMsg('preinscription_departement')} *`"
        prepend-icon="location_city"
        aria-placeholder="93"
        :persistent-hint="true"
        :rules="departementRules"
        required
        :default-departement="departement"
        :readonly="readonly"
        tabindex="6"
        :hint="`${getMsg('preinscription_departement_hint')}`"
        @change-departements="setDepartement"
      />
    </div>
  </div>
</template>
<script>
import { email as emailRegex, neph as nephRegex, phone as phoneRegex, firstNameAndLastName as firstNameAndLastNameRegex } from '@/util'
import SelectDepartement from '@/views/admin/components/SelectDepartements'
export default {
  name: 'FormGroupInfoCandidat',
  components: {
    SelectDepartement,
  },
  props: {
    availableDepartements: {
      type: Array,
      default () {},
    },
    value: {
      type: Object,
      default: () => ({}),
    },
    dark: {
      type: Boolean,
      default: false,
    },
    isContact: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    showDialog: {
      type: Boolean,
      default: false,
    },
  },
  data: function () {
    return {
      nephPlaceholder: '',
      nephRules: [
        v => nephRegex.test(v) || this.getMsg('preinscription_neph_erreur'),
      ],
      departementRules: [
        dpt => !!dpt ||
          'Veuillez renseigner un département',
      ],
      nomPlaceholder: '',
      lastNameRules: [
        v => v !== '' || this.getMsg('preinscription_nom_naissance_vide'),
        v => !firstNameAndLastNameRegex.test(v) || this.getMsg('preinscription_nom_naissance_erreur'),
      ],
      prenomPlaceholder: '',
      firstNameRules: [
        v => v !== '' || this.getMsg('preinscription_prenom_vide'),
        v => !firstNameAndLastNameRegex.test(v) || this.getMsg('preinscription_prenom_erreur'),
      ],
      emailPlaceholder: '',
      emailRules: [
        v => v !== '' || this.getMsg('preinscription_email_vide'),
        v => emailRegex.test(v) || this.getMsg('preinscription_email_erreur'),
      ],
      portablePlaceholder: '',
      portableRequired: !this.isContact,
      portableRules: [
        v => (!this.portableRequired && (v ? v.length === 0 : true)) || phoneRegex.test(v) || this.getMsg('preinscription_mobile_erreur'),
      ],
      codeNeph: this.value && this.value.codeNeph,
      nomNaissance: this.value && this.value.nomNaissance,
      prenom: this.value && this.value.prenom,
      email: this.value && this.value.email,
      portable: this.value && this.value.portable,
      departement: this.value && this.value.departement,
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
      this.sendValues()
    },
    setNephPlaceholder () {
      this.nephPlaceholder = '012345678912'
    },
    removeNephPlaceholder () {
      this.nephPlaceholder = ''
      this.sendValues()
    },
    setNomPlaceholder () {
      this.nomPlaceholder = 'Dupont'
    },
    removeNomPlaceholder () {
      this.nomPlaceholder = ''
      this.sendValues()
    },
    setPrenomPlaceholder () {
      this.prenomPlaceholder = 'Jean'
    },
    removePrenomPlaceholder () {
      this.prenomPlaceholder = ''
      this.sendValues()
    },
    setPortablePlaceholder () {
      this.portablePlaceholder = '0612345678'
    },
    removePortablePlaceholder () {
      this.portablePlaceholder = ''
      this.sendValues()
    },
    setEmailToLowerCase () {
      this.email = this.email.toLowerCase().trim()
    },
    setNomNaissance () {
      this.nomNaissance = this.nomNaissance.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()
    },
    removeSpaceCodeNeph (value) {
      this.codeNeph = value.replace(/ /g, '')
    },
    sendValues () {
      const {
        codeNeph,
        nomNaissance,
        prenom,
        email,
        departement,
        portable,
      } = this

      this.$emit('input', {
        codeNeph,
        nomNaissance,
        prenom,
        email,
        departement,
        portable,
      })
    },
    setDepartement (newDep) {
      this.departement = newDep
      this.sendValues()
    },
  },
}
</script>
<style lang="postcss" scoped>
.form-group-input-candidat {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
</style>
