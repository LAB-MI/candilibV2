<template>
  <v-alert
    v-if="dateEndEtg"
    class="t-warning-etg"
    type="warning"
    style="font-size: 1em;"
  >
    Votre ETG arrive à expiration le {{ dateEndEtg }}, veuillez penser à le renouveler. En l’absence d’ETG valide, vous serez contraint de vous réinscrire sur la plateforme et vous serez comptabilisé parmi les inscriptions les plus récentes.
  </v-alert>
</template>

<script>
import { getFrenchLuxon, getFrenchDateShort, getFrenchLuxonFromIso } from '@/util'
export default {
  computed: {
    dateEndEtg () {
      const dateETG = this.$store.state.candidat.me?.dateETG
      if (!dateETG) return undefined
      const dateTime = getFrenchLuxonFromIso(dateETG)
      if (getFrenchLuxon().plus({ months: 3 }) > dateTime) {
        return getFrenchDateShort(dateTime)
      }
      return undefined
    },
  },
}
</script>
