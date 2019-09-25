<template>
  <v-card>
    <v-card-title class="justify-center">
      <h3 class="d-block">Département: <strong>{{ `${statsValues.departement}` }}</strong></h3>&nbsp;
    </v-card-title>
    <v-divider></v-divider>
    <v-layout>
      <v-container>
        <h3>
          Resultats à l'examen
        </h3>
        <v-layout>
          <v-progress-circular
            class="d-block"
            :rotate="90"
            :size="150"
            :width="15"
            :value="((statsValues.received / (statsValues.failed + statsValues.received)) * 100) || 0"
            color="primary"
          >
            {{ `${((statsValues.received / (statsValues.failed + statsValues.received)) * 100) || 0}` }}%
          </v-progress-circular>
          <v-flex class="pt-2 ma-4">
            <span color="black" class="d-flex label-stats"><strong>de réussite</strong></span>
            <span color="black" class="d-flex label-stats">= reçus / (reçus + échecs)</span>
          </v-flex>
          <v-spacer></v-spacer>
          <v-progress-circular
            class="d-block"
            :rotate="90"
            :size="150"
            :width="15"
            :value="((statsValues.absent / (statsValues.absent + statsValues.failed + statsValues.notExamined + statsValues.received)) * 100) || 0"
            color="primary"
          >
            {{ `${((statsValues.absent / (statsValues.absent + statsValues.failed + statsValues.notExamined + statsValues.received)) * 100) || 0}` }}%
          </v-progress-circular>
          <v-flex class="pt-2 ma-4">
            <span class="d-flex  label-stats" color="black"><strong>d'absenteisme</strong></span>
            <span class="d-flex  label-stats" color="black">= absents / examens passés</span>
          </v-flex>
          <v-spacer></v-spacer>
          <v-progress-circular
            class="d-block"
            :rotate="90"
            :size="150"
            :width="15"
            :value="((statsValues.notExamined / (statsValues.absent + statsValues.failed + statsValues.notExamined + statsValues.received)) * 100) || 0"
            color="primary"
          >
            {{ `${((statsValues.notExamined / (statsValues.absent + statsValues.failed + statsValues.notExamined + statsValues.received)) * 100) || 0}` }}%
          </v-progress-circular>
          <v-flex class="pt-2 ma-4">
            <span color="black" class="d-flex label-stats"><strong>de non-examinés</strong></span>
            <span color="black" class="d-flex label-stats">= non examinés / examens passés</span>
          </v-flex>
        </v-layout>
      </v-container>
      <v-container>
        <h1 class="d-block pl-5 mb-3"><strong>{{ `${statsValues.absent + statsValues.failed + statsValues.notExamined + statsValues.received}` }}</strong></h1>
        <span class="d-block"><strong>Examens Passés</strong></span>
      </v-container>
    </v-layout>
  </v-card>
</template>

<script>
export default {
  props: {
    statsValues: {
      type: Object,
    },
  },
}
</script>
