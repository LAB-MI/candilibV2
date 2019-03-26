<template>
  <div>
    <page-title :Title="'Liste des candidats'"/>
    <v-card>
      <ag-grid-vue style="width: 100%; height: 500px;" class="ag-theme-material"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :sideBar="sideBar"
        :pagination="true"
        :paginationPageSize="8"
        :defaultColDef="{
          sortable: true,
          resizable: true,
          filter: true
        }"

        :groupHeaders="true"
        :localeText="localeText"

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
import { AgGridLocaleText, valueDateFormatter, filterDateParams } from './ag-grid-utils'
import PageTitle from './PageTitle'

export default {
  name: 'candidat-list',
  components: {
    AgGridVue,
    PageTitle,
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
      localeText: null,
    }
  },

  computed: {
    rowData () {
      return this.$store.state.candidats.list || []
    },
  },

  beforeMount () {
    this.localeText = AgGridLocaleText
    this.columnDefs = [
      { headerName: 'Centre',
        field: 'place.centre',
        filter: 'agTextColumnFilter' },
      { headerName: 'Inspecteur', field: 'place.inspecteur' },
      { headerName: 'Date',
        field: 'place.date',
        valueFormatter: valueDateFormatter,
        filter: 'agDateColumnFilter',
        filterParams: filterDateParams,
      },
      { headerName: 'NEPH', field: 'codeNeph' },
      { headerName: 'Nom', field: 'nomNaissance' },
      { headerName: 'Prénom', field: 'prenom' },
      { headerName: 'Courriel', field: 'email' },
    ]
  },

  methods: {
    onReady ({ type, api, columnApi }) {
      this.api = api
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
