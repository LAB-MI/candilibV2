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
        :default-values="defaultCentreDialog"
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
      defaultCentreDialog: { ...this.centre },
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
      this.defaultCentreDialog.nom = nom
      this.defaultCentreDialog.label = label
      this.defaultCentreDialog.adresse = adresse
      this.defaultCentreDialog.lon = lon
      this.defaultCentreDialog.lat = lat
      this.defaultCentreDialog.geoDepartement = geoDepartement
    },

    sendFormData () {
      this.$emit('click', {
        id: this.defaultCentreDialog._id,
        nom: this.defaultCentreDialog.nom,
        label: this.defaultCentreDialog.label,
        adresse: this.defaultCentreDialog.adresse,
        lon: this.defaultCentreDialog.lon,
        lat: this.defaultCentreDialog.lat,
        geoDepartement: this.defaultCentreDialog.geoDepartement,
      })
      this.close()
    },

    close () {
      this.showDialog = false
      this.defaultCentreDialog = { ...this.centre }
      this.$refs.updateForm.resetForm()
    },
  },
}
</script>
