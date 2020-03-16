<template>
  <div>
    <h2 class="text--center">
      Validation d'import
    </h2>

    <v-card style="background-color: unset;">
      <ag-grid-vue
        style="max-width: 100%; height: 350px;"
        class="ag-theme-material t-ag-grid-import-places-validation"
        :grid-options="gridOptions"
        :column-defs="columnDefs"
        :row-data="rowData"
        :side-bar="sideBar"
        :pagination="true"
        :pagination-page-size="5"
        :default-col-def="{
          sortable: true,
          resizable: true,
          filter: true
        }"
        :locale-text="localeText"
        :framework-components="frameworkComponents"
        @grid-ready="onReady"
      />
    </v-card>
  </div>
</template>

<script>
import { AgGridVue } from 'ag-grid-vue'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-material.css'

import { AgGridLocaleText, StatusRenderer, valueDateFormatter, filterDateParams } from './ag-grid-utils'
import AgGridAurigeStatusFilter from './AgGridAurigeStatusFilter'

export default {
  components: {
    AgGridVue,
  },
  data () {
    return {
      columnDefs: null,
      showGrid: false,
      sideBar: false,
      rowCount: null,
      gridOptions: null,
      localeText: null,
      frameworkComponents: null,
    }
  },

  computed: {
    rowData () {
      return this.$store.state.importPlaces.places || []
    },
  },

  beforeMount () {
    this.localeText = AgGridLocaleText

    this.frameworkComponents = { agGridAurigeStatusFilter: AgGridAurigeStatusFilter }

    this.columnDefs = [
      {
        headerName: 'Etat',
        field: 'status',
        cellRenderer: StatusRenderer,
        filter: 'agGridAurigeStatusFilter',
        width: 90,
        headerClass: 't-import-places-validation-header-status',
      },
      {
        headerName: 'Centre',
        field: 'centre',
      },
      {
        headerName: 'Date et heures',
        field: 'date',
        valueFormatter: valueDateFormatter,
        filter: 'agDateColumnFilter',
        filterParams: filterDateParams,
      },
      {
        headerName: 'Message',
        field: 'message',
        cellStyle: { 'white-space': 'normal', 'line-height': 'normal' },
        autoHeight: true,
        width: 500,
      },
    ]
    this.gridOptions = {
    }
  },

  methods: {
    onReady ({ type, api, columnApi }) {
      api.sizeColumnsToFit()
    },
  },
}

</script>
<style scoped>
.ag-theme-material {
  background-color: unset;
}

.ag-theme-material >>> .ag-header {
  background-color: unset;
}

.ag-theme-material >>> .ag-menu {
  min-width: 100px !important;
}
</style>
