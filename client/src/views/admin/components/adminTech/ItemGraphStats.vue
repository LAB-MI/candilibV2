<template>
  <v-card flat>
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
        :key="`${logs.dpt}`"
        ripple
      >
        {{ logs.dpt }}
      </v-tab>
      <v-tab-item
        v-for="logsDate in listLogsContent"
        :key="`${logsDate.dpt}`"
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
</template>

<script>
import ChartBarVertical from '../statsKpi/ChartBarVertical.vue'

export default {
  name: 'ItemGraphStats',
  components: {
    ChartBarVertical,
  },
  props: {
    labelsSummaryNational: {
      type: Array,
      default: () => [],
    },
    datasetsSummaryNational: {
      type: Array,
      default: () => [],
    },
    listLogsContent: {
      type: Array,
      default: () => [],
    },
  },

  methods: {
    getLabelsByDepartement (data) {
      return data
        .map(el => el.date)
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
            borderColor: colorGroupe,
          },
          {
            label: `Grp ${(indexNumber) + 1} Modifications`,
            stack: `${indexNumber}`,
            borderWidth: 5,
            data: this.getDataDepartementValueFor('M', indexNumber, data),
            backgroundColor: colorModification,
            borderColor: colorGroupe,
          },
          {
            label: `Grp ${(indexNumber) + 1} Annulation`,
            stack: `${indexNumber}`,
            borderWidth: 5,
            data: this.getDataDepartementValueFor('A', indexNumber, data),
            backgroundColor: colorAnnulation,
            borderColor: colorGroupe,
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

  },
}
</script>
