<template>
  <v-flex>
    <div class="c-two-hexagons">
      <hexagon
        v-for="departement in admin.departements.list"
        :key="departement"
        :value="departement"
        :active="Number(activeDepartement === departement)"
        @click="activeDepartement = departement"
      />
      </div>
  </v-flex>
</template>

<script>
import { mapState } from 'vuex'

import Hexagon from '@/components/Hexagon.vue'
import { SELECT_DEPARTEMENT, FETCH_ADMIN_INFO_REQUEST } from '@/store'

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

  async mounted () {
    await this.$store.dispatch(FETCH_ADMIN_INFO_REQUEST)
  },
}
</script>

<style lang="stylus" scoped>
.c-two-hexagons {
  position: relative;
  width: 3em;
  height: 3.5em;
  font-size: 0.9em;

  .hexagon-wrapper:first-child {
    position: absolute;
    top: 0;
    left: 0;
  }

  .hexagon-wrapper:last-child {
    position: absolute;
    bottom: 0;
    right: 0;
  }
}
</style>
