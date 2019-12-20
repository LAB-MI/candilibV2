<template>
  <div class="u-max-width">
    <page-title title="Centres d'examens" />    <v-container>
      <v-card>
        <h3 class="text-xs-center">
          Ajouter un centre
        </h3>
        <center-form />
      </v-card>

      <v-card class="mt-4">
        <h3 class="text-xs-center">
          Liste des centres
        </h3>
        <v-data-table
          class="centre-grid"
        >
          <v-list-item
            v-for="centre in centres"
            :key="centre._id"
            selectable
            :class="{ 'blue-grey  lighten-5': !centre.active }"
          >
            <div class="u-flex">
              <v-list-item-content>
                <v-list-item-title>
                  <span class="u-uppercase">
                    {{ item.nom }}
                  </span>
                </v-list-item-title>

                <v-list-item-subtitle
                  class="blue-grey--text"
                >
                  {{ item.adresse }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </div>
          </v-list-item>
        </v-data-table>
      </v-card>
    </v-container>
  </div>
</template>
          <template
            v-slot:item.geoloc="{ item }"
          >
            <a
              target="_blank"
              class="u-flex"
              :href="href(item.geoloc.coordinates)"
              @click.stop="() => true"
            >
              <v-icon>
                location_on
              </v-icon>
            </a>
          </template>
          <template
            v-slot:item.active="{ item }"
          >
            <center-list-dialog
              :centre="item.nom + ' (' + item.departement + ')'"
              :item="item"
              @click="changeCenter"
            />
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

export default {
  components: {
    CenterForm,
    CenterListDialog,
  },

  data () {
    return {
      headers: [
        { text: '', value: 'departement', align: 'center' },
        { text: '', value: 'nom' },
        { text: '', value: 'geoloc', sortable: false, align: 'center' },
        { text: '', value: 'active', align: 'center', sortable: false },
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

    changeCenter ({ id, nom, label, adresse, lon, lat, active }) {
      this.$store.dispatch(MODIFY_CENTER_REQUEST, { id, nom, label, adresse, lon, lat, active })
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
