<template>
  <div>
    <last-aurige-date-time />
    <borne-status />
    <page-title>
      {{ $formatMessage({ id: 'Rechercher un candidat'}) }}
    </page-title>
    <div class="u-flex  u-flex--center  u-flex--v-start">
      <search-candidat class="search-input" />
    </div>
  </div>
</template>

<script>
import SearchCandidat from './SearchCandidat'
import LastAurigeDateTime from './LastAurigeDateTime'
import BorneStatus from './BorneStatus'

export default {
  components: {
    SearchCandidat,
    LastAurigeDateTime,
    BorneStatus,
  },
}
</script>
