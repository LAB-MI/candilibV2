<template>
  <v-list>
    <v-card>
       <v-card-title>
         <div>
           <h3>{{ center.centre.nom }}</h3><br>
           <span>{{ center.centre.adresse }}</span>
           <span>{{ center.centre.departement }} {{ center.centre.nom }}</span>
         </div>
       </v-card-title>
       <v-card-actions>
         <v-btn @click="selectCenter(center)" flat color="red">Sélectionner </v-btn>
       </v-card-actions>
    </v-card>
  </v-list>
</template>

<script>
import { SELECT_CENTER } from '@/store/centers'
export default {
  components: {
  },
  props: {
    center: Object,
  },
  methods: {
    selectCenter (center) {
      this.$store.dispatch(SELECT_CENTER, center)
    },
  },
}
</script>

<style>
</style>
