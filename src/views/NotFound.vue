<template>
  <Main class='root'>
    <NotFound />
  </Main>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import { Main, NotFound } from '@/components';

@Component({
  components: {
    Main,
    NotFound,
  },
})
export default class extends Vue {

}
</script>

<style lang='scss' scoped>
.root {
  display: flex;
  align-items: center;
}
</style>
