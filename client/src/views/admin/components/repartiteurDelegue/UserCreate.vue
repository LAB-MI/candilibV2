<template>
  <v-form
    ref="createUserForm"
    v-model="valid"
    @submit.prevent="createdUser"
  >
    <v-container class="u-flex  u-flex--between  u-full-width">
      <v-text-field
        v-model="email"
        class="t-input-email"
        prepend-icon="email"
        :aria-placeholder="emailPlaceholder"
        :hint="`ex. : ${emailPlaceholder}`"
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

      <select-status
        @change-status="newStatus => status = newStatus"
      />

      <v-spacer />

      <select-departements
        class="t-select-departements"
        multiple
        :available-departements="availableDepartements"
        :default-departements="availableDepartements"
        @change-departements="newDep => departements = newDep"
      />

      <v-spacer />

      <v-btn
        class="t-create-btn"
        type="submit"
        :disabled="!valid || isSendingUser"
        :aria-disabled="!valid || isSendingUser"
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

import { email as emailRegex } from '@/util'

import SelectStatus from './SelectStatus'
import SelectDepartements from '../SelectDepartements'

import {
  CREATE_USER_REQUEST,
} from '@/store'

export default {
  components: {
    SelectStatus,
    SelectDepartements,
  },

  data () {
    return {
      departements: [],
      status: 'repartiteur',
      valid: false,
      email: '',
      emailRules: [
        email => !!email || 'Veuillez renseigner votre adresse courriel',
        email => emailRegex.test(email) || "L'adresse courriel doit être valide",
      ],
      emailPlaceholder: '',
    }
  },

  computed: {
    ...mapState({
      availableDepartements: state => state.admin.departements.list,
    }),
    isSendingUser () {
      return this.$store.state.users.isSendingUser || false
    },
  },

  watch: {
    availableDepartements (value) {
      this.departements = value
    },
  },

  methods: {
    setEmailPlaceholder () {
      this.emailPlaceholder = 'jean@dupont.fr'
    },

    removeEmailPlaceholder () {
      this.emailPlaceholder = ''
    },

    setEmailToLowerCase () {
      this.email = this.email.toLowerCase().trim()
    },

    async createdUser () {
      const {
        email,
        departements,
        status,
      } = this

      try {
        await this.$store.dispatch(CREATE_USER_REQUEST, {
          email,
          departements,
          status,
        })
        this.$refs.createUserForm.reset()
        this.departements = this.availableDepartements
      } catch (error) {
      }
    },
  },
}
</script>
