<template>
  <div class="zkp-print">
    <div v-for="item in data" :key="item.desc">
      <p v-if="!['success', 'error'].includes(item.tag)">
        <span :class="item.tag">[{{ item.tag }}]</span>
        <span v-html='item.desc'></span>
      </p>
      <p :class="item.tag" v-else v-html="item.desc" @click="handleClick" />
    </div>
  </div>
</template>

<script lang='ts'>
import {
  Vue, Component, Prop,
} from 'vue-property-decorator';

import { PrintItem } from '@/interface/index.d';

@Component
export default class Print extends Vue {
  @Prop({ type: Array, default: () => ([]) }) private data!: PrintItem[];

  private handleClick(event: MouseEvent) {
    if (event.target && (event.target as HTMLElement).nodeName === 'STRONG') {
      this.$emit('handleClick');
    }
  }
}
</script>

<style lang='scss' scoped>
.zkp-print {
  background-color: #1b340e;
  padding: 26px 30px 48px;
  font-family: Courier;
  user-select: none;
  min-height: 135px;
  box-sizing: border-box;

  p {
    font-size: 14px;
    line-height: 16px;
    margin: 0;
    font-weight: 700;
    color: #ffffff;
    white-space: pre-line;
    word-break: break-word;
    /deep/ strong {
      text-decoration: underline;
      color: #FFFE00;
      cursor: pointer;
    }
  }

  span {
    margin-right: 0.5em;
    text-transform: capitalize;
  }

  .website {
    color: #32c5ff;
  }

  .contract,
  .success {
    color: #6dd400;
  }

  .error {
    color: #e02020;
  }

  .browser {
    color: #0091ff;
  }
}
</style>
