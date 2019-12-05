<template>
  <div class="text-xs-center">
    <v-tooltip bottom>
      {{ tooltipContent }}
      <template v-slot:activator="{ on }">
        <v-btn
          class="t-select-place"
          color="white"
          dark
          v-on="on"
          @mouseenter="getCandidat"
          @click="$emit('click', inspecteurId, content)"
        >
          <v-icon :color="color">
            {{ icon }}
          </v-icon>
        </v-btn>
      </template>
    </v-tooltip>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import { FETCH_TOOLTIP_CANDIDAT_REQUEST } from '@/store'

export default {

  props: {
    content: {
      type: Object,
      default () {},
    },
    inspecteurId: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      color: '#A9A9A9',
      icon: '',
      isLoadingCandidat: false,
    }
  },

  computed: {
    ...mapState({
      candidat: (state) => state.candidats.tooltipCandidat || {},
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

  watch: {
    place (newVal) {
      this.setContext(newVal)
    },
  },

  mounted () {
    this.setContext(this.place)
  },

  methods: {
    setContext (place) {
      if (place === undefined) {
        this.color = '#A9A9A9'
        this.icon = 'block'
        return
      }
      if ('candidat' in place) {
        this.color = 'blue'
        this.icon = 'face'
        return
      }
      this.color = 'green'
      this.icon = 'check_circle'
    },

    async getCandidat () {
      this.isLoadingCandidat = true
      const candidatId = this.place && this.place.candidat
      const departement = this.$store.getters.activeDepartement
      if (candidatId) {
        await this.$store.dispatch(FETCH_TOOLTIP_CANDIDAT_REQUEST, { candidatId, departement })
      }
      this.isLoadingCandidat = false
    },
  },
}
</script>
