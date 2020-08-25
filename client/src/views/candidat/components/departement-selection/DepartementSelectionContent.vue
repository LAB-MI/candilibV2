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
        <v-list-item-title :class="`text-center t-geo-departement-${geoDepartementInfos.geoDepartement}`">
          <strong class="u-uppercase">
            {{ geoDepartementInfos.geoDepartement }}
          </strong>
          &nbsp;
        </v-list-item-title>
        <v-list-item-subtitle
          class="u-flex__item--grow"
          :class="'blue-grey--text  text--lighten-2'"
        />
      </v-list-item-content>
    </div>
    <v-divider />
  </v-card-text>
</template>

<script>
import { CANDIDAT_SELECT_DEPARTEMENT } from '@/store'

export default {
  props: {
    geoDepartementInfos: {
      type: Object,
      default () {},
    },
  },

  methods: {
    async selectDepartement () {
      const geoDepartementInfos = this.geoDepartementInfos
      await this.$store.dispatch(CANDIDAT_SELECT_DEPARTEMENT, geoDepartementInfos)
      this.$router.push({
        name: 'selection-centre',
        params: {
          departement: `${geoDepartementInfos.geoDepartement}`,
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
