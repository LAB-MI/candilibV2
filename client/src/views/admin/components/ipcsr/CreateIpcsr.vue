<template>
  <v-form
    ref="createIpcsrForm"
    v-model="valid"
    @submit.prevent="createIpcsr"
  >
    <v-container class="u-flex  u-flex--between  u-full-width">
      <v-text-field
        ref="email"
        v-model="email"
        class="t-input-ipcsr-email"
        prepend-icon="email"
        aria-placeholder="jean@dupont.fr"
        hint="ex. : jean@dupont.fr"
        tabindex="0"
        :rules="emailRules"
        label="Adresse courriel"
        :placeholder="emailPlaceholder"
        required
        @focus="setEmailPlaceholder"
        @blur="removeEmailPlaceholder"
        @input="setEmailToLowerCase"
      />

      <v-spacer />

      <v-text-field
        v-model="prenom"
        class="t-input-ipcsr-firstname"
        prepend-icon="perm_identity"
        hint="ex. : Jean"
        tabindex="0"
        label="Prénom"
        :aria-placeholder="prenomPlaceholder"
        :placeholder="prenomPlaceholder"
        required
        @focus="setPrenomPlaceholder"
        @blur="removePrenomPlaceholder"
      />

      <v-spacer />

      <v-text-field
        v-model="nom"
        class="t-input-ipcsr-name"
        prepend-icon="account_box"
        hint="ex. : Dupont"
        tabindex="0"
        label="Nom"
        :aria-placeholder="nomPlaceholder"
        :placeholder="nomPlaceholder"
        required
        @focus="setNomPlaceholder"
        @blur="removeNomPlaceholder"
      />

      <v-spacer />

      <v-text-field
        ref="matricule"
        v-model="matricule"
        class="t-input-ipcsr-matricule"
        prepend-icon="confirmation_number"
        hint="ex. : 0954390439"
        tabindex="0"
        :rules="matriculeRules"
        label="Matricule"
        :aria-placeholder="prenomPlaceholder"
        :placeholder="matriculePlaceholder"
        required
        @focus="setMatriculePlaceholder"
        @blur="removeMatriculePlaceholder"
      />

      <v-spacer />

      <select-departements
        ref="ipcsrDepartement"
        class="select-departement  t-select-ipcsr-departement"
        :available-departements="availableDepartements"
        :default-departement="availableDepartements[0]"
        @change-departements="newDep => departement = newDep"
      />

      <v-spacer />

      <v-btn
        class="t-create-ipcsr-btn"
        type="submit"
        :disabled="!valid || isCreatingIpcsr"
        :aria-disabled="!valid || isCreatingIpcsr"
        tabindex="0"
        raised
        color="success"
      >
        Ajouter
        <v-icon>
          add_circle
        </v-icon>
      </v-btn>
    </v-container>
  </v-form>
</template>

<script>
import { mapState } from 'vuex'

import {
  email as emailRegex,
  matricule as matriculeRegex,
} from '@/util'

import SelectDepartements from '../SelectDepartements'

import {
  CREATE_IPCSR_REQUEST,
  FETCH_IPCSR_LIST_REQUEST,
  SHOW_SUCCESS,
  SHOW_ERROR,
} from '@/store'

export default {
  components: {
    SelectDepartements,
  },

  data () {
    return {
      departement: undefined,
      status: 'repartiteur',
      valid: false,
      email: '',
      emailRules: [
        email => !!email || 'Veuillez renseigner votre adresse courriel',
        email => emailRegex.test(email) || "L'adresse courriel doit être valide",
      ],
      emailPlaceholder: '',
      matricule: '',
      matriculePlaceholder: '',
      matriculeRules: [
        matricule => !!matricule || 'Veuillez renseigner un matricule',
        matricule => matriculeRegex.test(matricule) || 'Veuillez renseigner un matricule valide',
      ],
      nom: '',
      nomPlaceholder: '',
      nomRules: [
        nom => !!nom || 'Veuillez renseigner un nom',
      ],
      prenom: '',
      prenomPlaceholder: '',
      prenomRules: [
        prenom => !!prenom || 'Veuillez renseigner un prénom',
      ],
    }
  },

  computed: {
    ...mapState({
      availableDepartements: state => state.admin.departements.list,
      isCreatingIpcsr: state => !!state.admin.inspecteurs.isCreatingIpcsr,
    }),
  },

  watch: {
    availableDepartements (departements) {
      this.departement = departements[0]
    },
  },

  methods: {
    removeEmailPlaceholder () {
      this.emailPlaceholder = ''
    },
    setEmailPlaceholder () {
      this.emailPlaceholder = 'admin@example.com'
    },
    setEmailToLowerCase () {
      this.email = this.email && this.email.toLowerCase()
    },

    setMatriculePlaceholder () {
      this.matriculePlaceholder = '038448502534'
    },
    removeMatriculePlaceholder () {
      this.matriculePlaceholder = ''
    },

    setPrenomPlaceholder () {
      this.prenomPlaceholder = 'Jean'
    },
    removePrenomPlaceholder () {
      this.prenomPlaceholder = ''
    },

    setNomPlaceholder () {
      this.nomPlaceholder = 'Dupont'
    },
    removeNomPlaceholder () {
      this.nomPlaceholder = ''
    },

    async createIpcsr () {
      const {
        departement = this.availableDepartements[0],
        email,
        matricule,
        nom,
        prenom,
      } = this

      try {
        await this.$store.dispatch(CREATE_IPCSR_REQUEST, {
          departement,
          email,
          matricule,
          nom,
          prenom,
        })
        this.$store.dispatch(SHOW_SUCCESS, "L'IPCSR a bien été créé")
        this.$refs.createIpcsrForm.reset()
        this.departement = this.availableDepartements[0]
        this.$refs.ipcsrDepartement.defaultDepartement = this.departement

        await this.$store.dispatch(FETCH_IPCSR_LIST_REQUEST)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
.select-departement {
  flex-basis: 4em;
}
</style>
