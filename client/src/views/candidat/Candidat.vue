<template>
  <div class="candidat">
    <v-container :style="{ maxWidth: '100vw', paddingLeft: 0, paddingRight: 0 }">
      <candidat-header :header-icons="headerIcons" />
      <div :style="{margin: '4em 0 0 0'}">
        {{ /* TODO: Espace candidat */ }}
        // TODO: Espace candidat
      </div>
    </v-container>
  </div>
</template>

<script>
import CandidatHeader from './components/CandidatHeader'

export default {
  components: {
    CandidatHeader,
  },

  data () {
    return {
      headerIcons: [],
    }
  },
}
</script>
