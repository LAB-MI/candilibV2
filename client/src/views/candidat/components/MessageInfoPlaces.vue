<template>
  <div class="text-center col-gray pa-1">
    <v-icon>
      info
    </v-icon>
    <span v-if="!isInRecentelyDept">{{ $formatMessage({ id: 'messsage_mise_a_disposition_des_places' }) }} {{ hourVisibility }}</span>
    <span v-else>
      Votre horaire d’accès aux places d’examen est 12H00 sur votre département de résidence, et {{ hourVisibility }} sur les autres départements
    </span>
  </div>
</template>
<script>
export default {
  name: 'MessageInfoPlaces',
  computed: {
    hourVisibility () {
      return this.$store.state.candidat?.me?.visibilityHour
    },
    isInRecentelyDept () {
      const candidat = this.$store.state.candidat
      return !!candidat?.me?.isInRecentlyDept
    },
  },
}
</script>
