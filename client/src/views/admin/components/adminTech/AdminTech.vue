<template>
  <div>
    <v-card>
      <v-card-title
        primary-title
        class="bg-black"
      >
        <span class="text-white">
          Section 1
        </span>
        <v-spacer />
        <v-btn
          color="primary"
          @click="getLogs()"
        >
          Rafrechir
        </v-btn>
      </v-card-title>
      <big-loading-indicator :is-loading="isFetchingLogs" />
      <div
        class="h-64 overflow-scroll"
      >
        <div
          v-for="range in listLogs"
          :key="`${range.begin}_${range.end}`"
          class="pa-2 flex-wrap bg-gray-700"
        >
          <v-card-title>
            <span class="text-white">
              {{ `De ${range.begin} à ${range.end}` }}
            </span>
          </v-card-title>
          <v-card
            v-for="departementLogs in range.departements"

            :key="departementLogs.departement"
            class="pa-4 flex"
          >
            <v-card-title
              primary-title
              class="mr-5"
            >
              {{ departementLogs.departement }}
            </v-card-title>
            <v-card
              v-for="item in departementLogs.statusesInfo"
              :key="item.status"
            >
              <v-card-title primary-title>
                Statut {{ Number(item.status) + 1 }}
              </v-card-title>
              <v-card-text>
                Réservation: {{ item.logsContent['RESERVATION'] || 0 }}
              </v-card-text>
              <v-card-text>
                Modification: {{ item.logsContent['MODIFICATION'] || 0 }}
              </v-card-text>
              <v-card-text>
                Annulation: {{ item.logsContent['REMOVED'] || 0 }}
              </v-card-text>
            </v-card>
          </v-card>
        </div>
      </div>
    </v-card>

    <v-card>
      <v-card-title
        primary-title
        class="bg-black"
      >
        <span class="text-white">
          Section 2
        </span>
        <v-spacer />
        <v-btn
          color="primary"
          @click="getCountStatus()"
        >
          Rafrechir
        </v-btn>
      </v-card-title>
      <big-loading-indicator :is-loading="isFetchingCountStatus" />

      <v-card-title primary-title>
        nationale
      </v-card-title>
      <div
        v-for="item in listCountStatus"
        :key="item.status"
      >
        <v-card-title primary-title>
          Status:  {{ Number(item.status) + 1 }}
        </v-card-title>
        <v-card-title primary-title>
          count: {{ item.count }}
        </v-card-title>
      </div>
    </v-card>
  </div>
</template>

<script>
import { FETCH_LOGS_REQUEST, FETCH_STATS_COUNT_STATUSES_REQUEST } from '@/store'
import { mapState } from 'vuex'
import { BigLoadingIndicator } from '@/components'

export default {
  name: 'AdminTech',
  components: {
    BigLoadingIndicator,
  },
  computed: {
    ...mapState(['adminTech']),
    listLogs: state => state.adminTech.listLogs,
    listCountStatus: state => state.adminTech.listCountStatus,
    isFetchingLogs: state => state.adminTech.isFetchingLogs,
    isFetchingCountStatus: state => state.adminTech.isFetchingCountStatus,
  },
  beforeMount () {
    this.$store.dispatch(FETCH_LOGS_REQUEST)
  },
  methods: {
    getLogs () {
      this.$store.dispatch(FETCH_LOGS_REQUEST)
    },
    getCountStatus () {
      this.$store.dispatch(FETCH_STATS_COUNT_STATUSES_REQUEST)
    },
  },
}
</script>
