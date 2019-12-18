<template>
  <div class="u-max-width">
    <page-title title="Centres d'examens" />    <v-container>
      <v-card>
        <h3 class="text-xs-center">
          Ajouter un centre
        </h3>
        <center-create />
      </v-card>
      <v-divider />

      <v-card>
        <h3 class="text-xs-center">
          Liste des centres
        </h3>
        <v-list
          class="centre-grid"
        >
          <v-list-item
            v-for="centre in centres"
            :key="centre._id"
            selectable
            :class="{ 'blue-grey  lighten-5': !centre.active }"
          >
            <v-card-text>
              <div>
                <v-list-item-content>
                  <v-list-item-title>
                    <span class="u-uppercase">
                      {{ centre.nom }}
                      ({{ centre.departement }})
                    </span>
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ centre.adresse }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </div>
            </v-card-text>
            <!--
            <center-list-dialog
              :centre="centre.nom + ' (' + centre.departement + ')'"
              :action="centre.active ? 'Désactiver' : 'Activer'"
              :active="centre.active"
              @click="changeState(centre._id, !centre.active)"
            />
            -->
          </v-list-item>
        </v-list>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { FETCH_ALL_CENTERS_REQUEST, CHANGE_CENTER_STATE_REQUEST } from '@/store'
import centerCreate from './CenterCreate'
// import centerListDialog from './CenterListDialog'

export default {
  components: {
    centerCreate,
    // centerListDialog,
  },
  computed: {
    centres () {
      return this.$store.state.admin.centres.list
    },
  },
  mounted () {
    this.$store.dispatch(FETCH_ALL_CENTERS_REQUEST)
  },
  methods: {
    changeState (id, active) {
      this.$store.dispatch(CHANGE_CENTER_STATE_REQUEST, { id, active })
    },
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

h3 {
  padding-top: 1em;
  padding-left: 1em;
}

</style>
