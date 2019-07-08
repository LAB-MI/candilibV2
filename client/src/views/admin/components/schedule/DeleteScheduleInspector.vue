<template>
  <v-card class="details">
    <v-btn
      :disabled="flag === 1"
      @click="selectTypeOfDelete(1)"
    >
      Supprimer la journnée
    </v-btn>
    <v-btn
      :disabled="flag === 2"
      @click="selectTypeOfDelete(2)"
    >
      Supprimer la matinée
    </v-btn>
    <v-btn
      :disabled="flag === 3"
      @click="selectTypeOfDelete(3)"
    >
      Supprimer l'apès-midi
    </v-btn>
    <confirm-box
      v-if="!isCancel"
      :close-action="cancelAction"
      :submit-action="deleteInspecteurPlaces"
    >
    </confirm-box>
  </v-card>
</template>

<script>
import ConfirmBox from '@/components/ConfirmBox.vue'
import {
  getFrenchLuxonFromIso,
  getFrenchLuxonFromObject,
} from '@/util'

export default {
  components: {
    ConfirmBox,
  },

  props: {
    placeInfo: Object,
    inspecteurId: String,
  },

  data () {
    return {
      isCancel: true,
      flag: undefined,
    }
  },

  methods: {
    cancelAction () {
      this.isCancel = true
      this.flag = undefined
    },

    selectTypeOfDelete (flag) {
      this.flag = flag
      this.isCancel = false
    },

    getMorningOrAfternoonTimeSlots (placeInfos, status) {
      if (!status || !placeInfos || !placeInfos.place) {
        return false
      }
      const dateToCompare = getFrenchLuxonFromIso(placeInfos.place.date)
      if (status === 1) {
        const startComparatorDate = getFrenchLuxonFromObject({
          year: dateToCompare.year,
          month: dateToCompare.month,
          day: dateToCompare.day,
          hour: 8,
          minute: 0,
        })
        const endComparatorDate = getFrenchLuxonFromObject({
          year: dateToCompare.year,
          month: dateToCompare.month,
          day: dateToCompare.day,
          hour: 11,
          minute: 30,
        })

        if (dateToCompare >= startComparatorDate && dateToCompare <= endComparatorDate) {
          return true
        }
      }
      if (status === 2) {
        const startComparatorDate = getFrenchLuxonFromObject({
          year: dateToCompare.year,
          month: dateToCompare.month,
          day: dateToCompare.day,
          hour: 13,
          minute: 30,
        })
        const endComparatorDate = getFrenchLuxonFromObject({
          year: dateToCompare.year,
          month: dateToCompare.month,
          day: dateToCompare.day,
          hour: 15,
          minute: 30,
        })
        if (dateToCompare >= startComparatorDate && dateToCompare <= endComparatorDate) {
          return true
        }
      }
    },

    deleteInspecteurPlaces () {
      if (this.flag === 1) {
        const toDispatch = {
          inspecteur: this.inspecteurId,
          placesToDelete: this.placeInfo.creneau.filter(el => el.place).map(el => el.place._id),
        }
        console.log('qwertyuiop1', toDispatch)

      // return this.$store.dispatch(DELETE_INSPECTEUR_PLACES_REQUEST, toDispatch)
      }
      if (this.flag === 2) {
        const toDispatch = {
          inspecteur: this.inspecteurId,
          placesToDelete: this.placeInfo.creneau.filter(el => this.getMorningOrAfternoonTimeSlots(el, 1)).map(el => el.place._id),
        }
        console.log('qwertyuiop2', toDispatch)
      }
      if (this.flag === 3) {
        const toDispatch = {
          inspecteur: this.inspecteurId,
          placesToDelete: this.placeInfo.creneau.filter(el => this.getMorningOrAfternoonTimeSlots(el, 2)).map(el => el.place._id),
        }
        console.log('qwertyuiop3', toDispatch)
      }

      // return this.$store.dispatch(DELETE_INSPECTEUR_PLACES_REQUEST, toDispatch)
      this.flag = undefined
      this.isCancel = true
    },
  },
}
</script>

<style lang="stylus" scoped>
.details {
  padding: 1em;
  margin: 1em;
}

.btn-details {
  transition: all 0.6s ease-in-out;

  &.active {
    background-color: red;
  }
}
</style>
