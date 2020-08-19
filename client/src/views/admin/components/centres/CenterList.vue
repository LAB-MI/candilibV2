<template>
  <div class="u-max-width">
    <page-title title="Centres d'examens" />    <v-container>
      <v-card class="pa-2">
        <h3 class="text-center">
          Ajouter un centre
        </h3>
        <center-form :add-centre="true" />
      </v-card>

      <v-card class="mt-4">
        <h3 class="text-center">
          Liste des centres
        </h3>
        <v-data-table
          :headers="headers"
          :items="centres"
          :items-per-page="5"
          class="elevation-1  centre-grid  t-list-centres"
        >
          <template
            v-slot:item.nom="{ item: centre }"
          >
            <div class="u-flex">
              <v-list-item-content>
                <v-list-item-title>
                  <span
                    class="u-uppercase"
                    :class="centre.active !== false ? '' : 'blue-grey--text'"
                  >
                    {{ centre.nom }}
                  </span>
                </v-list-item-title>

                <v-list-item-subtitle
                  class="blue-grey--text"
                >
                  {{ centre.active !== false ? centre.adresse : "Ce centre est archivé." }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </div>
          </template>
          <template
            v-slot:item.geoloc="{ item: centre }"
          >
            <a
              class="pa-2 "
              target="_blank"
              :href="href(centre.geoloc.coordinates)"
              @click.stop="() => true"
            >
              <v-icon>
                location_on
              </v-icon>

            </a>
          </template>
          <template
            v-slot:item.active="{ item: centre }"
          >
            <div
              class="u-flex"
            >
              <center-list-dialog
                :key="`${centre._id}_edit`"
                :centre-name="centre.nom + ' (' + centre.departement + ')'"
                :centre="centre"
                @click="changeCenter"
              />
              <delete-centre
                :key="`${centre._id}_delete`"
                :centre-name="centre.nom + ' (' + centre.departement + ')'"
                :is-active="centre.active !== false"
                @click="changeCenter({id: centre._id, active: !centre.active})"
              />
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { FETCH_ALL_CENTERS_REQUEST, MODIFY_CENTER_REQUEST } from '@/store'
import CenterForm from './CenterForm'
import CenterListDialog from './CenterListDialog'
import DeleteCentre from './DeleteCentre'

export default {
  components: {
    CenterForm,
    CenterListDialog,
    DeleteCentre,
  },

  data () {
    return {
      headers: [
        { text: 'Dépt. administratif', value: 'departement', align: 'center' },
        { text: 'Nom du centre', value: 'nom', class: 't-centre-list-header-name' },
        { text: 'Dépt. geographique', value: 'geoDepartement', align: 'center' },
        { text: 'Géolocalisation', value: 'geoloc', sortable: false, align: 'center' },
        { text: 'Actions', value: 'active', align: 'center', sortable: false },
      ],
    }
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
    href (coordinates) {
      const [lon, lat] = coordinates
      return `http://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=24`
    },

    changeCenter ({ id, nom, label, adresse, lon, lat, active, geoDepartement }) {
      this.$store.dispatch(MODIFY_CENTER_REQUEST, { id, nom, label, adresse, lon, lat, active, geoDepartement })
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
</style>
