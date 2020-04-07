<template>
  <v-dialog
    v-model="showDialog"
    width="500"
    @click:outside="close"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        slot="activator"
        icon
        class="t-centre-edit-btn"
        v-on="on"
      >
        <v-icon color="primary">
          edit
        </v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline  grey  lighten-2"
        primary-title
      >
        Modification de {{ centreName }}
      </v-card-title>

      <center-form
        ref="updateForm"
        :key="centre._id"
        :add-centre="false"
        :default-values="centre"
        @change="getFormData"
      />

      <v-card-text>
        Voulez-vous vraiment modifier ce centre <strong>{{ centreName }}</strong> ?
      </v-card-text>

      <v-divider />

      <v-card-actions right>
        <v-spacer />
        <v-btn
          color="#CD1338"
          tabindex="0"
          outlined
          @click="close"
        >
          Annuler
        </v-btn>

        <v-btn
          color="primary"
          class="t-update-centre-submit"
          @click="sendFormData"
        >
          Oui, modifier
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import CenterForm from './CenterForm'

export default {

  components: {
    CenterForm,
  },

  props: {
    centre: {
      type: Object,
      default: () => {},
    },

    centreName: {
      type: String,
      default: 'un centre',
    },
  },

  data () {
    return {
      showDialog: false,
    }
  },

  methods: {
    getFormData ({
      nom,
      label,
      adresse,
      lon,
      lat,
      geoDepartement,
    }) {
      this.centre.nom = nom
      this.centre.label = label
      this.centre.adresse = adresse
      this.centre.lon = lon
      this.centre.lat = lat
      this.centre.geoDepartement = geoDepartement
    },

    sendFormData () {
      this.close()
      this.$emit('click', {
        id: this.centre._id,
        nom: this.centre.nom,
        label: this.centre.label,
        adresse: this.centre.adresse,
        lon: this.centre.lon,
        lat: this.centre.lat,
        geoDepartement: this.centre.geoDepartement,
      })
    },

    close () {
      this.showDialog = false
      this.$refs.updateForm.resetForm()
    },
  },
}
</script>
