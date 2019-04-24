<template>
  <v-container class="container" grid-list-md>
    <v-layout row wrap>
      <v-flex class="center-title" xs4>
        <page-title title="Centres d'examen"/>
        <v-btn :loading="isLoading" @click="refreshPlanning">Refresh</v-btn>
      </v-flex>
      <v-spacer></v-spacer>
      <v-flex xs4>
        <page-title class="page-title" :title="`Semaine (${currentWeekNumber})`"/>
      </v-flex>
      <v-spacer></v-spacer>
      <v-flex class="date-selector" xs4>
        <page-title title="Choix date"/>
        <v-menu
          v-model="datePicker"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="computedDateFormatted"
              persistent-hint
              prepend-icon="event"
              readonly
              v-on="on"
            />
          </template>
          <v-date-picker v-model="date" no-title @input="datePicker = false" locale="fr"/>
        </v-menu>
      </v-flex>
      <v-flex xs12>
        <v-tabs
          class="tabs"
          v-model="active"
          color="white"
          slider-color="red"
        >
          <v-tab
            v-for="element in placesByCentreList"
            :key="element.centre._id"
            @click="centreSelector(element.centre._id)"
            ripple
          >
            {{ element.centre.nom }}
          </v-tab>
            <v-tab-item
              v-for="place in placesByCentreList"
              :key="place.centre._id"
              transition="slide-y-transition"
              reverse-transition="slide-y-transition"
              :lazy="true"
            >
              <v-data-table
                :rows-per-page-items='[15, 25, 35,{"text":"$vuetify.dataIterator.rowsPerPageAll","value":-1}]'
                :headers="headers"
                :items="{ inspecteursData, activeCentreId } | filterByCentre"
                class="elevation-1"
                :loading="isLoading"
                :no-data-text="isLoading ? 'Chargement des données en cours...' : 'Aucun creneau pour ce centre'"
              >
                <template v-slot:items="props">
                  <td>
                    {{  props.item.nom }}
                  </td>
                  <schedule-inspector-dialog
                    v-for="(isPlaceInfo, indx) in props.item.creneau"
                    :key="props.item._id + 'creneau' + indx"
                    :content="isPlaceInfo"
                    :selectedDate="date"
                    :inspecteurId="props.item._id"
                    :updateContent="parseInspecteursPlanning"
                    :centreInfo="place.centre"
                  />
                </template>
              </v-data-table>
            </v-tab-item>
        </v-tabs>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {
  FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST,
  FETCH_ADMIN_INFO_REQUEST,
  FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST,
} from '@/store'
import PageTitle from '@/components/PageTitle.vue'
import ScheduleInspectorDialog from './ScheduleInspectorDialog.vue'
import {
  getFrenchLuxonDateFromIso,
  getFrenchLuxonDateTimeFromSql,
  getFrenchLuxonCurrentDateTime,
} from '@/util'

import {
  creneauSetting,
  getFrenchLuxonCurrentDateTime,
  getFrenchLuxonDateFromIso,
  getFrenchLuxonDateFromObject,
  getFrenchLuxonDateTimeFromSql,
} from '@/util'

const creneauTemplate = [
  'Inspecteurs',
  creneauSetting[0],
  creneauSetting[1],
  creneauSetting[2],
  creneauSetting[3],
  creneauSetting[4],
  creneauSetting[5],
  creneauSetting[6],
  creneauSetting[7],
  creneauSetting[8],
  creneauSetting[9],
  creneauSetting[10],
  creneauSetting[11],
  creneauSetting[12],
]

