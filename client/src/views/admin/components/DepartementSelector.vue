<template>
  <v-layout v-if="admin.departements.list.length > 2">
    <v-menu
      bottom
    >

      <template v-slot:activator="{ on: menu }">
        <v-tooltip bottom>
          <template v-slot:activator="{ on: tooltip }">
          <v-btn
            fab
            v-on="{ ...menu, ...tooltip}"
            outline
            ripple
            small
          >
            <h1>{{ `${activeDepartement}` }}</h1>
          </v-btn>
          </template>
          <span>Changer de departement</span>
        </v-tooltip>
      </template>
      <v-list>
        <v-list-tile
          v-for="(departement, i) in admin.departements.list"
          :key="i"
          @click="activeDepartement = departement"
        >
          <v-chip
            outlined
          >
            {{ departement }}
          </v-chip>
        </v-list-tile>
      </v-list>
    </v-menu>
  </v-layout>
  <v-flex v-else>
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
