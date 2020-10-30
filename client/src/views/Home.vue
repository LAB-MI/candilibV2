<template>
  <div class="u-flex  u-flex--center">
    <div class="d-flex">
      <v-btn
        dark
        tag="a"
        :to="pathCandidat"
        color="#33ADC0"
      >
        Candidat
      </v-btn>
      <v-btn
        dark
        tag="a"
        to="/admin"
        color="#CC0000"
      >
        Admin
      </v-btn>
    </div>
  </div>
</template>

<script>
import { isBuildWithInfoCovid } from '../router'
export default {
  data () {
    return {
      pathCandidat: isBuildWithInfoCovid ? '/informations' : '/candidat',
    }
  },
}
</script>
