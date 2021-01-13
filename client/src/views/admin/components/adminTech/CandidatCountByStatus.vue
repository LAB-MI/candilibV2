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
          <template v-slot:activator="{ on }">
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
          <template v-slot:activator="{ on }">
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
      class="overflow-scroll pa-4 flex"
    >
      <v-card-title primary-title>
        national
      </v-card-title>
      <v-card
        v-for="item in listCountStatus"
        :key="item.status"
      >
        <v-card-title primary-title>
          Groupe:  {{ Number(item.status) + 1 }}
        </v-card-title>
        <v-card-title primary-title>
          valeur: {{ item.count }}
        </v-card-title>
      </v-card>
    </div>
  </v-card>
</template>

<script>
import { FETCH_STATS_COUNT_STATUSES_REQUEST } from '@/store'
import { mapState } from 'vuex'
import { BigLoadingIndicator /*, WrapperDragAndResize */ } from '@/components'

// import ChartBar from '../statsKpi/ChartBar.vue'
// import ChartBarVertical from '../statsKpi/ChartBarVertical.vue'
import { getFrenchLuxonCurrentDateTime } from '@/util'

export default {
  name: 'CandidatCountByStatus',
  components: {
    BigLoadingIndicator,
    // WrapperDragAndResize,
    // ChartBar,
    // ChartBarVertical,
  },

  data: () => ({
    dateStart: getFrenchLuxonCurrentDateTime().startOf('day').toISODate(),
    dateEnd: getFrenchLuxonCurrentDateTime().endOf('day').toISODate(),
    menuStart: false,
    menuEnd: false,
  }),

  computed: {
    ...mapState(['adminTech']),
    listCountStatus: state => state.adminTech.listCountStatus,
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
