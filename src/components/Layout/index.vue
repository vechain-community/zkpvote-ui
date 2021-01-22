<template>
  <div class="zkp-layout">
    <Header />
    <slot />
    <Footer />
  </div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import Header from '../Header/index.vue';
import Footer from '../Footer/index.vue';

@Component({
  components: {
    Header,
    Footer,
  },
})
export default class Layout extends Vue {}
</script>

<style lang='scss' scoped>
  .zkp-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
