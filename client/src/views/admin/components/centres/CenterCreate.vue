<template>
  <v-form
    v-model="valid"
    @submit.prevent="createCentre"
  >
    <v-container>
      <v-row class="mx-10">
        <v-text-field
          v-model="nom"
          prepend-icon="edit"
          aria-placeholder="Rosny sous Bois"
          hint="ex. : Rosny sous Bois"
          label="Nom"
          :placeholder="emailPlaceholder"
          required
          :rules="generalRules"
          @focus="setEmailPlaceholder"
          @blur="removeEmailPlaceholder"
        />
        <v-text-field
          v-model="label"
          prepend-icon="comment"
          aria-placeholder="Centre d'examen du permis de conduire"
          hint="ex. : Centre d'examen du permis de conduire de Bobigny"
          label="Label"
          :placeholder="emailPlaceholder"
          required
          :rules="generalRules"
          @focus="setEmailPlaceholder"
          @blur="removeEmailPlaceholder"
        />
      </v-row>
      <v-row class="mx-10">
        <v-text-field
          v-model="adresse"
          prepend-icon="room"
          aria-placeholder="3 avenue Couturier 93000 Bobigny"
          hint="ex. : 3 avenue Couturier 93000 Bobigny"
          label="Adresse"
          :placeholder="emailPlaceholder"
          required
          :rules="generalRules"
          @focus="setEmailPlaceholder"
          @blur="removeEmailPlaceholder"
        />
      </v-row>
      <v-row class="mx-10">
        <v-text-field
          v-model="
            lon"
          prepend-icon="border_vertical"
          aria-placeholder="2.458401"
          hint="ex. : 2.458401"
          label="Longitude"
          :placeholder="emailPlaceholder"
          required
          :rules="[...generalRules, ...numberRules]"
          @focus="setEmailPlaceholder"
          @blur="removeEmailPlaceholder"
        />

        <v-text-field
          v-model="lat"
          prepend-icon="border_horizontal"
          aria-placeholder="48.905842"
          hint="ex. : 48.905842"
          label="Latitude"
          :placeholder="emailPlaceholder"
          required
          :rules="[...generalRules, ...numberRules]"
          @focus="setEmailPlaceholder"
          @blur="removeEmailPlaceholder"
        />

        <v-select
          v-model="departement"
          :items="availableDepartements"
          label="Département"
          prepend-icon="my_location"
          aria-placeholder="département"
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
          tabindex="0"
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
import { mapState } from 'vuex'

import {
  ADD_NEW_CENTER_REQUEST,
} from '@/store'

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
        text => text.length > 0 || 'Veuillez renseigner ce champ',
      ],
      numberRules: [
        numberStr => !isNaN(Number(numberStr)) || 'Veuillez entrer un nombre',
      ],
      emailPlaceholder: '',
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

  methods: {
    setEmailPlaceholder () {
      this.emailPlaceholder = 'jean@dupont.fr'
    },

    removeEmailPlaceholder () {
      this.emailPlaceholder = ''
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

      try {
        await this.$store.dispatch(ADD_NEW_CENTER_REQUEST, {
          nom,
          label,
          adresse,
          lon: Number(lon),
          lat: Number(lat),
          departement,
        })
        this.nom = ''
        this.label = ''
        this.adresse = ''
        this.lon = ''
        this.lat = ''
        this.departement = ''
      } catch (error) {
      }
    },
  },
}
</script>
