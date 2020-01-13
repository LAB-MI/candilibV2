<template>
  <v-dialog
    v-model="showDialog"
    width="500"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        slot="activator"
        :color="isActive ? '#DC143C' : 'primary'"
        icon
        v-on="on"
      >
        <v-icon class="t-archive-centre-icon">
          {{ isActive ? 'delete' : 'restore_from_trash' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline  grey  lighten-2  t-centre-archive-btn"
        primary-title
      >
        {{ action }} {{ centreName }}
      </v-card-title>

      <v-card-text>
        Voulez-vous vraiment {{ action.toLowerCase() }} ce centre <strong>{{ centreName }}</strong> ?
        <br> Le chargement de places sur un centre archivé est impossible.
        Un centre archivé n'est pas visible par les candidats.
        Un centre peut être archivé seulement lorsqu'il n'a plus de places d'examen.
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
          class="t-archive-centre-submit"
          type="submit"
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
    centreName: {
      type: String,
      default: 'un centre',
    },
    isActive: Boolean,
  },

  data () {
    return {
      showDialog: false,
    }
  },

  computed: {
    action () {
      return this.isActive ? 'Archiver' : 'Réactiver'
    },
  },
}
</script>
