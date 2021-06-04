<template>
  <v-card>
    <v-toolbar
      class=""
      color="#272727"
      dark
    >
      <v-toolbar-title class="text-white">
        Denière connexion des candidats
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        color="primary"
        @click="getCounts()"
      >
        Lancer
      </v-btn>
    </v-toolbar>
    <big-loading-indicator :is-loading="isFetching" />
    <div
      v-show="counts.length"
      class="overflow-scroll"
    >
      <v-card-text>
        Total de candidats traités: {{ total }}
      </v-card-text>
      <v-card
        class="pa-4 flex"
      >
        <v-card>
          <v-card-title primary-title>
            Entre 60-90 jours
          </v-card-title>
          <v-card-text>
            {{ counts[1] }}
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-title primary-title>
            Entre 90-120 jours
          </v-card-title>
          <v-card-text>
            {{ counts[2] }}
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-title primary-title>
            Au delas 120 jours
          </v-card-title>
          <v-card-text>
            {{ counts[3] }}
          </v-card-text>
        </v-card>
      </v-card>
    </div>
  </v-card>
</template>
<script>
import { FETCH_STATS_COUNT_LAST_CONNECTIONS_REQUEST } from '@/store'
import { mapState } from 'vuex'
import { BigLoadingIndicator } from '@/components'

export default {
  name: 'CandidatLastConnections',
  components: {
    BigLoadingIndicator,
  },
  computed: {
    ...mapState(['adminTech']),
    counts: state => state.adminTech.listCountLastConnections,
    total: state => state.adminTech.totalCountLastConnections,
    isFetching: state => state.adminTech.isFetchingCountLastConnections,
  },
  methods: {
    getCounts () {
      this.$store.dispatch(FETCH_STATS_COUNT_LAST_CONNECTIONS_REQUEST)
    },
  },
}
</script>
