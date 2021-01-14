<template>
  <div>
    <v-card>
      <!-- <wrapper-drag-and-resize
        :axe-x="5"
        :axe-y="70"
      > -->
      <v-toolbar
        color="#272727"
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
                label="Selct la date de début puis de fin"
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

      <v-tabs
        v-if="!isFetchingLogs"
        color="primary"
        dark
        slider-color="primary"
      >
        <v-tab ripple>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                color="info"
                dark
                v-bind="attrs"
                v-on="on"
              >
                business
              </v-icon>
            </template>
            <span>Graphique par département de réservation</span>
          </v-tooltip>
        </v-tab>
        <v-tab ripple>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-for="icon in ['business', 'loupe']"
                :key="icon"
                color="info"
                dark
                v-bind="attrs"
                v-on="on"
              >
                {{ icon }}
              </v-icon>
            </template>
            <span>Details département de réservation</span>
          </v-tooltip>
        </v-tab>

        <v-tab ripple>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                color="error"
                dark
                v-bind="attrs"
                v-on="on"
              >
                house
              </v-icon>
            </template>
            <span>Graphique par département de résidence</span>
          </v-tooltip>
        </v-tab>
        <v-tab ripple>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-for="icon in ['house', 'loupe']"
                :key="icon"
                color="error"
                dark
                v-bind="attrs"
                v-on="on"
              >
                {{ icon }}
              </v-icon>
            </template>
            <span>Details département de résidence</span>
          </v-tooltip>
        </v-tab>
        <v-spacer />
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="info"
              v-bind="attrs"
              @click="getExcelFile"
              v-on="on"
            >
              <v-icon>
                business
              </v-icon>
              <v-icon>
                get_app
              </v-icon>

              <v-icon>
                assessment
              </v-icon>
            </v-btn>
          </template>

          <span>Exporter les stats par département de réservation</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="error"
              v-bind="attrs"
              @click="getExcelFileForHomeDepartement"
              v-on="on"
            >
              <v-icon>
                house
              </v-icon>
              <v-icon>
                get_app
              </v-icon>

              <v-icon>
                assessment
              </v-icon>
            </v-btn>
          </template>

          <span>Exporter les stats par département de résidence</span>
        </v-tooltip>

        <v-tab-item>
          <item-graph-stats
            :labels-summary-national="getLabelsByDepartement(listLogs)"
            :datasets-summary-national="getChartDatasetsNational(listLogs)"
            :list-logs-content="listLogsContent"
            :is-by-home-departement="false"
          />
        </v-tab-item>

        <v-tab-item>
          <v-card>
            <details-content :list-logs="listLogs" />
          </v-card>
        </v-tab-item>

        <v-tab-item>
          <item-graph-stats
            :labels-summary-national="getLabelsByDepartement(listLogsByHomeDepartement)"
            :datasets-summary-national="getChartDatasetsNational(listLogsByHomeDepartement)"
            :list-logs-content="listLogsHomeDepartementContent"
            :is-by-home-departement="true"
          />
        </v-tab-item>

        <v-tab-item>
          <v-card>
            <details-content :list-logs="listLogsByHomeDepartement" />
          </v-card>
        </v-tab-item>
      </v-tabs>

      <big-loading-indicator :is-loading="isFetchingLogs" />
    </v-card>
  </div>
</template>

<script>
import { FETCH_LOGS_HOME_DEPARTEMENT_REQUEST, FETCH_LOGS_REQUEST, SAVE_EXCEL_FILE_REQUEST } from '@/store'
import { mapState } from 'vuex'
import { BigLoadingIndicator /*, WrapperDragAndResize */ } from '@/components'

import ItemGraphStats from './ItemGraphStats'
import { getFrenchLuxonCurrentDateTime } from '@/util'
import DetailsContent from './DetailsContent.vue'

export default {
  name: 'AdminTech',
  components: {
    BigLoadingIndicator,
    // WrapperDragAndResize,
    DetailsContent,
    ItemGraphStats,
  },

  data: () => ({
    dateRange: [
      getFrenchLuxonCurrentDateTime().minus({ days: 7 }).startOf('day').toISODate(),
      getFrenchLuxonCurrentDateTime().minus({ days: 1 }).endOf('day').toISODate(),
    ],
    infosOfDepartement: [],
    menuRange: false,
    listLogsContent: [],
    listLogsHomeDepartementContent: [],
  }),

  computed: {
    ...mapState(['adminTech']),
    listLogs: state => state.adminTech.listLogs,
    isFetchingLogs: state => state.adminTech.isFetchingLogs || state.adminTech.isFetchingLogsByHomeDepartement,
    listLogsByHomeDepartement: state => state.adminTech.listLogsByHomeDepartement,

    pickerDateRange () {
      if (this.dateRange[0] && this.dateRange[1]) {
        return [
          this.dateRange[0].split('-').reverse().join('/'),
          this.dateRange[1].split('-').reverse().join('/'),
        ].join('_au_')
      }
      return 'Selectionner une tranche de date'
    },

    datasetsSummaryNational () {
      return this.getChartDatasetsNational(this.listLogs)
    },

    datasetsSummaryNationalHomeDepartement () {
      return this.getChartDatasetsNational(this.listLogsByHomeDepartement)
    },
  },

  watch: {
    dateRange (newValue, oldValue) {
      if (newValue.length === 2) {
        this.getLogs()
        this.getDataByDepartement()
        this.getDataByHomeDepartement()
        this.menuRange = false
      }
    },

    listLogs () {
      this.getDataByDepartement()
    },

    listLogsByHomeDepartement () {
      this.getDataByHomeDepartement()
    },
  },

  mounted () {
    this.getLogs()
    this.getDataByDepartement()
    this.getDataByHomeDepartement()
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

    getDataByHomeDepartement () {
      const listLogsByHomeDepartement = this.listLogsByHomeDepartement
      const allBptValues = listLogsByHomeDepartement.reduce((accu, current) => {
        const allDpt = current.content.summaryByDepartement.map(val => val.dpt)
        accu = accu.concat(allDpt)
        return accu
      }, [])

      const departementList = [...new Set(allBptValues)]
      this.listLogsHomeDepartementContent = departementList.map(dpt => {
        return {
          dpt,
          datesInfo: listLogsByHomeDepartement.map(info => ({
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
            borderColor: colorGroupe,
          },
          {
            label: `Grp ${(indexNumber) + 1} Modifications`,
            stack: `${indexNumber}`,
            borderWidth: 5,
            data: this.getDataValueFor('M', indexNumber, data),
            backgroundColor: colorModification,
            borderColor: colorGroupe,
          },
          {
            label: `Grp ${(indexNumber) + 1} Annulation`,
            stack: `${indexNumber}`,
            borderWidth: 5,
            data: this.getDataValueFor('A', indexNumber, data),
            backgroundColor: colorAnnulation,
            borderColor: colorGroupe,
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

      this.$store.dispatch(FETCH_LOGS_HOME_DEPARTEMENT_REQUEST, {
        start: startAndEnd[0],
        end: startAndEnd[1],
      })
    },

    getExcelFile () {
      this.$store.dispatch(SAVE_EXCEL_FILE_REQUEST, {
        listLogs: this.listLogs,
        selectedRange: this.pickerDateRange,
        isByHomeDepartement: false,
      })
    },

    getExcelFileForHomeDepartement () {
      this.$store.dispatch(SAVE_EXCEL_FILE_REQUEST, {
        listLogs: this.listLogsByHomeDepartement,
        selectedRange: this.pickerDateRange,
        isByHomeDepartement: true,
      })
    },
  },
}
</script>
