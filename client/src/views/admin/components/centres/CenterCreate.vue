<template>
  <v-form
    ref="createCenterForm"
    v-model="valid"
    @submit.prevent="createCentre"
  >
    <v-container>
      <v-row class="mx-10">
        <v-text-field
          v-model="nom"
          prepend-icon="edit"
          :aria-placeholder="defaults.nom"
          :hint="'ex. : ' + defaults.nom"
          label="Nom"
          :placeholder="placeholders.nom"
          required
          :rules="generalRules"
          @focus="setPlaceholder('nom')"
          @blur="removePlaceholder('nom')"
        />
        <v-text-field
          v-model="label"
          prepend-icon="comment"
          :aria-placeholder="defaults.label"
          :hint="'ex. : ' + defaults.label"
          label="Étiquette"
          :placeholder="placeholders.label"
          required
          :rules="generalRules"
          @focus="setPlaceholder('label')"
          @blur="removePlaceholder('label')"
        />
      </v-row>
      <v-row class="mx-10">
        <v-autocomplete
          v-model="adresse"
          :aria-placeholder="defaults.adresse"
          :hint="'ex. : ' + defaults.adresse"
          item-text="label"
          :items="adresses"
          label="Adresse"
          :loading="isFetchingMatchingAdresses"
          no-filter
          :placeholder="placeholders.adresse"
          prepend-icon="location_city"
          required
          return-object
          :rules="generalRules"
          :search-input.sync="searchAdresses"
          @focus="setPlaceholder('adresse')"
          @blur="removePlaceholder('adresse')"
        />
      </v-row>
      <v-row class="mx-10">
        <v-text-field
          v-model="lon"
          prepend-icon="border_vertical"
          :aria-placeholder="defaults.lon"
          :hint="'ex. : ' + defaults.lon"
          label="Longitude"
          :placeholder="placeholders.lon"
          required
          :rules="[...generalRules, ...numberRules]"
          @focus="setPlaceholder('lon')"
          @blur="removePlaceholder('lon')"
        />

        <v-text-field
          v-model="lat"
          prepend-icon="border_horizontal"
          :aria-placeholder="defaults.lat"
          :hint="'ex. : ' + defaults.lat"
          label="Latitude"
          :placeholder="placeholders.lat"
          required
          :rules="[...generalRules, ...numberRules]"
          @focus="setPlaceholder('lat')"
          @blur="removePlaceholder('lat')"
        />

        <v-select
          v-model="departement"
          :items="availableDepartements"
          label="Département"
          prepend-icon="my_location"
          aria-placeholder="93"
          hint="ex. : 93"
          :rules="departementRules"
          required
        />
      </v-row>
      <v-row class="mx-10">
        <v-btn
          type="submit"
          :disabled="!valid || isCreating"
          :aria-disabled="!valid || isCreating"
          raised
          color="success"
        >
          Ajouter
          <v-icon>
            add_circle
          </v-icon>
        </v-btn>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import pDebounce from 'p-debounce'

import { mapState } from 'vuex'

import {
  CREATE_CENTER_REQUEST,
} from '@/store'
import api from '@/api'

const getAdresses = pDebounce((query) => {
  return api.util.searchAdresses(query)
}, 300)

export default {
  data () {
    return {
      nom: '',
      label: '',
      adresse: '',
      lon: '',
      lat: '',
      departement: '',
      departementRules: [
        dpt => !!dpt ||
          'Veuillez renseigner un département',
      ],
      valid: false,
      generalRules: [
        text => text !== '' || 'Veuillez renseigner ce champ',
      ],
      numberRules: [
        numberStr => !isNaN(Number(numberStr)) || 'Veuillez entrer un nombre',
      ],
      placeholders: {
        nom: '',
        label: '',
        adresse: '',
        lon: '',
        lat: '',
      },
      defaults: {
        nom: 'Rosny sous Bois',
        label: "Centre d'examen du permis de conduire de Rosny sous Bois",
        adresse: '320 avenue Paul Vaillant Couturier 93000 Bobigny',
        lon: '2.458441',
        lat: '48.905818',
      },
      adresses: [],
      searchAdresses: null,
      isFetchingMatchingAdresses: false,
    }
  },

  computed: {
    ...mapState({
      availableDepartements: state => state.admin.departements.list,
    }),
    isCreating () {
      return this.$store.state.admin.centres.isCreating || false
    },
  },

  watch: {
    searchAdresses (val) {
      val && val !== this.select && this.fetchMatchingAdresses(val)
    },
  },

  methods: {
    setPlaceholder (type) {
      this.placeholders[type] = this.defaults[type]
    },

    removePlaceholder (type) {
      this.placeholders[type] = ''
    },

    async createCentre () {
      const {
        nom,
        label,
        adresse,
        lon,
        lat,
        departement,
      } = this

      await this.$store.dispatch(CREATE_CENTER_REQUEST, {
        nom,
        label,
        adresse: adresse.label,
        lon: Number(lon),
        lat: Number(lat),
        departement,
      })
      this.$refs.createCenterForm.reset()
    },

    async fetchMatchingAdresses (val) {
      this.isFetchingMatchingAdresses = true
      this.adresses[Math.min(this.adresses.length - 1, 0)] = val
      try {
        const adresses = await getAdresses(val)
        this.adresses = (adresses.features && adresses.features.length)
          ? adresses.features
            .filter(adr => adr.properties.type.includes('housenumber'))
            .map(feature => ({
              label: feature.properties.label,
              context: feature.properties.context,
            }))
            .concat([{ label: val }])
          : this.adresses
      } catch (error) {
      }
      this.isFetchingMatchingAdresses = false
    },
  },
}
</script>
