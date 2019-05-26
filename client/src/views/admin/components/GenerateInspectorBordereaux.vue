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
      max-width="290"
    >
      <v-card>
        <v-card-title
          class="headline"
        >
          Lorem ipsum dolor sit amet
        </v-card-title>
        <v-card-text>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Accusamus ullam repellat eius reiciendis deserunt molestias
          impedit mollitia nemo explicabo, aliquam ipsam soluta, excepturi
          et necessitatibus, eaque dolores illo non? Delectus?
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
            Générer
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
