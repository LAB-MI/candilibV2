<template>
  <div>
    <last-aurige-date-time />
    <borne-status />
    <page-title>
      {{ $formatMessage({ id: 'Rechercher un candidat'}) }}
    </page-title>

    <v-tabs
      centered
    >
      <page-title>
        <v-tab>
          {{ $formatMessage({ id: 'par nom, neph,  email'}) }}
        </v-tab>
        <v-tab>
          {{ $formatMessage({ id: 'Par inspecteur et date'}) }}
        </v-tab>
      </page-title>
      <v-tab-item>
        <div class="u-flex  u-flex--center  u-flex--v-start">
          <search-candidat class="search-input" />
        </div>
      </v-tab-item>
      <v-tab-item>
        <div class="u-flex  u-flex--center  u-flex--v-start">
          <search-by-ipcsr-and-date />
        </div>
      </v-tab-item>
    </v-tabs>
  </div>
</template>

<script>
import SearchCandidat from './SearchCandidat'
import LastAurigeDateTime from './LastAurigeDateTime'
import BorneStatus from './BorneStatus'
import SearchByIpcsrAndDate from './candidats/SearchCandidatsByIpcsrAndDate'

export default {
  components: {
    SearchCandidat,
    SearchByIpcsrAndDate,

    LastAurigeDateTime,
    BorneStatus,
  },
}
</script>
