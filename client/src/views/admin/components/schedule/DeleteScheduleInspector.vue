<template>
  <v-card class="details">
    <v-btn
      v-for="info in buttonsInfos"
      :key="info.buttonDeleteType"
      :color="deleteType === info.buttonDeleteType ? '#DC143C' : info.colorButton"
      @click="selectTypeOfDelete(info.buttonDeleteType)"
    >
      <span
        class="btn-text"
      >
        {{ $formatMessage({ id: info.buttonMessage }) }}
      </span>
      &nbsp;
      &nbsp;
      <v-icon
        v-for="icon in info.buttonIcons"
        :key="icon"
        color="white"
      >
        {{ icon }}
      </v-icon>
    </v-btn>
    <confirm-box
      v-if="!isCancel"
      :close-action="cancelAction"
      :submit-action="deleteInspecteurPlaces"
    />
  </v-card>
</template>

<script>
import {
  getFrenchLuxonFromIso,
  getFrenchLuxonFromObject,
  hoursRangeOfDay,
} from '@/util'

import { DELETE_INSPECTEUR_PLACES_REQUEST } from '@/store'

import ConfirmBox from '@/components/ConfirmBox.vue'

const DELETE_ALL_PLACES = 'DELETE_ALL_PLACES'
const DELETE_MORNING_PLACES = 'DELETE_MORNING_PLACES'
const DELETE_AFTERNOON_PLACES = 'DELETE_AFTERNOON_PLACES'

export default {
  components: {
    ConfirmBox,
  },

  props: {
    closeDetails: {
      type: Function,
      default () {},
    },
    inspecteurId: {
      type: String,
      default: '',
    },
    placeInfo: {
      type: Object,
      default () {},
    },
  },

  data () {
    return {
      isCancel: true,
      deleteType: undefined,
      buttonsInfos: [],
    }
  },

  mounted () {
    this.buttonsInfos = [
      {
        colorButton: 'grey',
        buttonDeleteType: DELETE_ALL_PLACES,
        buttonMessage: 'delete_whole_day_s_places',
        buttonIcons: ['wb_sunny', 'brightness_3'],
      },
      {
        colorButton: 'grey',
        buttonDeleteType: DELETE_MORNING_PLACES,
        buttonMessage: 'delete_morning_places',
        buttonIcons: ['wb_sunny'],
      },
      {
        colorButton: 'grey',
        buttonDeleteType: DELETE_AFTERNOON_PLACES,
        buttonMessage: 'delete_afternoon_places',
        buttonIcons: ['brightness_3'],
      },
    ]
  },

  methods: {
    cancelAction () {
      this.isCancel = true
      this.deleteType = undefined
    },

    selectTypeOfDelete (deleteType) {
      this.deleteType = deleteType
      this.isCancel = false
    },

    selectDeleteType () {

    },

    getMorningOrAfternoonTimeSlots (placeInfos, deleteType) {
      if (!deleteType || !placeInfos || !placeInfos.place) {
        return false
      }
      const dateToCompare = getFrenchLuxonFromIso(placeInfos.place.date)
      let hoursRangeBegin
      let hoursRangeEnd
      if (deleteType === DELETE_MORNING_PLACES) {
        hoursRangeBegin = hoursRangeOfDay.morning.begin
        hoursRangeEnd = hoursRangeOfDay.morning.end
      }
      if (deleteType === DELETE_AFTERNOON_PLACES) {
        hoursRangeBegin = hoursRangeOfDay.afternoon.begin
        hoursRangeEnd = hoursRangeOfDay.afternoon.end
      }

      const startComparatorDate = getFrenchLuxonFromObject({
        year: dateToCompare.year,
        month: dateToCompare.month,
        day: dateToCompare.day,
        ...hoursRangeBegin,
      })
      const endComparatorDate = getFrenchLuxonFromObject({
        year: dateToCompare.year,
        month: dateToCompare.month,
        day: dateToCompare.day,
        ...hoursRangeEnd,
      })

      if (dateToCompare >= startComparatorDate && dateToCompare <= endComparatorDate) {
        return true
      }
    },

    async deleteInspecteurPlaces () {
      let typeFilter
      if (this.deleteType === DELETE_ALL_PLACES) {
        typeFilter = el => el.place
      }
      if (this.deleteType === DELETE_MORNING_PLACES) {
        typeFilter = el => this.getMorningOrAfternoonTimeSlots(el, DELETE_MORNING_PLACES)
      }
      if (this.deleteType === DELETE_AFTERNOON_PLACES) {
        typeFilter = el => this.getMorningOrAfternoonTimeSlots(el, DELETE_AFTERNOON_PLACES)
      }
      const toDispatch = this.placeInfo.creneau
        .filter(typeFilter).map(el => el.place._id)
      await this.$store.dispatch(DELETE_INSPECTEUR_PLACES_REQUEST, toDispatch)
      this.deleteType = undefined
      this.isCancel = true
      this.closeDetails()
      this.$emit('reloadWeekMonitor')
    },
  },
}
</script>

<style lang="stylus" scoped>
.details {
  padding: 1em;
  margin: 1em;
}

.btn-text {
  color: white;
}
</style>
