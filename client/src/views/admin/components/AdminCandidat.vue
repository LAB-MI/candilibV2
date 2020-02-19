<template>
  <div>
    <last-aurige-date-time />
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

export default {
  components: {
    SearchCandidat,
    LastAurigeDateTime,
  },
}
</script>
