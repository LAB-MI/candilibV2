<template>
    <div>
      <h4 v-if="infoSelectedDialog.place && infoSelectedDialog.place.candidat">
        <strong>
          {{ candidat.prenom }}
          {{ candidat.nomNaissance }}
        </strong>
        <strong>
          {{ candidat.codeNeph }}
        </strong>
      </h4>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    infoSelectedDialog: Object,
  },

  computed: {
    ...mapState({
      candidat: (state) => state.candidats.candidat || {},
    }),
  },
}
</script>
