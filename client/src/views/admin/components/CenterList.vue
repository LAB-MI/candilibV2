<template>
  <div class="u-max-width">
    <page-title title="Centres d'examens" />    <v-container>
      <v-card
        :style="{ padding: '1em 0', position: 'relative' }"
      >
        <v-list
          class="centre-grid"
        >
          <v-list-item
            v-for="centre in centres"
            :key="centre._id"
            :disabled="!centre.active"
            :class="{
              'blue-grey  lighten-5  blue-grey--text  text--lighten-2  font-italic': !centre.active
            }"
            @click="() => {}"
          >
            <v-card-text>
              <div
                class="u-flex"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    <span class="u-uppercase">
                      {{ centre.nom }}
                    </span>

                    ({{ centre.departement }})
                  </v-list-item-title>

                  <v-list-item-subtitle
                    class="u-flex__item--grow"
                  >
                    {{ centre.adresse }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </div>
            </v-card-text>
            <v-icon>{{ centre.active ? 'check' : 'error' }}</v-icon>
            {{ centre.active ? 'Actif' : 'Désactivé' }}
          </v-list-item>
        </v-list>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { FETCH_ALL_CENTERS_REQUEST } from '../../../store'
export default {
  computed: {
    centres () {
      return this.$store.state.admin.centres.list
    },
  },
  mounted () {
    this.$store.dispatch(FETCH_ALL_CENTERS_REQUEST)
  },
}
</script>

<style lang="postcss" scoped>

.centre-grid {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  width: auto;
}

</style>
