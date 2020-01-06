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
        v-on="on"
      >
        <v-icon color="primary">
          edit
        </v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title
        class="headline grey lighten-2"
        primary-title
      >
        Modification de {{ centre }}
      </v-card-title>

      <center-form
        ref="updateForm"
        :add-centre="false"
        :default-values="item"
        @change="getFormData"
      />
      <v-card-text>
        Voulez-vous vraiment modifier ce centre <strong>{{ centre }}</strong> ?
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
          @click="sendFormData()"
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
    item: {
      type: Object,
      default: () => {},
    },
    centre: {
      type: String,
      default: 'un centre',
    },
  },

  data () {
    return {
      showDialog: false,
      nom: '',
      adresse: '',
      lon: '',
      lat: '',
    }
  },

  methods: {
    getFormData ({
      nom,
      label,
      adresse,
      lon,
      lat,
    }) {
      this.nom = nom
      this.label = label
      this.adresse = adresse
      this.lon = lon
      this.lat = lat
    },

    sendFormData () {
      this.close()
      this.$emit('click', {
        id: this.item._id,
        nom: this.nom,
        label: this.label,
        adresse: this.adresse,
        lon: this.lon,
        lat: this.lat,
      })
    },

    close () {
      this.showDialog = false
      this.$refs.updateForm.resetForm()
    },
  },
}
</script>
