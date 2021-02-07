<template>
  <main class='zkp-main' :class="className">
    <slot />
  </main>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Main extends Vue {
  @Prop({ type: String, default: '' }) private className?: string;

  private get width() {
    return window.innerWidth;
  }
}
</script>

<style lang='scss' scoped>
  .zkp-main {
    flex: 1;
    width: 100%;
    max-width: 960px;
    margin: 0 auto;
  }
</style>
