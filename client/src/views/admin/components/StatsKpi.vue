<template>
  <div>
    <page-title :title="'Export Stats Kpi'"/>
    <div class="export-button">
      <v-btn color="primary" @click="getStatsKpiAsCsv">
        Export Stats CSV
        <v-icon>
          get_app
        </v-icon>
        <v-icon>
          assessment
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import api from '@/api'
import { downloadContent } from '@/util'

export default {
  methods: {
    async getStatsKpiAsCsv () {
      const response = await api.admin.exportStatsKpiCsv()
      downloadContent(response)
    },
  },
}
</script>

<style  lang="postcss" scoped>

.export-button {
  display: flex;
  color: #fff;
  justify-content: center;
  align-items: center;
  padding: 1em 0;
  margin: 0 auto;
  max-width: 1160px;

  @media (max-width: 1169px) {
    flex-direction: column;
  }

  &-action {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 1em;
    margin: 1em;
    flex-grow: 1;

    &--export {
      @media (max-width: 1169px) {
        border-top: 1px solid rgba(200, 200, 200, 0.3);
      }

      @media (min-width: 1170px) {
        border-left: 1px solid rgba(200, 200, 200, 0.3);
      }
    }
  }
}
</style>
