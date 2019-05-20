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
          v-model="activeCentreTab"
          color="white"
          slider-color="red"
        >
          <v-tab
            v-for="element in placesByCentreList"
            :key="element.centre._id"
            @click="centreSelector(element.centre._id)"
            :href="`#tab-${element.centre._id.toString()}`"
            ripple
          >
            {{ element.centre.nom }}
          </v-tab>
          <v-tabs-items v-model="activeCentreTab">
            <v-tab-item
              v-for="place in placesByCentreList"
              :key="place.centre._id"
              :lazy="true"
              :value="`tab-${place.centre._id}`"
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
                    {{ props.item.nom }}
                  </td>
                  <schedule-inspector-dialog
                    v-for="(placeInfo, index) in props.item.creneau"
                    :key="`creneau-${placeInfo.hour}-${index}`"
                    :content="placeInfo"
                    :selectedDate="date"
                    :inspecteurId="props.item._id"
                    :updateContent="refreshPlanning"
                    :centreInfo="place.centre"
                  />
                </template>
              </v-data-table>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST,
  FETCH_ADMIN_INFO_REQUEST,
  FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST,
} from '@/store'

import PageTitle from '@/components/PageTitle.vue'
import ScheduleInspectorDialog from './ScheduleInspectorDialog.vue'

import {
  creneauSetting,
  getFrenchLuxonCurrentDateTime,
  getFrenchLuxonDateFromIso,
  getFrenchLuxonDateFromObject,
  getFrenchLuxonDateTimeFromSql,
} from '@/util'

const creneauTemplate = [
  'Inspecteurs',
  ...creneauSetting,
]

export default {
  components: {
    PageTitle,
    ScheduleInspectorDialog,
  },

  data () {
    return {
      activeCentreTab: null,
      activeCentreId: null,
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
    ...mapGetters(['activeDepartement']),

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
      return this.$store.state.admin.places.list[0] && this.$store.state.admin.places.list[0].centre._id
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
      const begin = getFrenchLuxonDateTimeFromSql(this.date).startOf('day').toISO()
      const end = getFrenchLuxonDateTimeFromSql(this.date).endOf('day').toISO()
      await this.$store
        .dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, { begin, end })
      this.parseInspecteursPlanning()
    },

    async centreSelector (centreId) {
      this.$router.push({ params: { center: centreId, date: this.date } })
      this.activeCentreId = centreId
      this.refreshPlanning()
    },

    parseInspecteursPlanning () {
      this.isComputing = true
      this.inspecteursData = []
      const [, ...creneaux] = creneauTemplate

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
            const creneauData = creneaux.map((elemt) => {
              const instpecteurPlaces = reservastionsByCentre.places
                .filter(element => element.inspecteur === inspecteur._id &&
                  getFrenchLuxonDateFromIso(element.date).toFormat("HH'h'mm") === elemt)
              if (instpecteurPlaces.length) {
                return { place: instpecteurPlaces[0], hour: elemt }
              }
              return { place: undefined, hour: elemt }
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
  },

  watch: {
    async date (val) {
      const dateTimeFromSQL = getFrenchLuxonDateTimeFromSql(this.date)
      this.currentWeekNumber = dateTimeFromSQL.weekNumber
      if (this.$store.state.admin.departements.active) {
        const begin = dateTimeFromSQL.startOf('day').toISO()
        const end = dateTimeFromSQL.endOf('day').toISO()
        await this.$store
          .dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, { begin, end })
        this.activeCentreId = (this.$route.params.center) || this.firstCentreId
        this.activeCentreTab = `tab-${this.activeCentreId}`
        this.parseInspecteursPlanning()
      }
      this.$router.push({ params: { center: this.activeCentreId, date: this.date } })
    },

    async activeDepartement (newValue, oldValue) {
      const dateTimeFromSQL = getFrenchLuxonDateTimeFromSql(this.date)
      const begin = dateTimeFromSQL.startOf('day').toISO()
      const end = dateTimeFromSQL.endOf('day').toISO()
      await this.$store
        .dispatch(FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST)
      await this.$store
        .dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, { begin, end })
      this.activeCentreId = this.firstCentreId
      this.activeCentreTab = `tab-${this.activeCentreId}`
      this.parseInspecteursPlanning()
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
    const begin = getFrenchLuxonDateTimeFromSql(this.date).startOf('day').toISO()
    const end = getFrenchLuxonDateTimeFromSql(this.date).endOf('day').toISO()
    await this.$store.dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, { begin, end })
    await this.$store.dispatch(FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST)
    const centerId = this.$route.params.center
    this.activeCentreId = (centerId) || this.firstCentreId
    this.activeCentreTab = `tab-${this.activeCentreId}`
    this.parseInspecteursPlanning()
  },

  async beforeMount () {
    this.headers = creneauTemplate.map((creneau, index) => {
      return {
        text: `${creneau}`,
        align: 'center',
        sortable: false,
        value: `${creneau}`,
      }
    })

    const { currentWeek } = this.$store.state.admin

    const defaultDate = {
      weekYear: getFrenchLuxonCurrentDateTime().year,
      weekNumber: currentWeek || getFrenchLuxonCurrentDateTime().weekNumber,
      weekday: 1,
    }

    const routeDate = this.$route.params.date
    if (routeDate) {
      const [year, month, day] = this.$route.params.date.split('-')
      const date = { year, month, day }
      this.date = getFrenchLuxonDateFromObject(date).toISODate()
      return
    }

    this.date = getFrenchLuxonDateFromObject(defaultDate).toISODate()
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
