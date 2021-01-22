<template>
  <div class='zkp-authority'>
    <h2 class='zkp-authority__title'>
      DO NOT CLOSE THIS PAGE
    </h2>
    <p  class='zkp-authority__tips'>
      Save the authority key above.
      You need tally the vote result after the vote is end with the key.
      Each new vote will generate an authority key.
    </p>
    <div class="zkp-authority__flex">
      <div class="zkp-authority__key">
        <span class="label">Authority Key</span>
        <span class="text">{{ authorityKey }}</span>
      </div>
      <button
        type="button"
        class="zkp-authority__download"
        @click="downloadAuthorityKey"
      >
        Download
      </button>
    </div>
    <div class="zkp-authority__radio">
      <Radio v-model="agree" :label="true">I have downloaded the key</Radio>
    </div>
    <Button
      width="230px"
      class="zkp-authority__button"
      :disabled="!agree"
      @click="open"
    >
      Active the vote
    </Button>
  </div>
</template>

<script lang='ts'>
import {
  Vue, Component, Emit, Prop,
} from 'vue-property-decorator';
import { Avatar, Button } from '@/baseComponents';
import { Main } from '@/components';
import { Radio } from 'element-ui';
import FileSaver from 'file-saver';
import { State } from 'vuex-class';

@Component({
  components: {
    Main,
    Button,
    Avatar,
    Radio,
  },
})
export default class Vote extends Vue {
  @State('signer') private signer!: string;

  @Prop({ default: '', type: String }) private authorityKey!: string

  @Prop({ default: '', type: String }) private name!: string

  private agree = false;

  @Emit()
  private open() {
    return true;
  }

  private downloadAuthorityKey() {
    const blob = new Blob([this.authorityKey], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `AuthorityKey_${this.name.substring(0, 25).replace(/\s+/g, '_')}_proposed_by_${this.signer.substring(0, 8)}.txt`);
  }
}
</script>

<style lang='scss' scoped>
.zkp-authority {
  width: 800px;
  margin: 0 auto 20px;
  background-color: rgba(255, 255, 255, .15);
  padding: 24px 40px 46px;
  box-sizing: border-box;
  border: 3px solid #FFFE00;

  #{&}__title {
    font-size: 24px;
    color: #FFFE00;
    margin-top: 0;
    text-align: center;
  }

  #{&}__tips {
    width: 58%;
    margin: 0 auto;
    text-align: center;
    font-size: 12px;
    line-height: 18px;
    color: #ffffff;
  }

  #{&}__flex {
    display: flex;
    margin: 24px  0 42px;
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
    .label {
      font-size: 16px;
      line-height: 19px;
      font-family: Courier-Bold, Courier;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .text {
      font-size: 14px;
      line-height: 17px;
      font-family: Courier;
    }
  }

  #{&}__download {
    width: 136px;
    height: 76px;
    line-height: 76px;
    background-color: #a245dc;
    padding: 0;
    border: 0;
    outline: none;
    box-shadow: unset;
    -webkit-appearance: none;
    flex-shrink: 0;
    font-size: 16px;
    color: #ffffff;
  }

  #{&}__radio {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    color: #ffffff;
  }

  #{&}__button {
    padding-left: 0;
    padding-right: 0;
    margin: 16px auto 24px;
  }

  #{&}__end {
    font-size: 12px;
    color: #a2a2a2;
    line-height: 18px;
    text-align: center;
    margin: 0;
  }
}
</style>
