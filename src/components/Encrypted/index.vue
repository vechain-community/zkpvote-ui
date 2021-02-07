<template>
  <div class='zkp-encrypted' v-if='status !== 0'>
    <h2 class='zkp-encrypted__title'>My Encrypted Vote</h2>
    <p class='zkp-encrypted__tips'>
      No one knows what you voted except yourself.
      <span @click='handleOpen'>Decrypt my vote</span>
    </p>
    <CodeFormat :data='code' />
    <p class='zkp-encrypted__txid'>
      TxID:
      <a target='_blank' :href='`https://explore-testnet.vechain.org/transactions/${txID}`'>{{ txID }}</a>
    </p>
    <DialogDecrypt
      :code='code'
      :visible='visible'
      :txID="txID"
      :authPubKey='authPubKey'
      :choices='choices'
      @close='handleClose'
    />
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import CodeFormat from '../CodeFormat/index.vue';
import DialogDecrypt from '../Dialog/Decrypt.vue';

@Component({
  components: {
    CodeFormat,
    DialogDecrypt,
  },
})
export default class Encrypted extends Vue {
  @Prop({ type: Number, default: 0 }) private status!: number;

  @Prop({ type: Object, default: () => ({}) }) private voteResult!: Connex.Thor.VMOutput;

  @Prop({ type: String, default: '' }) private txID!: string;

  @Prop({ type: String, default: '' }) private authPubKey!: string;

  @Prop({ type: Array, default: () => ([]) }) private choices!: string[];

  private visible = false;

  private code = '';

  private created() {
    this.code = JSON.stringify(this.getCompressedBallot(this.voteResult.decoded), null, 2);
  }

  private getCompressedBallot(decoded?: Connex.Thor.Decoded) {
    if (!decoded) {
      return {};
    }
    return {
      h: `0x${decoded[0]}`,
      y: `0x${decoded[1]}`,
      zkp: [
        `0x${decoded[2][0]}`,
        `0x${decoded[2][1]}`,
        `0x${decoded[2][2]}`,
        `0x${decoded[2][3]}`,
        `0x${decoded[2][4]}`,
        `0x${decoded[2][5]}`,
        `0x${decoded[2][6]}`,
        `0x${decoded[2][7]}`,
      ],
      prefix: `0x${decoded[3]}`,
    };
  }

  private handleOpen() {
    this.visible = true;
  }

  private handleClose() {
    this.visible = false;
  }
}
</script>

<style lang='scss' scoped>
.zkp-encrypted {
  width: 800px;
  margin: 0 auto 20px;
  background-color: rgba(255, 255, 255, .15);
  padding: 24px 40px 46px;
  box-sizing: border-box;

  #{&}__title {
    font-size: 20px;
    line-height: 31px;
    text-align: center;
    color: #ffffff;
    margin: 0;
  }

  #{&}__tips {
    margin: 6px 0 16px 0;
    text-align: center;
    font-size: 14px;
    line-height: 22px;
    color: #ffffff;
    span {
      text-decoration: underline;
      color: #f7f200;
      cursor: pointer;
    }
  }

  #{&}__txid {
    font-size: 12px;
    line-height: 18px;
    color: #ffffff;
    text-align: center;
    margin: 14px 0 0 0;
    a {
      color: #ffffff;
    }
  }
}
</style>
