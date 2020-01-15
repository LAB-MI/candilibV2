<template>
  <v-card>
    <v-form
      v-model="valid"
      @submit.prevent="createdDepartement"
    >
      <v-container class="u-flex  u-flex--between  u-full-width">
        <v-text-field
          v-model="departementId"
          class="t-input-departementId"
          prepend-icon="location_searching"
          aria-placeholder="93"
          hint="ex. : 93"
          tabindex="0"
          label="Département"
          required
          :placeholder="departementPlaceholder"
          :rules="departementRules"
          @focus="setDepartementPlaceholder"
          @blur="removeDepartementPlaceholder"
        />
        <v-spacer />
        <v-text-field
          v-model="departementEmail"
          class="t-input-email"
          prepend-icon="email"
          aria-placeholder="adressedela@repartition.fr"
          hint="ex. : adressedela@repartition.fr"
          tabindex="0"
          :rules="emailRules"
          label="E-mail"
          :placeholder="emailPlaceholder"
          @input="setEmailToLowerCase"
        />

        <v-spacer />

        <v-spacer />

        <v-btn
          class="t-create-btn"
          type="submit"
          :disabled="!valid || departementId === '' || departementEmail === ''"
          :aria-disabled="!valid || departementId === '' || departementEmail === ''"
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
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

import { CREATE_DEPARTEMENT_REQUEST } from '@/store'
import {
  email as emailRegex,
} from '@/util'

export default {
  name: 'CreateDepartement',

  data () {
    return {
      departements: [],
      valid: false,
      departementId: '',
      departementPlaceholder: '',
      emailPlaceholder: '',
      departementEmail: '',
      emailRules: [
        departementEmail => departementEmail ? (emailRegex.test(departementEmail) || "L'adresse courriel doit être valide") : true,
      ],
      departementRules: [
        departementId => !!departementId || 'Veuillez renseigner le numéro département',
      ],
    }
  },

  computed: {
    ...mapState({
      isFetching: state => state.adminDepartements.isFetching,
      departementList: state => state.adminDepartements.list,
    }),
  },

  methods: {
    setEmailPlaceholder () {
      this.emailPlaceholder = 'adressedela@repartition.fr'
    },

    setDepartementPlaceholder () {
      this.departementPlaceholder = '93'
    },

    removeEmailPlaceholder () {
      this.emailPlaceholder = ''
    },

    removeDepartementPlaceholder () {
      this.departementPlaceholder = ''
    },

    setEmailToLowerCase () {
      this.departementEmail = this.departementEmail.toLowerCase().trim()
    },

    async createdDepartement () {
      const {
        departementId,
        departementEmail,
      } = this

      await this.$store.dispatch(CREATE_DEPARTEMENT_REQUEST, { departementId: departementId.trim(), departementEmail: departementEmail.trim() })
      this.departementId = null
      this.departementEmail = ''
    },
  },
}
</script>
