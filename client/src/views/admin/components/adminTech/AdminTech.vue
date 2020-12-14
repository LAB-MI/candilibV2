<template>
  <div>
    <v-card>
      <v-toolbar
        color="black"
        dark
      >
        <v-toolbar-title>Informations de la journnée </v-toolbar-title>
        <v-spacer />
        <v-btn
          color="primary"
          @click="getLogs()"
        >
          Actualiser
        </v-btn>
      </v-toolbar>
      <v-tabs vertical>
        <v-tab>
          National
        </v-tab>
        <v-tab>
          Par département
        </v-tab>
        <v-tab>
          Par tranche
        </v-tab>
        <v-tab-item>
          <v-card
            class="h-64 overflow-scroll  bg-black"
          >
            <v-card
              v-for="item in listLogs.summaryNational"
              :key="item.status"
            >
              <v-card-text>
                <v-card-title primary-title>
                  Groupe: {{ Number(item.status) + 1 }}
                </v-card-title>
                <v-card-text>
                  Réservation: {{ item.infos['R'] }}
                  Modification: {{ item.infos['M'] }}
                  Annulation: {{ item.infos['A'] }}
                </v-card-text>
              </v-card-text>
            </v-card>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card
            class="h-64 overflow-scroll  bg-black"
          >
            <v-card
              v-for="logItem in listLogs.summaryByDepartement"
              :key="logItem.dpt"
              class="flex flex-col"
            >
              <v-card-title
                primary-title
              >
                {{ logItem.dpt }}
              </v-card-title>
              <v-card-text
                v-for="statusItem in logItem.content"
                :key="statusItem.status"
              >
                <span>
                  <v-card>
                    <v-card-title primary-title>
                      Groupe: {{ Number(statusItem.status) + 1 }}
                    </v-card-title>
                    <v-card-text>
                      Réservation: {{ statusItem.infos['R'] }}
                      Modification: {{ statusItem.infos['M'] }}
                      Annulation: {{ statusItem.infos['A'] }}
                    </v-card-text>
                  </v-card>
                </span>
              </v-card-text>
            </v-card>
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card>
            <v-card-text>
              <div
                class="h-64 overflow-scroll"
              >
                <div
                  v-for="range in listLogs.details"
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
                        Groupe {{ Number(item.status) + 1 }}
                      </v-card-title>
                      <v-card-text>
                        Réservations: {{ item.logsContent['R'] }}
                      </v-card-text>
                      <v-card-text>
                        Modifications: {{ item.logsContent['M'] }}
                      </v-card-text>
                      <v-card-text>
                        Annulations: {{ item.logsContent['A'] }}
                      </v-card-text>
                    </v-card>
                  </v-card>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
      <big-loading-indicator :is-loading="isFetchingLogs" />
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
          Actualiser
        </v-btn>
      </v-card-title>
      <big-loading-indicator :is-loading="isFetchingCountStatus" />
      <div
        class="h-64 overflow-scroll pa-4 flex"
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
  mounted () {
    this.getLogs()
    this.getCountStatus()
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
