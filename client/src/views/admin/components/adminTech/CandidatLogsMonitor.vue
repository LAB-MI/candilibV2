<template>
  <div>
    <!-- <div
      v-for="logs in listLogs"
      :key="logs.date"
    >
      {{ logs.date }}
      {{ logs.content }}
    </div> -->

    <v-card>
      <!-- <wrapper-drag-and-resize
        :axe-x="5"
        :axe-y="70"
      > -->
      <v-toolbar
        color="black"
        dark
      >
        <v-toolbar-title>Informations de la journnée </v-toolbar-title>
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
          @click="getLogs()"
        >
          Actualiser
        </v-btn>
      </v-toolbar>

      <v-expansion-panels
        focusable
        multiple
      >
        <v-expansion-panel
          v-for="logs in listLogs"
          :key="logs.date"
        >
          <v-expansion-panel-header>{{ logs.date }}</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-tabs>
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
                  class="overflow-scroll  bg-black"
                >
                  <!-- <chart-bar /> -->

                  <!-- <chart-bar-vertical
                    :datasets="getSummaryNationalDatasets(logs.content.summaryNational)"
                    :labels="getSummaryNationalLabels(logs.content.summaryNational)"
                  /> -->
                  <v-card
                    v-for="item in logs.content.summaryNational"
                    :key="item.status"
                  >
                    <v-card-text>
                      <v-card-title primary-title>
                        Groupe: {{ Number(item.status) + 1 }}
                      </v-card-title>
                      <v-card-text>
                        Réservation: {{ item.infos['R'] || 0 }}
                        Modification: {{ item.infos['M'] || 0 }}
                        Annulation: {{ item.infos['A'] || 0 }}
                      </v-card-text>
                    </v-card-text>
                  </v-card>
                </v-card>
              </v-tab-item>

              <v-tab-item>
                <v-card
                  class="overflow-scroll  bg-black"
                >
                  <!-- <chart-bar /> -->

                  <v-card
                    v-for="logItem in logs.content.summaryByDepartement"
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
                            Réservation: {{ statusItem.infos['R'] || 0 }}
                            Modification: {{ statusItem.infos['M'] || 0 }}
                            Annulation: {{ statusItem.infos['A'] || 0 }}
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
                      class="overflow-scroll"
                    >
                      <!-- <chart-bar-vertical
                        :labels="labels"
                        :datasets="datasets"
                      /> -->

                      <div
                        v-for="range in logs.content.details"
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
                              Réservations: {{ item.logsContent['R'] || 0 }}
                            </v-card-text>
                            <v-card-text>
                              Modifications: {{ item.logsContent['M'] || 0 }}
                            </v-card-text>
                            <v-card-text>
                              Annulations: {{ item.logsContent['A'] || 0 }}
                            </v-card-text>
                          </v-card>
                        </v-card>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <big-loading-indicator :is-loading="isFetchingLogs" />
    </v-card>
  </div>
</template>

<script>
import { FETCH_LOGS_REQUEST } from '@/store'
import { mapState } from 'vuex'
import { BigLoadingIndicator /*, WrapperDragAndResize */ } from '@/components'

// import ChartBar from '../statsKpi/ChartBar.vue'
// import ChartBarVertical from '../statsKpi/ChartBarVertical.vue'
// import ActionDetailsByStatus from './ActionDetailsByStatus'
import { getFrenchLuxonCurrentDateTime } from '@/util'

export default {
  name: 'AdminTech',
  components: {
    BigLoadingIndicator,
    // WrapperDragAndResize,
    // ChartBar,
    // ChartBarVertical,
    // ActionDetailsByStatus,
  },

  data: () => ({
    dateStart: getFrenchLuxonCurrentDateTime().startOf('day').toISODate(),
    dateEnd: getFrenchLuxonCurrentDateTime().endOf('day').toISODate(),
    menuStart: false,
    menuEnd: false,
  }),

  computed: {
    ...mapState(['adminTech']),
    listLogs: state => state.adminTech.listLogs,
    isFetchingLogs: state => state.adminTech.isFetchingLogs,

    pickerDateStart () {
      return this.dateStart.split('-').reverse().join('/')
    },

    pickerDateEnd () {
      return this.dateEnd.split('-').reverse().join('/')
    },

    labels () {
      return ['Groupe 1', 'Groupe 2', 'Groupe 3', 'Groupe 4', 'Groupe 5', 'Groupe 6']
      // return this.listLogs
      //   .map(el => el.date)
    },

    datasets () {
      // this.listLogs
      return [
        {
          label: '# of Votes',
          // label: 'Places disponibles',
          borderWidth: 3,
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
        },
      ]
    },
  },

  watch: {
    dateStart (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.getLogs()
      }
    },

    dateEnd (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.getLogs()
      }
    },
  },

  mounted () {
    this.getLogs()
  },

  methods: {
    getLogs () {
      this.$store.dispatch(FETCH_LOGS_REQUEST, {
        start: this.dateStart,
        end: this.dateEnd,
      })
    },

    getSummaryNationalLabels (elements) {
      const lol = elements.map(el => `Groupe ${Number(el.status) + 1}`)
      return lol
    },

    getSummaryNationalDatasets (elements) {
      return elements.map(el => ({
        label: '# of Votes',
        // label: 'Places disponibles',
        borderWidth: 3,
        data: [el.infos.R || 0, el.infos.M || 0, el.infos.A || 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          // 'rgba(75, 192, 192, 0.2)',
          // 'rgba(153, 102, 255, 0.2)',
          // 'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          // 'rgba(75, 192, 192, 1)',
          // 'rgba(153, 102, 255, 1)',
          // 'rgba(255, 159, 64, 1)',
        ],
      }))
    },
  },
}
</script>
