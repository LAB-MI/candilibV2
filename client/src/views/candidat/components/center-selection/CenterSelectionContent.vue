<template>
  <v-list-tile
    v-on="{ click: center.count ? () => selectCenter(center) : null}"
    :class="{
      'blue-grey  lighten-5  blue-grey--text  text--lighten-2  font-italic': !center.count
    }"
  >
    <v-list-tile-content v-ripple="!!center.count">
      <v-list-tile-title>
        {{ center.centre.nom }}
        ({{ center.centre.departement }})
      </v-list-tile-title>
      <v-list-tile-sub-title class="u-flex__item--grow" :class="{'blue-grey--text  text--lighten-2': !center.count}">
        {{ center.centre.adresse }}
      </v-list-tile-sub-title>
      <span v-if="!center.count" class="u-flex__item--grow  blue-grey--text  text--darken-2">
        Pas de place disponible pour le moment
      </span>
    </v-list-tile-content>
    <a
      target="_blank"
      class="location-icon  u-flex"
      @click.stop="true"
      v-ripple
      :href="`https://www.openstreetmap.org/search?query=${center.centre.adresse.replace(',', ' ').replace(/FR.*/, '')}`">
      <v-icon>
        location_on
      </v-icon>
    </a>
  </v-list-tile>
</template>

<script>
import { SELECT_CENTER } from '@/store/center'
export default {
  components: {
  },
  props: {
    center: Object,
  },
  methods: {
    async selectCenter (center) {
      if (!center.count) {
        return
      }
      await this.$store.dispatch(SELECT_CENTER, center.centre)
      this.$router.push({
        name: 'time-slot',
        params: {
          center: `${center.centre.nom}`,
          departement: `${center.centre.departement}`,
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
</style>
