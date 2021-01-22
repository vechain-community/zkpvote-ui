<template>
  <Dialog
    center
    title="Encrypte your vote and upload"
    :visible="visible"
    :close-on-click-modal="!loading"
    width="600px"
    :show-close='!loading'
    @close="close"
  >
    <template v-if="printData.length">
      <Print :data="printData" @handleClick='handleDownload' />
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
      width="200px"
      size='sm'
      :loading="loading"
      @click="close"
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
import FileSaver from 'file-saver';
import { State } from 'vuex-class';
import Print from '../Print/index.vue';

@Component({
  components: {
    Button,
    Dialog,
    Print,
  },
})
export default class DialogVote extends Vue {
  @State('signer') private signer!: string;

  @Prop({ type: Boolean, default: false }) private visible!: boolean;

  @Prop({ type: Boolean, default: true }) private loading!: boolean;

  @Prop({ type: String, default: true }) private authorityKey!: string;

  @Prop({ type: String, default: true }) private name!: string;

  @Prop({ type: Array, default: () => ([]) }) private printData!: PrintItem[];

  @Emit()
  private close() {
    return false;
  }

  private handleDownload() {
    const blob = new Blob([this.authorityKey], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `AuthorityKey_${this.name.substring(0, 25).replace(/\s+/g, '_')}_voted_by_${this.signer.substring(0, 8)}.txt`);
  }
}
</script>

<style lang='scss' scoped>
.tips {
  text-align: center;
  font-size: 12px;
  line-height: 16px;
  color: #303030;
  margin: 0;
  position: relative;
  top: -16px;
  em {
    font-style: normal;
    text-decoration: underline;
    cursor: pointer;
  }
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
