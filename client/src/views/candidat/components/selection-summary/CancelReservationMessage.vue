<template>
    <p class="red--text">
      {{
        $formatMessage(
          {
            id: idFormatMessage,
          },
          {
            dateCurrentResa,
            nbOfDaysBeforeDate,
            penaltyNb,
          },
        )
      }}
    </p>
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
