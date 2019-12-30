<template>
  <div class="u-max-width">
    <page-title title="Centres d'examens" />
    <v-container>
      <v-card>
        <h3 class="text-xs-center">
          Ajouter un centre
        </h3>
        <center-create />
      </v-card>

      <v-card class="mt-4">
        <h3 class="text-xs-center">
          Liste des centres
        </h3>
        <v-data-table
          class="centre-grid"
          :headers="headers"
          :items="centres"
          must-sort
          :sort-by="['departement', 'nom']"
        >
          <template
            v-slot:header.departement
            class="pa-0"
          />
          <template
            v-slot:item.nom="{ item }"
          >
            <div class="table-column  u-flex">
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
          </template>
          <template
            v-slot:item.geoloc="{ item }"
          >
            <a
              target="_blank"
              class="table-column  u-flex"
              :href="href(item.geoloc.coordinates)"
              @click.stop="() => true"
            >
              <v-icon>
                location_on
              </v-icon>
            </a>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { FETCH_ALL_CENTERS_REQUEST, CHANGE_CENTER_STATE_REQUEST } from '@/store'
import centerCreate from './CenterCreate'

export default {
  components: {
    centerCreate,
  },

  data () {
    return {
      headers: [
        { text: '', value: 'departement', align: 'center' },
        { text: 'Centre', value: 'nom' },
        { text: '', value: 'geoloc', sortable: false, align: 'center' },
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

    changeState (id, active) {
      this.$store.dispatch(CHANGE_CENTER_STATE_REQUEST, { id, active })
    },
  },
}
</script>

<style lang="stylus" scoped>
.table-column {
  border-left: 1px solid rgba(150, 150, 150, 0.5);
  height: 3em;
  padding: 0 1.5em;
  text-decoration: none;
}

.centre-grid {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  width: auto;

  >>> td {
    padding: 0;
  }
}

h3 {
  padding-top: 1em;
  padding-left: 1em;
}

</style>
