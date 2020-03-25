<template>
  <v-card-text>
    <div
      class="u-flex"
      :class="'u-flex u-pointer'"
    >
      <v-list-item-content
        v-ripple
        v-on="{ ['click']: selectDepartement }"
      >
        <v-list-item-title>
          <strong class="u-uppercase">
            {{ departementInfos.departement }}
          </strong>
          &nbsp;
          ({{ departementInfos.count }} {{ departementInfos.count ? 'places disponibles' : 'place disponible' }})
        </v-list-item-title>
        <v-list-item-subtitle
          class="u-flex__item--grow"
          :class="'blue-grey--text  text--lighten-2'"
        >
          <!-- Contient actuellement:
          {{ departementInfos.count }}
          place(s) -->
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-tooltip
        left
        open-on-click
      >
        <template v-slot:activator="{ on }">
          <v-icon
            class="location-icon"
            v-on="on"
          >
            info
          </v-icon>
        </template>
        <div>
          <span
            v-for="{centre, count} in departementInfos.centres"
            :key="centre._id"
          >
            &nbsp; {{ centre.nom }}: {{ count }} place(s) &nbsp;
          </span>
        </div>
      </v-tooltip>
    </div>
  </v-card-text>
</template>

<script>
import { CANDIDAT_SELECT_DEPARTEMENT } from '@/store'

export default {
  props: {
    departementInfos: {
      type: Object,
      default () {},
    },
  },

  computed: {
    // hasPlaces () {
    //   return !!this.departementInfos.count
    // },
  },

  methods: {
    async selectDepartement () {
      const departementInfos = this.departementInfos
      if (!departementInfos.count) {
        return
      }
      await this.$store.dispatch(CANDIDAT_SELECT_DEPARTEMENT, departementInfos)
      this.$router.push({
        name: 'selection-centre',
        params: {
          departement: `${departementInfos.departement}`,
          modifying: (this.$route.params.modifying === 'modification' || this.$store.state.reservation.isModifying)
            ? 'modification' : 'selection',
        },
      })
    },
  },
}
</script>

<style lang="postcss" scoped>
.location-icon {
  border-left: 1px solid rgba(150, 150, 150, 0.5);
  height: 2em;
  padding: 0 1em;
  text-decoration: none;
}

.color {
  color: grey;
}

</style>
