<template>
  <div>
    <h2>
      Liste des candidats
    </h2>
    <v-card>
      <ag-grid-vue style="width: 100%; height: 500px;" class="ag-theme-material"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :sideBar="sideBar"

        :defaultColDef="{
          sortable: true,
          resizable: true,
          filter: true
        }"

        :groupHeaders="true"

        @grid-ready="onReady"
      >
      </ag-grid-vue>
    </v-card>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue'
import { DateTime } from 'luxon'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'

import { FETCH_CANDIDATS_REQUEST } from '@/store'

export default {
  components: {
    AgGridVue,
  },

  mounted () {
    const now = DateTime.local()
    this.$store.dispatch(FETCH_CANDIDATS_REQUEST, { since: now, until: now.set({ day: now.daysInMonth }) })
  },

  data () {
    return {
      columnDefs: null,
      showGrid: false,
      sideBar: false,
      rowCount: null,
    }
  },

  computed: {
    rowData () {
      return this.$store.state.candidats.list || []
    },
  },

  beforeMount () {
    this.columnDefs = [
      { headerName: 'NEPH', field: 'codeNeph' },
      { headerName: 'Nom', field: 'nomNaissance' },
      { headerName: 'Prénom', field: 'prenom' },
      { headerName: 'Courriel', field: 'email' },
    ]
  },

  methods: {
    onReady ({ type, api, columnApi }) {
      this.api = api
      // this.columnApi = columnApi

      this.api.sizeColumnsToFit()
    },
  },
}

</script>

<style lang="postcss">
.ag-theme-material .ag-menu {
  box-shadow: 0 2px 2px 1px rgba(50, 50, 50, 0.2);
}
</style>
