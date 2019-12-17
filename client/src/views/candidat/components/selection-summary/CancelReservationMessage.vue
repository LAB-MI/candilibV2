<template>
  <p
    v-html="$formatMessage(
      {
        id: idFormatMessage,
      },
      {
        dateCurrentResa,
        nbOfDaysBeforeDate,
        penaltyNb,
        canBookFrom,
      },
    )"
  />
</template>

<script>
export default {
  props: {
    idFormatMessage: {
      type: String,
      default: '',
    },
    dateCurrentResa: {
      type: String,
      default: '',
    },
    nbOfDaysBeforeDate: {
      type: String,
      default: '',
    },
    canBookFrom: {
      type: String,
      default: '',
    },
    penaltyNb: {
      type: String,
      default: '',
    },
  },
}
</script>
