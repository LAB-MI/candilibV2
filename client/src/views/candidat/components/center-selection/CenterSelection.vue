<template>
  <div>
    <v-toolbar>
      <v-toolbar-title>
        CHOIX DU CENTRE
      </v-toolbar-title>
    </v-toolbar>
    <v-card>
      <v-list three-line>
        <center-selection-content
          v-for="center in center.list"
          :key="center._id"
          :center="center"
        />
      </v-list>
    </v-card>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import CenterSelectionContent from './CenterSelectionContent'
import { FETCH_CENTERS_REQUEST } from '@/store/center'

export default {
  components: {
    CenterSelectionContent,
  },
  computed: {
    ...mapState(['center'])
  },
  async mounted () {
    await this.$store.dispatch(FETCH_CENTERS_REQUEST)
  },
}
</script>

<style>
</style>
