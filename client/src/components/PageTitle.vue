<template>
  <header class="app-header">
    <h2 class="app-title">
      {{ title }}
      <slot />
    </h2>
  </header>
</template>

<script>
export default {
  name: 'PageTitle',
  props: {
    title: {
      type: String,
      default: '',
    },
  },
}
</script>

<style lang="stylus" scoped>
.app-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: 'Poppins-Regular', Arial, Helvetica, sans-serif;
  background-color: #fff;

  &::after {
    content: '';
    width: 60px;
    height: 5px;
    background: #f82249;
    bottom: 0;
    margin-bottom: 1em;
  }
}

.app-title {
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
