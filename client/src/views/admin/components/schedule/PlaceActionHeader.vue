<template>
  <div>
    <h4>
      <strong>
        {{ candidat.prenom }}
        {{ candidat.nomNaissance }}
        {{ candidat.codeNeph }}
      </strong>
    </h4>

    <div>
      <div>
        <strong class="label">{{ $formatMessage({ id: 'nom'}) }}:</strong>
        <span>{{ candidat.nomNaissance }}</span>
      </div>
      <div>
        <strong class="label">
          {{ $formatMessage({ id: 'neph'}) }}:
        </strong>
        <span>
          {{ candidat.codeNeph }}
        </span>
      </div>
      <div>
        <strong class="label">
          {{ $formatMessage({ id: 'adresse_courriel'}) }}:
        </strong>
        <span>
          {{ candidat.email }}
        </span>
      </div>
      <div>
        <strong class="label">
          {{ $formatMessage({ id: 'mobile'}) }}:
        </strong>
        <span>
          {{ candidat.portable }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    candidat: {
      type: Object,
      default () { return {} },
    },
  },
}
</script>

<style lang="stylus" scoped>
h4 {
  text-align: center;
}
</style>
