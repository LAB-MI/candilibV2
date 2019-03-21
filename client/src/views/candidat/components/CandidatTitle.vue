<template>
  <section class="u-max-width">
    <header class="candidat-section-header">
      <h2
        class="candidat-section-header__title"
        @click="e => $emit('click', e)"
      >
        {{title ? title : ''}}
        <slot v-if="!title"></slot>
      </h2>
    </header>
  </section>

</template>

<script>
export default {
  props: {
    title: String,
    onClick: Function,
  },
}
</script>
