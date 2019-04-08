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
    idFormatMessage: String,
    dateCurrentResa: String,
    nbOfDaysBeforeDate: String,
    canBookFrom: String,
    penaltyNb: String,
  },
}
</script>
