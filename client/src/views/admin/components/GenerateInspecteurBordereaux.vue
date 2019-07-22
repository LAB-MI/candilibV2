<template>
  <v-layout row justify-center>
    <v-btn
      :color="isForInspecteurs ? 'info' : 'info'"
      dark
      @click.stop="dialog = true"

    >
      <span v-if="isForInspecteurs">
        Envoyer les bordereaux aux inspecteurs du
        <strong>
          {{ activeDepartement }}
        </strong>
        &nbsp;
      </span>
      <span v-else>
        Recevoir les bordereaux des inspecteurs du
        <strong>
          {{ activeDepartement }}
        </strong>
        &nbsp;
      </span>
      <v-icon v-if="isForInspecteurs">
        contact_mail
      </v-icon>
      <v-icon v-else>
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
          Les bordereaux inspecteurs du&nbsp;<strong>{{`${activeDepartement}`}} </strong>
        </v-card-title>
        <v-card-text v-if="isForInspecteurs">
          Les bordereaux seront envoyés aux adresses emails de chaque inspecteurs
        </v-card-text>
        <v-card-text v-else>
          Les bordereaux inspecteurs seront envoyés à l'adresse email: <strong>{{ emailDepartement }}</strong>
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
import { mapState } from 'vuex'
import {
  GENERATE_INSPECTOR_BORDEREAUX_REQUEST,
} from '@/store'

import {
  getFrenchLuxonFromSql,
} from '@/util'

export default {
  props: {
    date: String,
    isForInspecteurs: Boolean,
  },

  computed:
    mapState({
      emailUser: state => state.admin.email,
      activeDepartement: state => state.admin.departements.active,
      emailDepartement: state => state.admin.departements.emailActive,
      isGenerating: state => state.adminBordereaux.isGenerating,
    }),

  data () {
    return {
      dialog: false,
    }
  },

  methods: {
    async generateBordereaux (flag) {
      await this.$store.dispatch(GENERATE_INSPECTOR_BORDEREAUX_REQUEST, {
        departement: this.activeDepartement,
        date: getFrenchLuxonFromSql(this.date).toISO(),
        isForInspecteurs: this.isForInspecteurs,
      })
      this.dialog = false
    },
  },
}
</script>
