<template>
  <div class="zkp-share">
    <h2 class="zkp-share__title">Share the vote</h2>
    <div class="zkp-share__flex">
      <div class="zkp-share__key">
        {{shareUrl}}
      </div>
      <button
        type="button"
        class="zkp-share__download"
        v-clipboard:copy='`
Join the vote "${topic}":
${shareUrl}
        `'
        v-clipboard:success="onCopy"
        v-clipboard:error="onError"
      >
        Copy URL and share
      </button>
    </div>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class Share extends Vue {
  @Prop({ type: String }) private topic!: string;

  private get shareUrl() {
    return window.location.href;
  }

  private onCopy() {
    this.$notify({
      title: 'Success',
      type: 'success',
      message: 'Copied to clipboard',
      duration: 1000,
    });
  }

  private onError() {
    this.$notify({
      title: 'Error',
      type: 'error',
      message: 'Failed to copy texts',
      duration: 1000,
    });
  }
}
</script>

<style lang='scss' scoped>
.zkp-share {
  width: 800px;
  margin: 0 auto 20px;
  background-color: rgba(255, 255, 255, .15);
  padding: 24px 40px 46px;
  box-sizing: border-box;

  #{&}__title {
    font-size: 24px;
    line-height: 36px;
    text-align: center;
    color: #ffffff;
    margin: 0;
  }

  #{&}__flex {
    display: flex;
    margin: 24px 0 0 0;
  }

  #{&}__key {
    flex: 1;
    padding: 16px 14px;
    box-sizing: border-box;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    background-color: rgba(0, 0, 0 ,.5);
    font-size: 14px;
    line-height: 17px;
    font-family: Courier;
    word-break: break-all;
  }

  #{&}__download {
    background-color: #a245dc;
    padding: 0  20px;
    border: 0;
    outline: none;
    box-shadow: unset;
    -webkit-appearance: none;
    flex-shrink: 0;
    font-size: 16px;
    color: #ffffff;
  }
}
</style>
