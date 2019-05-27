<template>
  <v-layout row justify-center>
    <v-btn
      color="info"
      dark
      @click.stop="dialog = true"

    >
      <span>
        Générer les bordereaux inspecteurs
        <strong>
          {{ `du ${activeDepartement}` }}
        </strong>
        &nbsp;
      </span>
      <v-icon>
        email
      </v-icon>
    </v-btn>
    <v-dialog
      v-model="dialog"
      max-width="580"
    >
      <v-card>
        <v-card-title
          class="headline"
        >
          Les borderaux inspecteurs &nbsp; <strong>{{ ` du ${activeDepartement}` }} </strong>
        </v-card-title>
        <v-card-text>
          Les boderaux inspecteurs seront envoyés à l'adresse {{emailUser}}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            outline
            color="info"
            :disabled="isGenerating"
            :aria-disabled="isGenerating"
            @click="dialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            :aria-disabled="isGenerating"
            :disabled="isGenerating"
            type="submit"
            color="primary"
            @click="generateBordereaux"
          >
            Envoyer
            &nbsp;
            <v-icon>
              email
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import {
  GENERATE_INSPECTOR_BORDEREAUX_REQUEST,
} from '@/store'

import {
  getFrenchLuxonDateTimeFromSql,
} from '@/util'

export default {
  props: {
    date: String,
  },

  computed: {
    emailUser () {
      return this.$store.state.admin.email
    },
    activeDepartement () {
      return this.$store.state.admin.departements.active
    },

    isGenerating () {
      return this.$store.state.adminBordereaux.isGenerating
    },
  },

  data () {
    return {
      dialog: false,
    }
  },

  methods: {
    async generateBordereaux () {
      await this.$store.dispatch(GENERATE_INSPECTOR_BORDEREAUX_REQUEST, {
        departement: this.activeDepartement,
        date: getFrenchLuxonDateTimeFromSql(this.date).toISO(),
      })
      this.dialog = false
    },
  },
}
</script>
