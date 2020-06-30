<template>
  <v-container grid-list-md>
    <div>
      <h2 class="text--center">
        <v-btn
          icon
          @click="goto('-1 weeks')"
        >
          <v-icon
            color="grey darken"
          >
            fast_rewind
          </v-icon>
        </v-btn>
        Semaine {{ displayOnlyNumberOfWeek() }}
        <v-btn
          class="t-btn-next-week"
          icon
          @click="goto('+1 weeks')"
        >
          <v-icon
            color="grey darken"
          >
            fast_forward
          </v-icon>
        </v-btn>
      </h2>

      <div class="date-selector">
        <div class="date-input  u-flex  u-flex--center">
          <v-btn
            icon
            @click="goto('-1 days')"
          >
            <v-icon
              color="grey darken"
              style="transform: rotate(0.5turn);"
            >
              play_arrow
            </v-icon>
          </v-btn>

          <v-menu
            v-model="datePicker"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template v-slot:activator="{ on }">
              <v-text-field
                v-model="pickerDate"
                class="t-date-picker"
                persistent-hint
                prepend-icon="event"
                readonly
                v-on="on"
              />
            </template>
            <v-date-picker
              v-model="date"
              no-title
              locale="fr"
              @input="datePicker = false"
            />
          </v-menu>
          <v-btn
            icon
            @click="goto('+1 days')"
          >
            <v-icon
              color="grey darken"
            >
              play_arrow
            </v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <div>
      <div class="u-flex  u-flex--center  u-flex--space-between">
        <h3>Centres d'examen</h3>
        <generate-inspecteur-bordereaux
          :date="date"
          :is-for-inspecteurs="true"
        />
        <generate-inspecteur-bordereaux
          :date="date"
          :is-for-inspecteurs="false"
        />
        <div class="stats-card">
          <div class="text-xs-right">
            <refresh-button
              :is-loading="isLoading"
              @click="reloadWeekMonitor"
            />
          </div>
        </div>
      </div>

      <big-loading-indicator :is-loading="isLoading" />

      <v-tabs
        v-model="activeCentreTab"
        class="tabs t-center-tabs"
        color="dark"
        slider-color="#f82249"
      >
        <v-tab
          v-for="element in placesByCentreList"
          :key="element.centre._id"
          :href="`#tab-${element.centre._id.toString()}`"
          ripple
          :disabled="isLoading"
          :aria-disabled="isLoading"
          @click="centreSelector(element.centre._id)"
        >
          {{ element.centre.nom }}
        </v-tab>

        <v-tabs-items
          v-model="activeCentreTab"
        >
          <v-tab-item
            v-for="placesByCentre in placesByCentreList"
            :key="placesByCentre.centre._id"
            :value="`tab-${placesByCentre.centre._id}`"
          >
            <v-card
              class="center-content-wrapper pa-1"
            >
              <table
                class="table u-full-width"
                :style="{ opacity: isLoading ? '0.5' : '1' }"
              >
                <thead>
                  <tr>
                    <th
                      v-for="creneau in headers"
                      :key="creneau"
                    >
                      {{ creneau }}
                    </th>
                  </tr>
                </thead>

                <tbody
                  v-for="inspecteurData in inspecteursData"
                  :key="inspecteurData.matricule"
                >
                  <tr>
                    <th
                      class="inspecteur-button"
                      :class="{ active: deleteMode && activeInspecteurRow === inspecteurData._id }"
                    >
                      <v-layout row>
                        <v-tooltip bottom>
                          {{ inspecteurData.prenom + ' ' + inspecteurData.nom }}
                          <template v-slot:activator="{ on }">
                            <span
                              class="name-ipcsr-wrap"
                              v-on="on"
                            >
                              {{ inspecteurData.prenom }}
                              {{ inspecteurData.nom }}
                            </span>
                          </template>
                        </v-tooltip>
                        <v-btn
                          icon
                          @click="activeDeleteMode(inspecteurData._id, inspecteurData)"
                        >
                          <v-icon
                            size="20"
                            color="#A9A9A9"
                          >
                            delete
                          </v-icon>
                        </v-btn>
                      </v-layout>
                    </th>
                    <td
                      v-for="placeInfo in inspecteurData.creneau"
                      :key="placeInfo._id"
                      class="place-button"
                      :class="{ active: activeInspecteurRow === inspecteurData._id && activeHour === placeInfo.hour }"
                    >
                      <schedule-inspector-button
                        :key="`creneau-${placeInfo.hour}-${inspecteurData._id}`"
                        :content="placeInfo"
                        :selected-date="date"
                        :inspecteur-id="inspecteurData._id"
                        :update-content="reloadWeekMonitor"
                        :centre-info="placeInfo.centre"
                        @click="setActiveInspecteurRow"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td
                      v-if="deleteMode"
                      class="inspecteur-button"
                      :class="{ active: deleteMode && activeInspecteurRow === inspecteurData._id }"
                    />

                    <td colspan="20">
                      <div
                        class="place-details  u-flex  u-flex--center"
                        :class="{ active: activeInspecteurRow === inspecteurData._id }"
                      >
                        <schedule-inspector-details
                          v-if="!deleteMode"
                          :place="activePlace"
                          :content="selectedPlaceInfo"
                          :close-dialog="closeDetails"
                          :selected-date="date"
                          :update-content="reloadWeekMonitor"
                          :inspecteur-id="inspecteurData._id"
                          :centre-info="placesByCentre.centre"
                        />
                        <delete-schedule-inspector
                          v-if="deleteMode"
                          :place-info="inspecteurData"
                          :inspecteur-id="inspecteurData._id"
                          :close-details="closeDetails"
                          @reloadWeekMonitor="reloadWeekMonitor"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-tabs>
    </div>
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST,
  FETCH_INSPECTEURS_BY_CENTRE_REQUEST,
  SELECT_CENTER,
  FETCH_CANDIDAT_REQUEST,
  RESET_CANDIDAT,
} from '@/store'

