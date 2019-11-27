<template>
  <v-form v-model="valid" @submit.prevent="createdUser">
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
      ></v-text-field>

      <v-spacer></v-spacer>

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
        ></v-select>

      <v-spacer></v-spacer>
      <v-select
        class="t-select-departements"
        multiple
        :items="availableDepartements"
        label="Départements"
        prepend-icon="my_location"
        aria-placeholder="departements"
        hint="ex. : departements"
        tabindex="0"
        v-model="departements"
        required
        ></v-select>
      <v-spacer></v-spacer>

      <v-btn
        class="t-create-btn"
        type="submit"
        :disabled="isSendingUser"
        :aria-disabled="isSendingUser"
        dark
        color="#4CAF50"
        tabindex="0"
        raised
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

import { SHOW_ERROR, CREATE_USER_REQUEST, FETCH_USER_LIST_REQUEST, SHOW_SUCCESS } from '../../../../store'
import { mapState } from 'vuex'

export default {
  data () {
    return {
      availableStatuses: ['repartiteur', 'delegue'],
      departements: [],
      status: 'repartiteur',
      valid: false,
      email: '',
      emailRules: [
        v => !!v || 'Veuillez renseigner votre adresse courriel',
        v => emailRegex.test(v) || "L'adresse courriel doit être valide",
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
      if (!this.valid) {
        return this.$store.dispatch(SHOW_ERROR, 'Veuillez remplir le formulaire')
      }
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
        this.$store.dispatch(SHOW_SUCCESS, `L'utilisateur a bien été créé`)
        this.$store.dispatch(FETCH_USER_LIST_REQUEST)
      } catch (error) {
        this.$store.dispatch(SHOW_ERROR, error.message)
      }
    },
  },
}
</script>
