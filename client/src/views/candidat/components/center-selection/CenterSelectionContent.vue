<template>
  <v-card-text
    :class="{
      'blue-grey  lighten-5  blue-grey--text  text--lighten-2  font-italic': !hasPlaces
    }"
    v-on="{ [hasPlaces && 'click']: selectCenter }"
  >
    <div
      class="u-flex"
      :class="{'u-flex u-pointer': hasPlaces}"
    >
      <v-list-item-content v-ripple="hasPlaces">
        <v-list-item-title>
          <span class="u-uppercase">
            {{ center.centre.nom }}
          </span>
        </v-list-item-title>

        <v-list-item-subtitle
          class="u-flex__item--grow"
          :class="{'blue-grey--text  text--lighten-2': !hasPlaces}"
        >
          {{ center.centre.adresse }}
        </v-list-item-subtitle>

        <span
          v-if="!hasPlaces"
          class="u-flex__item--grow  blue-grey--text  text--darken-2"
        >
          Plus de place disponible pour le moment
        </span>
      </v-list-item-content>

      <a
        v-ripple
        target="_blank"
        class="location-icon  u-flex"
        :href="href"
        @click.stop="() => true"
      >
        <v-icon>
          location_on
        </v-icon>
      </a>
    </div>
  </v-card-text>
</template>

<script>
import { SELECT_CENTER } from '@/store/center'
export default {
  props: {
    center: {
      type: Object,
      default () {},
    },
  },

  computed: {
    hasPlaces () {
      return !!this.center.count
    },

    href () {
      const [lon, lat] = this.center.centre.geoloc.coordinates
      return `http://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=24`
    },

    firstMonthOfTimeSlotsList () {
      const { list } = this.$store.state.timeSlots
      return list.length ? list[0].month : 'undefinedMonth'
    },
  },

  methods: {
    async selectCenter () {
      const center = this.center
      if (!center.count) {
        return
      }
      await this.$store.dispatch(SELECT_CENTER, center.centre)
      this.$router.push({
        name: 'time-slot',
        params: {
          center: `${center.centre.nom}`,
          departement: `${center.centre.geoDepartement}`,
          month: this.firstMonthOfTimeSlotsList,
          day: this.$route.params.day || 'undefinedDay',
          // params modifying is not always define
          modifying: (this.$route.params.modifying === 'modification' || this.$store.state.reservation.isModifying)
            ? 'modification' : 'selection',
        },
      })
    },
  },
}
</script>

<style lang="postcss" scoped>
.location-icon {
  border-left: 1px solid rgba(150, 150, 150, 0.5);
  height: 3em;
  padding: 0 1.5em;
  text-decoration: none;
}

.color {
  color: grey;
}

</style>