export default {
  components: {
    PageTitle,
    ScheduleInspectorDialog,
  },

  data () {
    return {
      active: null,
      activeCentreId: this.firstCentreId,
      currentWeekNumber: getFrenchLuxonCurrentDateTime().weekNumber,
      date: getFrenchLuxonCurrentDateTime().toISODate(),
      headers: undefined,
      inspecteursData: [],
      isComputing: false,
      isParseInspecteursPlanningLoading: false,
      datePicker: false,
    }
  },

  computed: {
    computedDateFormatted () {
      return this.formatDate(this.date)
    },

    centerTarget () {
      return this.$store.state.admin.centerTarget
    },

    placesByCentreList () {
      return this.$store.state.admin.places.list
    },

    firstCentreId () {
      return this.$store.state.admin.places.list[0].centre._id
    },

    inspecteurs () {
      return this.$store.state.admin.inspecteurs.list
    },

    isLoading () {
      return this.$store.state.admin.places.isFetching ||
        this.$store.state.admin.inspecteurs.isFetching ||
        this.isComputing
    },
  },

  methods: {
    formatDate (date) {
      if (!date) return null
      const [year, month, day] = date.split('-')
      return `${day}/${month}/${year}`
    },

    async refreshPlanning () {
      const beginAndEnd = getFrenchLuxonDateTimeFromSql(this.date).toISO()
      await this.$store
        .dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, beginAndEnd, beginAndEnd)
      this.parseInspecteursPlanning()
    },

    async centreSelector (centreId) {
      this.activeCentreId = centreId
      const beginAndEnd = getFrenchLuxonDateTimeFromSql(this.date).toISO()
      await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, beginAndEnd, beginAndEnd)
      this.parseInspecteursPlanning()
    },

    async parseInspecteursPlanning () {
      this.isComputing = true
      this.inspecteursData = []
      if (creneauTemplate.length === 14) {
        creneauTemplate.shift()
      }

      let reservastionsByCentre = {}
      const dateTofind = getFrenchLuxonDateTimeFromSql(this.date).toISODate()

      this.placesByCentreList.find(element => {
        const weekPlaces = element.places[this.currentWeekNumber]
        if (weekPlaces && weekPlaces.length && element.centre._id === this.activeCentreId) {
          const result = weekPlaces.filter(place => {
            const currentDate = getFrenchLuxonDateFromIso(place.date).toISODate()
            if (currentDate === dateTofind) {
              return place
            }
          })

          reservastionsByCentre = { centre: element.centre, places: result }
          this.inspecteursData = this.inspecteurs.map(inspecteur => {
            const creneauData = creneauTemplate.map((elemt) => {
              const instpecteurPlaces = reservastionsByCentre.places
                .filter(element => element.inspecteur === inspecteur._id &&
                  getFrenchLuxonDateFromIso(element.date).toFormat("HH'h'mm") === elemt)
              if (instpecteurPlaces.length) {
                return { place: instpecteurPlaces[0], hour: elemt }
              } else {
                return { place: undefined, hour: elemt }
              }
            })
            return {
              ...inspecteur,
              creneau: creneauData,
            }
          })
        }
      })
      if (!this.inspecteursData.length) {
        this.inspecteursData = this.inspecteurs
      }
      this.isComputing = false
    },

    centreSelector (centreId) {
      this.activeCentreId = centreId

      // const fakeInspecteursArray = [
      //   {
      //     _id: 'ObjectId("5cc2fc5150b58e0977a76bd5")',
      //     nom: 'SCUTTLE',
      //     prenom: 'prenomScuttle',
      //     email: 'scuttle@example.com',
      //     matricule: '0123456789',
      //     crenaux: [],
      //   },
      //   {
      //     _id: 'ObjectId("5cc2fc5150b58e0977a76bd4")',
      //     nom: 'CHARLIE',
      //     prenom: 'prenomCharlie',
      //     email: 'dupond.jacques@email.fr',
      //     matricule: '0123456788',
      //     crenaux: [],
      //   },
      // ]
    },

    async fetchInspecteursPlanning () {
      console.log('okokok', this.activeCentreId)
      const crenauxTemplate = [
        '08h00',
        '08h30',
        '09h00',
        '09h30',
        '10h00',
        '10h30',
        '11h00',
        '11h30',
        '13h30',
        '14h00',
        '14h30',
        '15h00',
        '15h30',
      ]

      const fakeInspecteursArray = this.inspecteurs
      let reservastionsByCentre = {}

      this.placesByCentreList.find(element => {
        const weekPlaces = element.places[this.currentWeekNumber]
        if (element.centre._id === this.activeCentreId && weekPlaces && weekPlaces.length) {
          const result = weekPlaces.filter(place => {
            const currentDate = getFrenchLuxonDateFromIso(place.date).toISODate()
            const dateTofind = getFrenchLuxonDateTimeFromSql(this.date).toISODate()
            if (currentDate === dateTofind) {
              return place
            }
          })
          reservastionsByCentre = { centre: element.centre, places: result }
          this.inspecteursData = fakeInspecteursArray.map(inspecteur => {
            const crenauxData = crenauxTemplate.map((elemt) => {
              const instpecteurPlaces = reservastionsByCentre.places
                .filter(element => element.inspecteur === inspecteur._id &&
                  getFrenchLuxonDateFromIso(element.date).toFormat("HH'h'mm") === elemt)
              if (instpecteurPlaces.length) {
                return { place: instpecteurPlaces, hour: elemt }
              } else {
                return { place: undefined, hour: elemt }
              }
            })
            return {
              ...inspecteur,
              crenaux: crenauxData,
            }
          })
        }
      })
    }
  },

  watch: {
    async date (val) {
      const dateTimeFromSql = getFrenchLuxonDateTimeFromSql(this.date)
      this.currentWeekNumber = dateTimeFromSql.weekNumber
      if (this.$store.state.admin.departements.active) {
        const beginAndEnd = dateTimeFromSql.toISO()
        await this.$store
          .dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, beginAndEnd, beginAndEnd)
        this.parseInspecteursPlanning()
      }
    },
  },

  filters: {
    filterByCentre (obj) {
      const { inspecteursData, activeCentreId } = obj
      if (inspecteursData.length) {
        const result = inspecteursData.filter(inspecteurInfo => {
          if (inspecteurInfo.creneau.find(item => item.place && item.place.centre === activeCentreId)) {
            return inspecteurInfo
          }
        })
        return result
      }
    },
  },

  async mounted () {
    await this.$store.dispatch(FETCH_ADMIN_INFO_REQUEST)
    const beginAndEnd = getFrenchLuxonDateTimeFromSql(this.date).toISO()
    await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, beginAndEnd, beginAndEnd)
    this.activeCentreId = this.firstCentreId
    await this.$store.dispatch(FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST)
    this.parseInspecteursPlanning()
  },

  async beforeMount () {
    this.headers = Array(14)
      .fill(true).map((item, index) => {
        return {
          text: `${creneauTemplate[index]}`,
          align: 'center',
          sortable: false,
          value: `${creneauTemplate[index]}`,
        }
      })

    const { currentWeek } = this.$store.state.admin

    this.date = getFrenchLuxonDateFromObject({
      weekYear: getFrenchLuxonCurrentDateTime().year,
      weekNumber: currentWeek || getFrenchLuxonCurrentDateTime().weekNumber,
      weekday: 1,
    }).toISODate()
  },
}
</script>

<style lang="stylus" scoped>
.container {
  max-width: 100%;
  padding: 1px;
}

.center-title {
  margin-top: 4em;
}

.date-selector {
  margin-top: 4em;
}

table.v-table tbody td:first-child,
table.v-table tbody td:not(:first-child),
table.v-table tbody th:first-child,
table.v-table tbody th:not(:first-child),
table.v-table thead td:first-child,
table.v-table thead td:not(:first-child),
table.v-table thead th:first-child,
table.v-table thead th:not(:first-child) {
  padding: 0 !important;
}

.page-title {
  margin-top: 4em;
}
</style>
