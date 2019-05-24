<template>
  <div>
    <page-title :title="'Validation Aurige'"/>
    <v-card style="background-color: unset;">
      <ag-grid-vue style="max-width: 100%; height: 350px;" class="ag-theme-material"
        :gridOptions="gridOptions"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :sideBar="sideBar"
        :pagination="true"
        :paginationPageSize="5"
        :defaultColDef="{
          sortable: true,
          resizable: true,
          filter: true
        }"
        :localeText="localeText"
        :frameworkComponents="frameworkComponents"
        @grid-ready="onReady"
      >
      </ag-grid-vue>
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
    const StatusRenderer = (param) => {
      const StatusIcon = {
        'success': 'done',
        'error': 'clear',
      }
      return '<i class="material-icons">' + StatusIcon[param.value] + '</i>'
    }
    this.frameworkComponents = { agGridAurigeStatusFilter: AgGridAurigeStatusFilter }

    this.columnDefs = [
      {
        headerName: 'Etat',
        field: 'status',
        cellRenderer: StatusRenderer,
        filter: 'agGridAurigeStatusFilter',
      },
      { headerName: 'NEPH', field: 'neph' },
      { headerName: 'Nom', field: 'nom' },
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
  filter: invert(100%);
}

.ag-theme-material >>> .ag-header {
  background-color: unset;
}

.ag-theme-material >>> .ag-menu {
  min-width: 100px !important;
}
</style>
