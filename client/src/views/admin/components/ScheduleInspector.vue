<template>
  <v-container grid-list-md>
    <div>
      <h2 class="text--center">
        Semaine {{ currentWeekNumber }}
      </h2>
      <div class="date-selector">
        <div class="date-input">
          <v-menu
            v-model="datePicker"
            :close-on-content-click="false"
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
        </div>
      </div>
    </div>

    <v-layout class="padded">
      <v-flex xs12>
        <div class="u-flex  u-flex--center  u-flex--space-between">
          <h3>Centres d'examen</h3>
          <generate-inspecteur-bordereaux
            :date="date"
          />
          <div class="stats-card">
            <div class="text-xs-right">
              <refresh-button
                @click="reloadWeekMonitor"
                :isLoading="isLoading"
              />
            </div>
          </div>
        </div>
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
          <v-tabs-items
            v-model="activeCentreTab"
          >
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
                class="elevation-1 data-table"
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
                    :updateContent="reloadWeekMonitor"
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
import { mapGetters, mapState } from 'vuex'
import {
  FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST,
  FETCH_ADMIN_INFO_REQUEST,
  FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST,
  SELECT_CENTER,
} from '@/store'

import ScheduleInspectorDialog from './ScheduleInspectorDialog'
import GenerateInspecteurBordereaux from './GenerateInspecteurBordereaux'
import { RefreshButton } from '@/components'

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
    GenerateInspecteurBordereaux,
    RefreshButton,
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
    ...mapState({
      isFetching (state) {
        const {
          places,
          inspecteurs,
          deleteBookedPlace,
          deletePlaceAction,
          createCreneau,
        } = state.admin
        return places.isFetching ||
          inspecteurs.isFetching ||
          deleteBookedPlace.isDeleting ||
          deletePlaceAction.isDeleting ||
          createCreneau.isCreating
      },

      placesByCentreList (state) {
        return state.admin.places.list
      },

      firstCentreId (state) {
        const firstEntry = state.admin.places.list[0]
        return firstEntry && firstEntry.centre._id
      },

      inspecteurs (state) {
        return state.admin.inspecteurs.list
      },
    }),

    computedDateFormatted () {
      return this.formatDate(this.date)
    },

    isLoading () {
      return this.isFetching ||
        this.isComputing
    },
  },

  methods: {
    formatDate (date) {
      if (!date) return null
      const [year, month, day] = date.split('-')
      return `${day}/${month}/${year}`
    },

    async reloadWeekMonitor () {
      const begin = getFrenchLuxonDateTimeFromSql(this.date).startOf('day').toISO()
      const end = getFrenchLuxonDateTimeFromSql(this.date).endOf('day').toISO()
      await this.$store
        .dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, { begin, end })
      this.parseInspecteursPlanning()
    },

    async centreSelector (centreId) {
      this.$router.push({ params: { center: centreId, date: this.date } })
      this.activeCentreId = centreId
      const { centre } = this.placesByCentreList.find(placesByCentre => placesByCentre.centre._id === centreId)
      this.$store.commit(SELECT_CENTER, centre)
      this.reloadWeekMonitor()
    },

    parseInspecteursPlanning () {
      this.isComputing = true
      this.inspecteursData = []
      const [, ...creneaux] = creneauTemplate

      const dateTofind = getFrenchLuxonDateTimeFromSql(this.date).toISODate()

      const activeCenterAndPlaces = this.placesByCentreList.find(placesByCentre => placesByCentre.centre._id === this.activeCentreId)
      const weekPlaces = activeCenterAndPlaces &&
        activeCenterAndPlaces.places &&
        activeCenterAndPlaces.places[this.currentWeekNumber]
      if (!weekPlaces) {
        this.isComputing = false
        return
      }

      const dayPlaces = weekPlaces.filter(plc => getFrenchLuxonDateFromIso(plc.date).toISODate() === dateTofind)

      if (dayPlaces && dayPlaces.length) {
        this.inspecteursData = this.inspecteurs.map(inspecteur => {
          const filteredCreneaux = dayPlaces.filter(plce => inspecteur._id === plce.inspecteur).map(place => {
            const currentHourString = getFrenchLuxonDateFromIso(place.date).toFormat("HH'h'mm")
            if (creneaux.some(crn => crn === currentHourString)) {
              return {
                place,
                hour: currentHourString,
              }
            }
          }).filter(plce => !!plce)
          if (filteredCreneaux.length < 13) {
            creneaux.forEach(cren => {
              if (!filteredCreneaux.some(crn => crn.hour === cren)) {
                filteredCreneaux.push({
                  place: undefined,
                  hour: cren,
                })
              }
            })
          }
          return {
            ...inspecteur,
            creneau: filteredCreneaux.sort((currentCreneau, creneauToCompare) => {
              if (currentCreneau.hour < creneauToCompare.hour) {
                return -1
              }
              if (currentCreneau.hour > creneauToCompare.hour) {
                return 1
              }
              return 0
            }),
          }
        })
      }
      if (!this.inspecteursData.length) {
        this.inspecteursData = this.inspecteurs
      }
      this.isComputing = false
    },
  },

  watch: {
    async date (val) {
      this.$router.push({ params: { date: this.date } })
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
    },

    async activeDepartement (newValue, oldValue) {
      const dateTimeFromSQL = getFrenchLuxonDateTimeFromSql(this.date)
      const begin = dateTimeFromSQL.startOf('day').toISO()
      const end = dateTimeFromSQL.endOf('day').toISO()
      await this.$store
        .dispatch(FETCH_INSPECTEURS_BY_DEPARTEMENT_REQUEST)
      await this.$store
        .dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, { begin, end })
      const { center } = this.$route.params
      if (!this.placesByCentreList.some(el => el.centre._id === center)) {
        this.activeCentreId = this.firstCentreId
        this.activeCentreTab = `tab-${this.activeCentreId}`
      } else {
        this.activeCentreTab = `tab-${center}`
      }
      this.parseInspecteursPlanning()
    },
  },

  filters: {
    filterByCentre (obj) {
      const { inspecteursData, activeCentreId } = obj
      if (inspecteursData.length) {
        const result = inspecteursData.filter(inspecteurInfo => {
          if (inspecteurInfo.creneau.some(item => item.place && item.place.centre === activeCentreId)) {
            return inspecteurInfo
          }
        })
        return result
      }
    },
  },

  async mounted () {
    await this.$store.dispatch(FETCH_ADMIN_INFO_REQUEST)
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

.date-input {
  width: 290px;
  margin: 0 auto;
}

.padded {
  padding: 1em;
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

.refresh-btn {
  margin: 1em;
}
</style>
