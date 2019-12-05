<template>
  <v-form
    v-model="valid"
    @submit.prevent="createdUser"
  >
    <v-container class="u-flex  u-flex--between  u-full-width">
      <v-text-field
        class="t-input-email"
        prepend-icon="email"
        aria-placeholder="jean@dupont.fr"
        hint="ex. : jean@dupont.fr"
        tabindex="0"
        v-model="email"
        :rules="emailRules"
        label="E-mail"
        @focus="setEmailPlaceholder"
        @blur="removeEmailPlaceholder"
        @input="setEmailToLowerCase"
        :placeholder="emailPlaceholder"
        required
      />

      <v-spacer />

      <v-select
        class="t-select-status"
        :items="availableStatuses"
        label="Statut"
        prepend-icon="person"
        aria-placeholder="Répartiteur"
        hint="ex. : repartiteur"
        tabindex="0"
        v-model="status"
        required
      />

      <v-spacer />

      <v-select
        class="t-select-departements"
        multiple
        :items="availableDepartements"
        label="Départements"
        prepend-icon="my_location"
        aria-placeholder="departements"
        hint="ex. : departements"
        tabindex="0"
        :rules="departementsRules"
        v-model="departements"
        required
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
import { email as emailRegex } from '@/util'

import {
  CREATE_USER_REQUEST,
} from '@/store'
import { mapState } from 'vuex'

const defaultAvailableStatuses = [
  {
    value: 'repartiteur',
    text: 'Répartiteur',
  },
  {
    value: 'delegue',
    text: 'Délégué',
  },
]

export default {
  data () {
    return {
      availableStatuses: defaultAvailableStatuses,
      departements: [],
      status: 'repartiteur',
      valid: false,
      departementsRules: [
        dpts => (!!dpts && !!dpts.length) ||
          'Veuillez renseigner au moins un département',
      ],
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
    availableDepartements (departements) {
      this.departements = departements
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
        this.departements = this.availableDepartements
        this.email = ''
      } catch (error) {
      }
    },
  },
}
</script>
