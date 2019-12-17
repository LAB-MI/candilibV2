<template>
  <div class="text-version">
    &copy; {{ new Date().getFullYear() }} — Version: {{ version }}
  </div>
</template>

<script>
import { version } from '../../package.json'

export default {
  data () {
    return {
      version: version || 'DEV',
    }
  },
}
</script>

<style lang="postcss" scoped>
.text-version {
  text-align: center;
  width: 100%;
  font-size: 10px;
}

</style>
