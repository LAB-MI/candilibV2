<template>
  <div class="u-flex  u-flex--center">
    <div class="transitional">
        <signup-form class="c-form-wrapper" />
    </div>
  </div>
</template>

<script>
import SignupForm from './SignupForm'

export default {
  components: {
    SignupForm,
  },
}
</script>

<style lang="postcss" scoped>
.transitional {
  position: relative;
  min-height: 100vh;
  width: 100vw;
  background-image: url(../../../assets/bg-presignup.jpg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  @media (max-width: 599px) {
    background: linear-gradient(to bottom, #7579ff, #b224ef);
  }

  &-signup {
    height: 55em;
  }
}

.c-form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2em;
}

.c-signup-form {
  max-width: 40em;

  @media (max-width: 1170px) {
    width: 20em;
  }
}
</style>
