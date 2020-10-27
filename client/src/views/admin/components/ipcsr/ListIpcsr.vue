<template>
  <div class="ipcsr-list">
    <v-data-table
      :headers="headers"
      :items="ipcsr"
      :items-per-page="5"
      class="elevation-1 t-list-ipcsr"
    >
      <template v-slot:[`item.action`]="{ item }">
        <update-ipcsr
          :key="item._id"
          :default-email="item.email"
          :default-matricule="item.matricule"
          :default-nom="item.nom"
          :default-prenom="item.prenom"
          :default-departement="item.departement"
          :ipcsr-id="item._id"
        />
        <!--delete-ipcsr
          :key="item._id"
          :ipcsr-id="item._id"
          :matricule="item.matricule"
          :nom="item.nom"
          :prenom="item.prenom"
        /-->
      </template>
    </v-data-table>
  </div>
</template>

<script>
// import DeleteIpcsr from './DeleteIpcsr'
import UpdateIpcsr from './UpdateIpcsr'

export default {
  components: {
    // DeleteIpcsr,
    UpdateIpcsr,
  },

  data () {
    return {
      headers: [
        { text: 'Adresse courriel', value: 'email', class: 'text-uppercase' },
        { text: 'Prénom', value: 'prenom', class: 'text-uppercase' },
        { text: 'Nom', value: 'nom', class: 'text-uppercase' },
        { text: 'Matricule', value: 'matricule', class: 'text-uppercase', align: 'right' },
        { text: 'Dépt', value: 'departement', width: '8em', class: 'text-uppercase', align: 'right' },
        { text: 'Actions', value: 'action', align: 'center', sortable: false, filterable: false, width: '15em', class: 'text-uppercase' },
      ],
      editedIpcsr: {},
    }
  },

  computed: {
    ipcsr () {
      return this.$store.state.admin.inspecteurs.list || []
    },
  },
}
</script>

<style lang="stylus" scoped>
.ipcsr-list {
  margin-top: 2em;
  margin-bottom: 2em;
}

.u-lowercase {
  text-transform: lowercase;
}
</style>