import DeleteScheduleInspector from './DeleteScheduleInspector'
import GenerateInspecteurBordereaux from './GenerateInspecteurBordereaux'
import ScheduleInspectorButton from './ScheduleInspectorButton'
import ScheduleInspectorDetails from './ScheduleInspectorDetails'
import { RefreshButton, BigLoadingIndicator } from '@/components'

import {
  creneauSetting,
  getFrenchLuxonCurrentDateTime,
  getFrenchLuxonFromIso,
  getFrenchLuxonFromObject,
  getFrenchLuxonFromSql,
} from '@/util'

const creneauTemplate = [
  'Inspecteurs',
  ...creneauSetting,
]

const numberOfCreneau = creneauSetting.length || 0

export default {
  components: {
    DeleteScheduleInspector,
    GenerateInspecteurBordereaux,
    RefreshButton,
    ScheduleInspectorButton,
    ScheduleInspectorDetails,
    BigLoadingIndicator,
  },

  data () {
    return {
      activeCentreId: undefined,
      activeCentreTab: undefined,
      activeHour: undefined,
      activeInspecteurRow: undefined,
      activePlace: undefined,
      currentWeekNb: (this.$route.params.date ? getFrenchLuxonFromSql(this.$route.params.date) : getFrenchLuxonCurrentDateTime()).toISOWeekDate().split('-'),
      date: this.$route.params.date || getFrenchLuxonCurrentDateTime().toISODate(),
      datePicker: false,
      deleteMode: false,
      headers: undefined,
      inspecteursData: [],
      isAvailable: true,
      isBooked: false,
      isComputing: false,
      isParseInspecteursPlanningLoading: false,
      selectedPlaceInfo: undefined,
      lastActiveCenters: [],
    }
  },

  computed: {
    ...mapGetters(['activeDepartement']),
    ...mapState({
      isFetching (state) {
        const {
          places,
          inspecteurs,
        } = state.admin
        return places.isFetching ||
          inspecteurs.isFetching ||
          places.isDeletingBookedPlace ||
          places.isDeletingAvailablePlace ||
          places.isCreating
      },

      currentWeekNumber () {
        return `${this.currentWeekNb[0]}-${this.currentWeekNb[1]}`
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

    beginDate () {
      return getFrenchLuxonFromSql(this.date).startOf('day').toISO()
    },

    endDate () {
      return getFrenchLuxonFromSql(this.date).endOf('day').toISO()
    },

    pickerDate () {
      return this.date.split('-').reverse().join('/')
    },

    isLoading () {
      return this.isFetching ||
        this.isComputing
    },
  },

  watch: {
    async date (newDay) {
      const dateTimeFromSQL = getFrenchLuxonFromSql(newDay)
      this.currentWeekNb = dateTimeFromSQL.toISOWeekDate().split('-')
      this.activeCentreId = this.$route.params.center || this.firstCentreId
      this.updateCenterInRoute()
      if (this.$store.state.admin.departements.active) {
        await this.$store
          .dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, { begin: this.beginDate, end: this.endDate })
        this.parseInspecteursPlanning()
      }
    },

    async activeDepartement (newDepartement) {
      const center = this.lastActiveCenters[newDepartement] || this.firstCentreId
      await this.$store
        .dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, { begin: this.beginDate, end: this.endDate })
      if (this.placesByCentreList.some(el => el.centre._id === center)) {
        this.activeCentreId = center
      } else {
        this.activeCentreId = this.firstCentreId
      }
      this.updateCenterInRoute()
      await this.$store.dispatch(FETCH_INSPECTEURS_BY_CENTRE_REQUEST, {
        centreId: this.activeCentreId,
        begin: this.beginDate,
        end: this.endDate,
      })

      this.parseInspecteursPlanning()
    },

    async activeCentreId (newCentreId) {
      this.lastActiveCenters[this.activeDepartement] = newCentreId
      await this.updateStoreCenterSelected(newCentreId)
      this.activeCentreTab = `tab-${newCentreId}`
    },
  },

  async mounted () {
    if (this.placesByCentreList && this.placesByCentreList.length) {
      const centerId = this.$route.params.center
      this.activeCentreId = centerId || this.firstCentreId
      this.lastActiveCenters[this.activeDepartement] = this.activeCentreId
      this.reloadWeekMonitor()
    }
  },

  async beforeMount () {
    this.headers = creneauTemplate

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
      this.date = getFrenchLuxonFromObject(date).toISODate()
      return
    }

    this.date = getFrenchLuxonFromObject(defaultDate).toISODate()
  },

  methods: {
    displayOnlyNumberOfWeek () {
      return `${this.currentWeekNb[1].replace('W', '')}`
    },

    closeDetails () {
      this.activeInspecteurRow = undefined
      this.activeHour = undefined
    },

    goto (selectedDate) {
      const [nb, scale] = selectedDate.split(' ')
      const luxonDate = getFrenchLuxonFromIso(this.date).plus({ [scale]: +nb })
      this.date = luxonDate.toISODate()
    },

    async updateStoreCenterSelected (centreId) {
      if (this.placesByCentreList && this.placesByCentreList.length) {
        const { centre } = this.placesByCentreList.find(placesByCentre => placesByCentre.centre._id === centreId)
        await this.$store.dispatch(SELECT_CENTER, centre)
      }
    },

    async reloadWeekMonitor () {
      const centerId = this.$route.params.center
      this.activeCentreId = (centerId) || this.firstCentreId
      await this.$store.dispatch(FETCH_INSPECTEURS_BY_CENTRE_REQUEST, { centreId: this.activeCentreId, begin: this.beginDate, end: this.endDate })
      await this.$store
        .dispatch(FETCH_ADMIN_DEPARTEMENT_ACTIVE_INFO_REQUEST, { begin: this.beginDate, end: this.endDate })
      this.parseInspecteursPlanning()
    },

    async centreSelector (centreId) {
      this.$router.push({ params: { center: centreId, date: this.date } })
      this.activeCentreId = centreId
      this.reloadWeekMonitor()
    },

    parseInspecteursPlanning () {
      this.isComputing = true
      this.inspecteursData = []
      const [, ...creneaux] = creneauTemplate

      const dateTofind = getFrenchLuxonFromSql(this.date).toISODate()

      const activeCenterAndPlaces = this.placesByCentreList.find(placesByCentre => placesByCentre.centre._id === this.activeCentreId)
      const weekPlaces = activeCenterAndPlaces &&
        activeCenterAndPlaces.places &&
        activeCenterAndPlaces.places[this.currentWeekNumber]
      if (!weekPlaces) {
        this.isComputing = false
        return
      }

      const dayPlaces = weekPlaces.filter(plc => getFrenchLuxonFromIso(plc.date).toISODate() === dateTofind)

      if (dayPlaces && dayPlaces.length) {
        this.inspecteursData = this.inspecteurs.map(inspecteur => {
          const filteredCreneaux = dayPlaces.filter(plce => inspecteur._id === plce.inspecteur)
            .map(place => {
              const currentHourString = getFrenchLuxonFromIso(place.date).toFormat("HH'h'mm")
              if (creneaux.some(crn => crn === currentHourString)) {
                return {
                  place,
                  hour: currentHourString,
                }
              }
            })
            .filter(plce => plce)

          if (filteredCreneaux.length < numberOfCreneau) {
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
              if (currentCreneau.hour < creneauToCompare.hour) return -1
              if (currentCreneau.hour > creneauToCompare.hour) return 1
              return 0
            }),
          }
        })
      }
      if (!this.inspecteursData.length) {
        this.inspecteursData = this.inspecteurs
      } else {
        this.inspecteursData = this.inspecteursData.filter(inspecteurInfo =>
          inspecteurInfo.creneau.some(item => item.place && item.place.centre === this.activeCentreId))
      }

      this.isComputing = false
    },

    async setActiveInspecteurRow (inspecteurId, placeInfo) {
      this.deleteMode = false
      const hour = placeInfo && placeInfo.hour
      const place = placeInfo && placeInfo.place
      if (this.activeInspecteurRow === inspecteurId && hour === this.activeHour) {
        this.activeInspecteurRow = undefined
        this.activeHour = undefined
        return
      }

      this.activeHour = hour
      const candidatId = place && place.candidat
      this.activeInspecteurRow = inspecteurId
      this.activeCandidatId = candidatId
      this.selectedPlaceInfo = placeInfo

      this.activePlace = place

      const departement = this.$store.state.admin.departements.active
      if (candidatId) {
        return this.$store.dispatch(FETCH_CANDIDAT_REQUEST, { candidatId, departement })
      }
      return this.$store.commit(RESET_CANDIDAT)
    },

    activeDeleteMode (inspecteurId, placeInfo) {
      this.activeHour = undefined
      if (this.deleteMode && this.activeInspecteurRow === inspecteurId) {
        this.activeInspecteurRow = undefined
        return
      }
      this.deleteMode = true
      this.activeInspecteurRow = inspecteurId
    },

    updateCenterInRoute () {
      this.$router.push({ params: { center: this.activeCentreId, date: this.date } })
    },
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

.center-content-wrapper {
  overflow-x: auto;
  transform: scale(1, 1);
}

.table {
  border-collapse: collapse;
  background-color: white;
}

.page-title {
  margin-top: 4em;
}

.place-button {
  transition: all 0.6s ease-in-out;

  &.active {
    background-color: #bde;
  }
}

.inspecteur-button {
  transition: all 0.6s ease-in-out;

  &.active {
    background-color: #bde;
  }
}

.place-details {
  overflow: hidden;
  max-height: 0;
  transition: all 0.6s ease-in-out;

  &.active {
    background-color: #bde;
    max-height: 300px;
  }
}

.refresh-btn {
  margin: 1em;
}

.name-ipcsr-wrap {
  margin-left: 10%;
  margin-top: 7%;
  min-width: 60%;
}
</style>
