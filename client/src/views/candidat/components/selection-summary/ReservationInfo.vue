<template>
  <div>
    <h3 class="text--center name-center-case">{{ infoResa.nom }}</h3>
    <p class="text--center">
      {{ infoResa.adresse }}
      <a
        target="_blank"
        class="location-icon"
        v-ripple
        :href="href"
      >
        <v-icon>
          location_on
        </v-icon>
      </a>
    <p class="text--center">
        Le
        {{ infoResa.date }}
    </p>
  </div>
</template>

<script>
export default {
  props: {
    infoResa: Object,
  },
  computed: {
    href () {
      if (!this.infoResa.centre) {
        return
      }
      const [lon, lat] = this.infoResa.centre.geoloc.coordinates
      return `http://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=24`
    },
  },
}
</script>

<style lang="postcss" scoped>
.location-icon {
  display: inline-block;
  margin-left: 0.5em;
  padding-left: 0.5em;
  border-left: 1px solid grey;
}
</style>
