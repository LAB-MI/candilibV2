<template>
  <v-card>
    <v-toolbar
      class=""
      color="#272727"
      dark
    >
      <v-toolbar-title class="text-white">
        Nombre de candidat par groupe
      </v-toolbar-title>
      <v-spacer />
      <v-toolbar-title class="u-flex pa-5 mt-10">
        <v-menu
          v-model="menuStart"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          readonly
          min-width="290px"
        >
          <template #activator="{ on }">
            <v-text-field
              v-model="pickerDateStart"
              label="Date de début de période"
              prepend-icon="event"
              readonly
              v-on="on"
            />
          </template>

          <v-date-picker
            v-model="dateStart"
            locale="fr"
            @input="menuStart = false"
          />
        </v-menu>

        <v-menu
          v-model="menuEnd"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          readonly
          min-width="290px"
        >
          <template #activator="{ on }">
            <v-text-field
              v-model="pickerDateEnd"
              label="Date de fin de période"
              prepend-icon="event"
              readonly
              v-on="on"
            />
          </template>

          <v-date-picker
            v-model="dateEnd"
            color="red"
            locale="fr"
            @input="menuEnd = false"
          />
        </v-menu>
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        color="primary"
        @click="getCountStatus()"
      >
        Actualiser
      </v-btn>
    </v-toolbar>
    <big-loading-indicator :is-loading="isFetchingCountStatus" />
    <div
      class="overflow-scroll"
    >
      <v-card-title primary-title>
        Nationale
      </v-card-title>
      <details-content-national :list-logs="listCountStatus" />
    </div>
  </v-card>
</template>

<script>
import { FETCH_STATS_COUNT_STATUSES_REQUEST } from '@/store'
import { mapState } from 'vuex'
import { BigLoadingIndicator } from '@/components'
import { getFrenchLuxonCurrentDateTime } from '@/util'
import DetailsContentNational from './DetailsContentNational.vue'

export default {
  name: 'CandidatCountByStatus',
  components: {
    BigLoadingIndicator,
    DetailsContentNational,
  },

  data: () => ({
    dateStart: getFrenchLuxonCurrentDateTime().minus({ days: 1 }).startOf('day').toISODate(),
    dateEnd: getFrenchLuxonCurrentDateTime().endOf('day').toISODate(),
    menuStart: false,
    menuEnd: false,
  }),

  computed: {
    ...mapState(['adminTech']),
    listCountStatus: state => { return state.adminTech.listCountStatusByDays },
    isFetchingCountStatus: state => state.adminTech.isFetchingCountStatus,

    pickerDateStart () {
      return this.dateStart.split('-').reverse().join('/')
    },

    pickerDateEnd () {
      return this.dateEnd.split('-').reverse().join('/')
    },
  },

  watch: {
    dateStart (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.getCountStatus()
      }
    },

    dateEnd (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.getCountStatus()
      }
    },
  },

  mounted () {
    this.getCountStatus()
  },

  methods: {
    getCountStatus () {
      this.$store.dispatch(FETCH_STATS_COUNT_STATUSES_REQUEST, {
        start: this.dateStart,
        end: this.dateEnd,
      })
    },
  },
}
</script>
