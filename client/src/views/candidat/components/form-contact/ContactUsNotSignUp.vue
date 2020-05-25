<template>
  <layout-landing-page class="contact-us">
    <template v-slot>
      <h3 class="contact-us-title">
        {{ $formatMessage({ id: 'contact_us_title' }) }}
      </h3>
      <form-contact
        dark
        with-had-singup
      />
    </template>
  </layout-landing-page>
</template>

<script>
import FormContact from './FormContact'
import LayoutLandingPage from '../LayoutLandingPage'

export default {
  components: {
    LayoutLandingPage,
    FormContact,
  },
}
</script>

<style>
.contact-us {
  width: 100%;
}

.contact-us-title {
  color: #fff;
  font-size: 1.4em;
  text-align: center;
}

</style>
