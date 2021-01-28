<template>
  <div class="zkp-layout">
    <a class="github-corner" href='https://github.com/vechain-community/zkpvote-ui' />
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
  .github-corner {
    position: absolute;
    right: 0;
    top: 0;
    width: 130px;
    height: 130px;
    z-index: 999;
    background: url('../../assets/images/github-corner.png');
    background-size: 130px;
  }
  .zkp-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
