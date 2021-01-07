<template>
  <div>
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

      <chart-bar-vertical
        :labels="labelsSummaryNational"
        :datasets="datasetsSummaryNational"
      />

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
      <!-- TODO: FOR THE NEXT MEP -->
      <!-- <div
        v-for="logs in getDataByDepartement()"
        :key="logs.dpt"
      >
        <h4>
          Département: {{ logs.dpt }}
        </h4>
        <chart-bar-vertical
          :labels="getLabelsByDepartement(logs.datesInfo)"
          :datasets="getChartDatasetsByDepartement(logs.datesInfo)"
        />
      </div> -->
      <!--  -->
    </v-card>
  </div>
</template>

<script>
import { FETCH_LOGS_REQUEST } from '@/store'
import { mapState } from 'vuex'
import { BigLoadingIndicator /*, WrapperDragAndResize */ } from '@/components'

// import ChartBar from '../statsKpi/ChartBar.vue'
import ChartBarVertical from '../statsKpi/ChartBarVertical.vue'
// import ActionDetailsByStatus from './ActionDetailsByStatus'
import { getFrenchLuxonCurrentDateTime } from '@/util'

export default {
  name: 'AdminTech',
  components: {
    BigLoadingIndicator,
    // WrapperDragAndResize,
    // ChartBar,
    ChartBarVertical,
    // ActionDetailsByStatus,
  },

  data: () => ({
    dateStart: getFrenchLuxonCurrentDateTime().startOf('day').toISODate(),
    dateEnd: getFrenchLuxonCurrentDateTime().endOf('day').toISODate(),
    menuStart: false,
    menuEnd: false,
    // TODO: FOR THE NEXT MEP
    // model: [],
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

    labelsSummaryNational () {
      return this.listLogs
        .map(el => el.date)
    },

    datasetsSummaryNational () {
      return this.getChartDatasetsNational(this.listLogs)
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
    getLabelsByDepartement (data) {
      return data
        .map(el => el.date)
    },
    // TODO: FOR THE NEXT MEP
    // getDataByDepartement () {
    //   const listLogs = this.listLogs
    //   const allBptValues = listLogs.reduce((accu, current) => {
    //     // console.log(current.date)
    //     // console.log(current.content.summaryByDepartement)
    //     const allDpt = current.content.summaryByDepartement.map(val => val.dpt)
    //     accu = accu.concat(allDpt)
    //     return accu
    //   }, [])

    //   const departementList = [...new Set(allBptValues)]
    //   return departementList.map(dpt => {
    //     return {
    //       dpt,
    //       datesInfo: listLogs.map(info => ({
    //         date: info.date,
    //         dptInfos: info.content.summaryByDepartement.find(el => el.dpt === dpt),
    //       })),
    //     }
    //   })
    // },

    getDataValueFor (type, groupe, dataRaw) {
      return dataRaw.map(el => {
        return el.content.summaryNational.find(item => item.status === `${groupe}`)?.infos[type]
      })
    },

    getChartDatasetsNational (data) {
      const colorReservation = 'rgba(50,205,50)'
      const colorModification = 'rgba(255,140,0)'
      const colorAnnulation = 'rgba(255,0,0)'

      const shapedDataSets = Array(6).fill(true).reduce((accu, _, index) => {
        const indexNumber = Number(index)
        const colorGroupe = this.getColorOfGroupe(indexNumber + 1)

        const shapedDataSet = [
          {
            label: `Grp ${(indexNumber) + 1} Réservations`,
            stack: `${indexNumber}`,
            borderWidth: 5,
            data: this.getDataValueFor('R', indexNumber, data),
            backgroundColor: colorReservation,
            borderColor: [
              colorGroupe,
              colorGroupe,
              colorGroupe,
            ],
          },
          {
            label: `Grp ${(indexNumber) + 1} Modifications`,
            stack: `${indexNumber}`,
            borderWidth: 5,
            data: this.getDataValueFor('M', indexNumber, data),
            backgroundColor: colorModification,
            borderColor: [
              colorGroupe,
              colorGroupe,
              colorGroupe,
            ],
          },
          {
            label: `Grp ${(indexNumber) + 1} Annulation`,
            stack: `${indexNumber}`,
            borderWidth: 5,
            data: this.getDataValueFor('A', indexNumber, data),
            backgroundColor: colorAnnulation,
            borderColor: [
              colorGroupe,
              colorGroupe,
              colorGroupe,
            ],
          },

        ]
        accu = accu.concat(shapedDataSet)
        return accu
      }, [])

      return shapedDataSets
    },

    getDataDepartementValueFor (type, groupe, dataRaw) {
      const test = dataRaw.map(el => {
        return el.dptInfos?.content.find(item => item.status === `${groupe}`)?.infos[type] || 0
      })
      console.log({ test })
      return test
    },
    // TODO: FOR THE NEXT MEP
    // getChartDatasetsByDepartement (data) {
    //   // const data = this.getDataByDepartement()
    //   console.log({ data })
    //   // dptInfos
    //   const colorReservation = 'rgba(50,205,50)'
    //   const colorModification = 'rgba(255,140,0)'
    //   const colorAnnulation = 'rgba(255,0,0)'

    //   const shapedDataSets = Array(6).fill(true).reduce((accu, _, index) => {
    //     const indexNumber = Number(index)
    //     const colorGroupe = this.getColorOfGroupe(indexNumber + 1)

    //     const shapedDataSet = [
    //       {
    //         label: `Grp ${(indexNumber) + 1} Réservations`,
    //         stack: `${indexNumber}`,
    //         borderWidth: 5,
    //         data: this.getDataDepartementValueFor('R', indexNumber, data),
    //         backgroundColor: colorReservation,
    //         borderColor: [
    //           colorGroupe,
    //           colorGroupe,
    //           colorGroupe,
    //         ],
    //       },
    //       {
    //         label: `Grp ${(indexNumber) + 1} Modifications`,
    //         stack: `${indexNumber}`,
    //         borderWidth: 5,
    //         data: this.getDataDepartementValueFor('M', indexNumber, data),
    //         backgroundColor: colorModification,
    //         borderColor: [
    //           colorGroupe,
    //           colorGroupe,
    //           colorGroupe,
    //         ],
    //       },
    //       {
    //         label: `Grp ${(indexNumber) + 1} Annulation`,
    //         stack: `${indexNumber}`,
    //         borderWidth: 5,
    //         data: this.getDataDepartementValueFor('A', indexNumber, data),
    //         backgroundColor: colorAnnulation,
    //         borderColor: [
    //           colorGroupe,
    //           colorGroupe,
    //           colorGroupe,
    //         ],
    //       },

    //     ]
    //     accu = accu.concat(shapedDataSet)
    //     return accu
    //   }, [])

    //   return shapedDataSets
    // },

    getColorOfGroupe (groupe) {
      const colorGrp1 = 'rgba(0,0,0)'
      const colorGrp2 = 'rgba(105,105,105)'
      const colorGrp3 = 'rgba(128,128,128)'
      const colorGrp4 = 'rgba(169,169,169)'
      const colorGrp5 = 'rgba(192,192,192)'
      const colorGrp6 = 'rgba(211,211,211)'
      if (groupe === 1) {
        return colorGrp1
      } else
      if (groupe === 2) {
        return colorGrp2
      } else
      if (groupe === 3) {
        return colorGrp3
      } else
      if (groupe === 4) {
        return colorGrp4
      } else
      if (groupe === 5) {
        return colorGrp5
      } else
      if (groupe === 6) {
        return colorGrp6
      } else {
        return colorGrp1
      }
    },

    getLogs () {
      this.$store.dispatch(FETCH_LOGS_REQUEST, {
        start: this.dateStart,
        end: this.dateEnd,
      })
    },
  },
}
</script>
