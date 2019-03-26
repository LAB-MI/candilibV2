<template>
  <header class="candidat-section-header">
    <h2 class="candidat-section-header__title">
      {{title}}
      <slot></slot>
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
