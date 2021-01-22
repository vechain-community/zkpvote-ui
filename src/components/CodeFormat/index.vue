<template>
  <div class='zkp-format' :class="[`zkp-format__${type}`]">
    <code>
      {{ data }}
    </code>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class CodeFormat extends Vue {
  @Prop({ type: String, default: '' }) private data!: string;

  @Prop({ type: String, default: 'light' }) private type!: string;
}
</script>

<style lang='scss' scoped>
.zkp-format {
  width: 100%;
  padding: 15px;
  font-size: 12px;
  line-height: 18px;
  box-sizing: border-box;
  display: flex;
  white-space: pre-wrap;

  &#{&}__light {
    background-color: rgba(255, 255, 255, .15);
    color: #ffffff;
  }

  &#{&}__dark {
    background-color: #eeeeee;
    color: #5d5d5d;
  }
}
</style>
