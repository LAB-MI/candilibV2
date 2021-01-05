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
        <v-toolbar-title>Informations des actions candidats</v-toolbar-title>
        <v-spacer />

        <v-toolbar-title class="u-flex pa-5 mt-10">
          <v-menu
            v-model="menuRange"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            readonly
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="pickerDateRange"
                label="Date de début de période"
                prepend-icon="event"
                readonly
                v-on="on"
              />
            </template>

            <v-date-picker
              v-model="dateRange"
              range
              locale="fr"
              @input="menuRange = true"
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

      <details-dialog :list-logs="listLogs" />

      <big-loading-indicator :is-loading="isFetchingLogs" />

      <v-card-title primary-title>
        Nationale
      </v-card-title>
      <chart-bar-vertical
        :labels="labelsSummaryNational"
        :datasets="datasetsSummaryNational"
      />

      <v-tabs
        color="primary"
        dark
        slider-color="primary"
      >
        <v-tab
          v-for="logs in listLogsContent"
          :key="logs.dpt"
          ripple
        >
          {{ logs.dpt }}
        </v-tab>
        <v-tab-item
          v-for="logsDate in listLogsContent"
          :key="`${logsDate.dpt}-item`"
        >
          <v-card flat>
            <v-card-text>
              <chart-bar-vertical
                :labels="getLabelsByDepartement(logsDate.datesInfo)"
                :datasets="getChartDatasetsByDepartement(logsDate.datesInfo)"
              />
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs>
    </v-card>
  </div>
</template>

<script>
import { FETCH_LOGS_REQUEST } from '@/store'
import { mapState } from 'vuex'
import { BigLoadingIndicator /*, WrapperDragAndResize */ } from '@/components'

import ChartBarVertical from '../statsKpi/ChartBarVertical.vue'
import { getFrenchLuxonCurrentDateTime } from '@/util'
import DetailsDialog from './DetailsDialog.vue'

export default {
  name: 'AdminTech',
  components: {
    BigLoadingIndicator,
    // WrapperDragAndResize,
    ChartBarVertical,
    DetailsDialog,
  },

  data: () => ({
    dateRange: [
      getFrenchLuxonCurrentDateTime().minus({ days: 7 }).startOf('day').toISODate(),
      getFrenchLuxonCurrentDateTime().minus({ days: 1 }).endOf('day').toISODate(),
    ],
    infosOfDepartement: [],
    menuRange: false,
    listLogsContent: [],
  }),

  computed: {
    ...mapState(['adminTech']),
    listLogs: state => state.adminTech.listLogs,
    isFetchingLogs: state => state.adminTech.isFetchingLogs,

    pickerDateRange () {
      if (this.dateRange[0] && this.dateRange[1]) {
        return [
          this.dateRange[0].split('-').reverse().join('/'),
          this.dateRange[1].split('-').reverse().join('/'),
        ].join(' ~ ')
      }
      return 'Selectionner une tranche de date'
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
    dateRange (newValue, oldValue) {
      if (newValue !== oldValue && newValue.length === 2) {
        this.getLogs()
        this.getDataByDepartement()
      }
    },
    listLogs (newValue, oldValue) {
      this.getDataByDepartement()
    },
  },

  mounted () {
    this.getLogs()
    this.getDataByDepartement()
  },

  methods: {
    getLabelsByDepartement (data) {
      return data
        .map(el => el.date)
    },

    getDataByDepartement () {
      const listLogs = this.listLogs
      const allBptValues = listLogs.reduce((accu, current) => {
        const allDpt = current.content.summaryByDepartement.map(val => val.dpt)
        accu = accu.concat(allDpt)
        return accu
      }, [])

      const departementList = [...new Set(allBptValues)]
      this.listLogsContent = departementList.map(dpt => {
        return {
          dpt,
          datesInfo: listLogs.map(info => ({
            date: info.date,
            dptInfos: info.content.summaryByDepartement.find(el => el.dpt === dpt),
          })),
        }
      })
    },

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
      const value = dataRaw.map(el => {
        return el.dptInfos?.content.find(item => item.status === `${groupe}`)?.infos[type] || 0
      })
      return value
    },
    getChartDatasetsByDepartement (data) {
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
            data: this.getDataDepartementValueFor('R', indexNumber, data),
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
            data: this.getDataDepartementValueFor('M', indexNumber, data),
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
            data: this.getDataDepartementValueFor('A', indexNumber, data),
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
      const startAndEnd = this.dateRange
      this.$store.dispatch(FETCH_LOGS_REQUEST, {
        start: startAndEnd[0],
        end: startAndEnd[1],
      })
    },
  },
}
</script>
