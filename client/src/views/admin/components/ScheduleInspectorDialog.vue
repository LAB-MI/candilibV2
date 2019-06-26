<template>
  <td class="text-xs-right">
    <div class="text-xs-center"
    >
      <v-tooltip bottom>
        {{ tooltipContent }}
          <template v-slot:activator="{ on }">
            <v-btn
              color="white"
              dark
              v-on="on"
              @mouseover="fetchCandidat"
              @click="getCandidat"
              @click.stop="dialog = true"

            >
              <v-icon :color="color">
                {{ icon }}
              </v-icon>
            </v-btn>
          </template>
      </v-tooltip>

      <div
      v-if ="dialog" >
          <shedule-inspector-dialog-content
            :closeDialog="closeDialog"
            :flagModal="flagModal"
            :icon="icon"
            :content="content"
            :selectedDate="selectedDate"
            :updateContent="updateContent"
            :inspecteurId="inspecteurId"
            :centreInfo="centreInfo"
          />

      </div>

    </div>
  </td>
</template>

<script>
import { mapState } from 'vuex'

import SheduleInspectorDialogContent from './SheduleInspectorDialogContent.vue'
import { FETCH_CANDIDAT_REQUEST } from '@/store'

export default {
  components: {
    SheduleInspectorDialogContent,
  },

  data () {
    return {
      color: '#A9A9A9',
      dialog: false,
      icon: '',
      flagModal: undefined,
      isLoadingCandidat: false,
    }
  },

  props: {
    content: Object,
    selectedDate: String,
    updateContent: Function,
    inspecteurId: String,
    centreInfo: Object,
  },

  computed: {
    ...mapState({
      candidat: (state) => state.candidats.candidat || {},
    }),

    place () {
      return this.content.place
    },

    tooltipContent () {
      if (this.isLoadingCandidat) {
        return 'chargement...'
      }

      const place = this.place

      if (!place) {
        return 'place indisponible'
      }

      if (place.candidat) {
        return `${this.candidat.prenom} ${this.candidat.nomNaissance} - ${this.candidat.codeNeph}`
      }

      if (place.inspecteur) {
        return 'place disponible'
      }

      return ''
    },
  },

  methods: {
    setContext (place) {
      if (place === undefined) {
        this.color = '#A9A9A9'
        this.flagModal = 'block'
        this.icon = 'block'
        return
      }
      if ('candidat' in place) {
        this.color = 'blue'
        this.flagModal = 'face'
        this.icon = 'face'
        return
      }
      this.color = 'green'
      this.flagModal = 'check'
      this.icon = 'check_circle'
    },

    getCandidat () {
      this.dialog = true
      this.fetchCandidat()
    },

    async fetchCandidat () {
      this.isLoadingCandidat = true
      const candidatId = this.place && this.place.candidat
      const departement = this.$store.state.admin.departements.active
      if (candidatId) {
        await this.$store.dispatch(FETCH_CANDIDAT_REQUEST, { candidatId, departement })
      }
      this.isLoadingCandidat = false
    },

    closeDialog () {
      this.dialog = false
    },
  },

  watch: {
    place (newVal) {
      this.setContext(newVal)
    },
  },

  mounted () {
    const place = this.place
    this.setContext(place)
  },
}
</script>
