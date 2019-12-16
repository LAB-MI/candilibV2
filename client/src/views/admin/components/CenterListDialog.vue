<template>
  <v-dialog
    v-model="showDialog"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        slot="activator"
        icon
        v-on="on"
      >
        <v-icon>edit</v-icon>
      </v-btn>
      {{ active ? 'Actif' : 'Désactivé' }}
    </template>

    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        {{ action }} {{ centre }}
      </v-card-title>

      <v-card-text>
        Voulez-vous vraiment {{ action.toLowerCase() }} ce centre <strong>{{ centre }}</strong> ?
      </v-card-text>

      <v-divider />

      <v-card-actions right>
        <v-spacer />
        <v-btn
          color="#CD1338"
          tabindex="0"
          outlined
          @click="showDialog = false"
        >
          Annuler
        </v-btn>
        <v-btn
          color="primary"
          @click="$emit('click'); showDialog = false"
        >
          Oui, {{ action.toLowerCase() }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    centre: {
      type: String,
      default: 'un centre',
    },
    action: {
      type: String,
      default: 'Désactiver',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },

  data () {
    return {
      showDialog: false,
    }
  },
}
</script>
