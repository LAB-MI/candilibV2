<template>
  <div>
    <page-title :title="'Validation Aurige'" />
    <v-card style="background-color: unset;">
      <ag-grid-vue
        style="max-width: 100%; height: 450px;"
        class="ag-theme-material"
        :grid-options="gridOptions"
        :column-defs="columnDefs"
        :row-data="rowData"
        :side-bar="sideBar"
        :pagination="true"
        :pagination-page-size="7"
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

import { AgGridLocaleText } from './ag-grid-utils'
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
      return this.$store.state.aurige.candidats || []
    },
  },

  beforeMount () {
    this.localeText = AgGridLocaleText
    const statusCellRenderer = (param) => {
      const statusIcon = {
        success: 'done',
        error: 'clear',
        warning: 'warning',
      }
      return '<i class="material-icons">' + statusIcon[param.value] + '</i>'
    }
    this.frameworkComponents = { agGridAurigeStatusFilter: AgGridAurigeStatusFilter }

    this.columnDefs = [
      {
        headerName: 'Etat',
        field: 'status',
        cellRenderer: statusCellRenderer,
        filter: 'agGridAurigeStatusFilter',
        width: 40,
      },
      { headerName: 'NEPH', field: 'neph', width: 100 },
      { headerName: 'Nom', field: 'nom', width: 120 },
      { headerName: 'Description', field: 'message' },
    ]
    this.gridOptions = {}
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
  filter: invert(100%);
}

.ag-theme-material >>> .ag-header {
  background-color: unset;
}

.ag-theme-material >>> .ag-menu {
  min-width: 100px !important;
}
</style>
