<template>
  <v-dialog
    v-model="isUpdating"
    width="800"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        slot="activator"
        :class="`t-btn-update-${departementId}`"
        color="primary"
        icon
        v-on="on"
      >
        <v-icon>edit</v-icon>
      </v-btn>
    </template>

    <v-form
      v-model="valid"
      @submit.prevent="updateDepartement"
    >
      <v-card>
        <v-card-title
          class="t-title-update headline grey lighten-2"
          primary-title
        >
          Modification de l'adresse couriel du departement &nbsp; <strong>{{ departementId }}</strong>
        </v-card-title>

        <v-container class="u-flex  u-flex--between  u-full-width">
          <v-spacer />
          <v-text-field
            v-model="newEmail"
            class="t-input-newEmail"
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

          <v-btn
            class="t-btn-cancel-update"
            color="#CD1338"
            tabindex="0"
            outlined
            @click="isUpdating = false"
          >
            Annuler
          </v-btn>
          <v-btn
            class="t-btn-update-confirm"
            color="primary"
            :disabled="!valid || newEmail === ''"
            :aria-disabled="!valid || newEmail === ''"
            @click="updateDepartement"
          >
            Modifier
          </v-btn>
        </v-container>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { UPDATE_DEPARTEMENT_REQUEST } from '@/store'
import { email as emailRegex } from '@/util'

export default {
  name: 'UpdateDepartement',

  props: {
    deprtId: {
      type: String,
      default: '',
    },
  },

  data () {
    return {
      departementId: this.deprtId,
      isUpdating: false,
      valid: false,
      newEmail: '',
      emailRules: [
        newEmail => newEmail ? (emailRegex.test(newEmail) || "L'adresse courriel doit être valide") : true,
      ],
      emailPlaceholder: '',
    }
  },

  methods: {
    async updateDepartement () {
      const {
        departementId,
        newEmail,
      } = this
      await this.$store.dispatch(UPDATE_DEPARTEMENT_REQUEST, { departementId, newEmail })
      this.isUpdating = false
    },
    setEmailPlaceholder () {
      this.emailPlaceholder = 'adressedela@repartition.fr'
    },
    removeEmailPlaceholder () {
      this.emailPlaceholder = ''
    },
    setEmailToLowerCase () {
      this.newEmail = this.newEmail.toLowerCase().trim()
    },
  },
}
</script>
