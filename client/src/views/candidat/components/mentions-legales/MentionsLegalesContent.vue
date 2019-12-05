<template>
  <div class="detail-style">
    <h2 class="icon-title-style">
      <i class="material-icons">{{ icon }}</i>
      {{ mainTitle }}
    </h2>
    <div
      v-for="(el, index) in textContent"
      :key="index"
    >
      <h5
        v-if="el.subTitle"
        class="sub-title-style"
        v-html="el.subTitle"
      />
      <p
        v-if="el.subTextContent"
        class="sub-text-content"
        v-html="el.subTextContent"
      />
      <ul v-if="el.listInfo && el.listInfo.length">
        <li
          v-for="(text, idx) in el.listInfo"
          :key="idx"
          class="li-style"
          v-html="text"
        >
          <i class="material-icons icon-style">arrow_right</i>
        </li>
      </ul>
    </div>
    <hr class="separate-bar">
  </div>
</template>

<script>
export default {
  name: 'MentionsLegalesContent',
  props: {
    icon: {
      type: String,
      default: '',
    },
    mainTitle: {
      type: String,
      default: '',
    },
    textContent: {
      type: Array,
      default () {},
    },
    listInfo: {
      type: Array,
      default () {},
    },
  },
}
</script>

<style scoped>
.detail-style {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

.icon-title-style {
  color: #112363;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
}

.text-content {
  color: #112363;
  font-size: 15px;
  margin-bottom: 10px;
}

.separate-bar {
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

ul {
  color: #112363;
}

.li-style {
  padding: 0 0 0 50px;
  line-height: 2em;
  list-style: none;
  box-sizing: border-box;
}

.icon-style {
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  color: #112363;
  font-size: 15px;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  font-weight: 900;
}

.sub-title-style {
  font-family: "Raleway", sans-serif;
  font-weight: 400;
  margin: 20px 0 20px 0;
  padding: 0;
  color: #0e1b4d;
  font-size: 1.25rem;
  line-height: 1.2;
}

.sub-text-content {
  text-align: left;
  font-weight: 400;
  line-height: 1.5;
  box-sizing: border-box;
  color: #112363;
  font-size: 15px;
  padding: 0;
  margin: 0 0 30px 0;
  font-family: "Poppins", sans-serif;
}
</style>
