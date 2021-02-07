<template>
  <span
    class="zkp-tag"
    :class="[`zkp-tag__${type}`]"
  >
    <slot />
  </span>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';

type TType = 'default' | 'warning' | 'error' | 'ended';

@Component
export default class Tag extends Vue {
  @Prop({ type: String, default: 'default' }) private type!: TType;
}
</script>

<style lang='scss' scoped>
.zkp-tag {
  display: inline-block;
  height: 20px;
  line-height: 20px;
  font-size: 12px;
  border-radius: 4px;
  color: #ffffff;
  padding: 0 6px;

  &#{&}__default {
    background-color: #4a90e2;
  }

  &#{&}__warning {
    background-color: #fffe00;
    color: #000000;
  }

  &#{&}__error {
    background-color: #d0021b;
  }

  &#{&}__ended {
    background-color: #d5d5d5;
    color: #969696;
  }
}
</style>
