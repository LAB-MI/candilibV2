<template>
  <header class="candidat-section-header">
    <h2 class="candidat-section-header__title">
      {{title}}
    </h2>
  </header>
</template>

<script>
export default {
  props: {
    title: String,
  },
}
</script>
