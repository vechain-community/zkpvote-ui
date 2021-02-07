<template>
  <Layout>
    <transition name='fade' v-if="isRouterAlive">
      <router-view />
    </transition>
  </Layout>
</template>

<script lang='ts'>
import { Vue, Component, Provide } from 'vue-property-decorator';
import { Layout } from '@/components';

@Component({
  components: {
    Layout,
  },
})
export default class App extends Vue {
  private isRouterAlive = true;

  @Provide('reload')
  private reload() {
    this.isRouterAlive = false;
    this.$nextTick(() => {
      this.isRouterAlive = true;
    });
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .15s ease-in-out;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
