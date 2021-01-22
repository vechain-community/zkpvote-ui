<template>
  <Dialog
    center
    :visible='visible'
    :close-on-click-modal='!loading'
    :show-close="!loading"
    width='730px'
    @close='close'
  >
    <h3 slot='title' style='margin: 0'>Encrypted vote</h3>
    <CodeFormat type='dark' :data='code' />
    <p class='txid'>
      TxID:
      <a target='_blank' :href='`https://explore-testnet.vechain.org/transactions/${txID}`'>{{txID}}</a>
    </p>
    <h3 class='title'>Verify the vote</h3>
    <template v-if='printData.length'>
      <Print :data='printData' />
    </template>
    <a
      class="github-link"
      href='https://github.com/zzGHzz/zkVoteContract/blob/master/contractV2/'
      target="_blank"
    >
      <span></span>
      See more details
    </a>
    <Button
      colorType='dark'
      width='200px'
      size='sm'
      @click='close'
      :loading='loading'
    >
      Done
    </Button>
  </Dialog>
</template>

<script lang='ts'>
import {
  Vue,
  Component,
  Prop,
  Emit,
} from 'vue-property-decorator';
import { Button } from '@/baseComponents';
import { Dialog } from 'element-ui';
import { PrintItem } from '@/interface/index.d';
import Print from '../Print/index.vue';
import CodeFormat from '../CodeFormat/index.vue';

@Component({
  components: {
    Button,
    Dialog,
    Print,
    CodeFormat,
  },
})
export default class DialogVote extends Vue {
  @Prop({ type: Boolean, default: false }) private visible!: boolean;

  @Prop({ type: Boolean, default: true }) private loading!: boolean;

  @Prop({ type: String, default: '' }) private code!: string;

  @Prop({ type: String, default: '' }) private txID!: string;

  @Prop({ type: Array, default: () => ([]) }) private printData!: PrintItem[];

  @Emit()
  private close() {
    return false;
  }
}
</script>

<style lang='scss' scoped>
.txid {
  font-size: 12px;
  line-height: 18px;
  color: #898989;
  text-align: center;
  margin: 12px 0;
  a {
    color: #898989;
  }
}

.title {
  margin: 24px 0 12px 0;
  text-align: center;
  color: #000000;
}

.github-link {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 17px;
  margin-top: 17px;
  font-size: 12px;
  text-decoration: underline;
  color: #333333;

  span {
    width: 18px;
    height: 18px;
    margin-right: 4px;
    background: url('../../assets/images/github-logo@2x.png') no-repeat;
    background-size: cover;
  }
}
</style>
