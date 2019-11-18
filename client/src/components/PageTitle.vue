<template>
  <header class="candidat-header">
    <h2 class="candidat-title">
      {{title}}
      <slot></slot>
    </h2>
  </header>
</template>

<script>
export default {
  name: 'page-title',
  props: {
    title: String,
  },
}
</script>

<style lang="stylus" scoped>
.candidat-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Poppins-Regular', Arial, Helvetica, sans-serif;

  &::after {
    content: '';
    width: 60px;
    height: 5px;
    background: #f82249;
    bottom: 0;
    margin-bottom: 1em;
  }
}

.candidat-title {
  display: flex;
  align-items: center;
  max-width: 100%;
  margin-bottom: 10px;
  padding: 0 0.2em;
  font-size: 2rem;
  text-transform: uppercase;
  text-align: center;
  font-weight: 700;
}
</style>
