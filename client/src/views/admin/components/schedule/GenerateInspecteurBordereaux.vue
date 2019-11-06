<template>
  <v-layout row justify-center>
    <v-btn
      color="info"
      dark
      @click.stop="dialog = true"

    >
      <span>
        {{ messageButton }}
        <strong>
          {{ activeDepartement }}
        </strong>
        &nbsp;
      </span>
      <v-icon>
        {{ iconButton }}
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
          {{ titleModal }}
          &nbsp;
          <strong>
            {{`${activeDepartement}`}}
          </strong>
        </v-card-title>
        <v-card-text>
          {{ modalText }}
          <strong v-if="!isForInspecteurs">
            {{ emailDepartementActive }}
          </strong>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            outlined
            color="info"
            :disabled="isGenerating"
            :aria-disabled="isGenerating"
            @click="dialog = false"
          >
            {{ cancelDialMsg }}
          </v-btn>
          <v-btn
            :aria-disabled="isGenerating"
            :disabled="isGenerating"
            type="submit"
            color="primary"
            @click="generateBordereaux"
          >
            {{ submitDialMsg }}
            &nbsp;
            <v-icon>
              {{ iconButton }}
            </v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import {
  GENERATE_INSPECTOR_BORDEREAUX_REQUEST,
} from '@/store'

import {
  getFrenchLuxonFromSql,
} from '@/util'

import messageAdmin from '@/admin'

export default {
  props: {
    date: String,
    isForInspecteurs: Boolean,
  },

  computed: {
    ...mapState({
      emailUser: state => state.admin.email,
      activeDepartement: state => state.admin.departements.active,
      isGenerating: state => state.adminBordereaux.isGenerating,
    }),
    ...mapGetters(['emailDepartementActive']),
  },

  data () {
    return {
      dialog: false,
      messageButton: '',
      iconButton: '',
      titleModal: '',
      modalText: '',
      submitDialMsg: messageAdmin.envoyer,
      cancelDialMsg: messageAdmin.annuler,
    }
  },

  methods: {
    async generateBordereaux () {
      await this.$store.dispatch(GENERATE_INSPECTOR_BORDEREAUX_REQUEST, {
        departement: this.activeDepartement,
        date: getFrenchLuxonFromSql(this.date).toISO(),
        isForInspecteurs: this.isForInspecteurs,
      })
      this.dialog = false
    },
  },

  mounted () {
    if (this.isForInspecteurs) {
      this.messageButton = messageAdmin.send_bordereaux
      this.iconButton = 'contact_mail'
      this.titleModal = messageAdmin.send_bordereaux
      this.modalText = messageAdmin.send_bordereaux_for_ipcsr_email
    } else {
      this.messageButton = messageAdmin.recevoir_les_bordereaux_inspecteurs
      this.iconButton = 'email'
      this.titleModal = messageAdmin.recevoir_les_bordereaux_inspecteurs
      this.modalText = messageAdmin.send_bordereaux_to_email
    }
  },
}
</script>
