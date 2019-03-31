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
    penaltyNb: String,
  },
}
</script>
