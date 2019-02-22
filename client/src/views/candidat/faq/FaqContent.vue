<template>
  <div>
    <a>
      {{ item.title }}
        <i class="material-icons">
          {{ 'add_circle' }}
        </i>
        <i class="material-icons">
          {{ 'remove_circle' }}
        </i>
    </a>
  </div>
</template>

<script>
export default {
  name: 'faq',
  props: {
    item: Object,
  },
  methods: {
    
  },
}
</script>

<style>

</style>
