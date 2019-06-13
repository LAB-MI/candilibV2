<template>
  <v-list-tile
    @click="() => {}"
  >
    <v-list-tile-action v-if="whitelisted !== 'new'">
      <v-dialog
        v-model="show"
        width="500"
      >
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon color="#17a2b8">delete</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-title
            class="headline grey lighten-2"
            primary-title
          >
            Suppression de
            <strong> {{ whitelisted.email }}</strong>
          </v-card-title>

          <v-card-text>
            Voulez-vous vraiment supprimer l'adresse <strong>{{ whitelisted.email }}</strong> de la whitelist ?
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions right>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              outline
              @click="show = false"
            >
              Annuler
            </v-btn>

            <v-btn
              color="primary"
              @click="remove"
            >
              Oui, supprimer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-list-tile-action>

    <v-list-tile-content>
      <v-list-tile-title>{{ whitelisted.email }}</v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
export default {
  name: 'whitelisted',

  props: {
    removeFromWhitelist: Function,
    whitelisted: Object,
  },

  data () {
    return {
      show: false,
    }
  },

  methods: {
    async remove () {
      await this.removeFromWhitelist(this.whitelisted._id)
      this.show = false
    },
  },
}
</script>
