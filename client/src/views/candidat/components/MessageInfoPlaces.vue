<template>
  <div class="text-center col-gray pa-1">
    <v-icon>
      info
    </v-icon>
    <span>{{ $formatMessage({ id: 'messsage_mise_a_disposition_des_places' }) }} {{ hourVisibility }}</span>
  </div>
</template>
<script>
export default {
  name: 'MessageInfoPlaces',
  computed: {
    hourVisibility () {
      return this.$store.state.candidat.me.visibilityHour
    },
  },
}
</script>
