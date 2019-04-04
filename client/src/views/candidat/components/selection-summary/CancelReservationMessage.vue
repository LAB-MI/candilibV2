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
          canBookSinceOf,
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
    canBookSinceOf: String,
    penaltyNb: String,
  },
}
</script>
