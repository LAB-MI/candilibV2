<template>
  <v-flex>
    <div class="c-two-hexagons">
      <hexagon
        v-for="departement in admin.departements.list"
        :key="departement"
        :value="departement"
        :active="activeDepartement === departement"
        @click="activeDepartement = departement"
      />
      </div>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'

import Hexagon from '@/components/Hexagon.vue'
import { SELECT_DEPARTEMENT } from '@/store'

export default {
  components: {
    Hexagon,
  },

  computed: {
    ...mapState(['admin']),
    activeDepartement: {
      get () {
        return this.admin.departements.active
      },
      set (departement) {
        this.$store.dispatch(SELECT_DEPARTEMENT, departement)
      },
    },
  },
}
</script>

<style lang="stylus" scoped>
.c-two-hexagons {
  position: relative;
  width: 3em;
  height: 3.5em;
  font-size: 0.9em;

  @media (max-width: 767px) {
    width: 2em;
    height: 2.5em;
  }

  .hexagon-wrapper:first-child {
    position: absolute;
    top: -0.5em;
    left: 0;
  }

  .hexagon-wrapper:last-child {
    position: absolute;
    bottom: -0.5em;
    right: -0.75em;
  }
}
</style>
