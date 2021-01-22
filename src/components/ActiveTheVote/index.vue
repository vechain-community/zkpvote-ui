<template>
  <Dialog
    center
    title="Active the vote"
    :visible="visible"
    :close-on-click-modal="!loading"
    :show-close="!loading"
    width="600px"
    @close='close'
  >
    <template v-if="printData.length">
      <Print :data="printData" />
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
      @click="close"
      :loading="loading"
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

@Component({
  components: {
    Button,
    Dialog,
    Print,
  },
})
export default class ActiveTheVote extends Vue {
  @Prop({ type: Boolean, default: false }) private visible!: boolean;

  @Prop({ type: Boolean, default: true }) private loading!: boolean;

  @Prop({ type: Array, default: () => ([]) }) private printData!: PrintItem[];

  @Emit()
  private close() {
    return false;
  }
}
</script>

<style lang='scss' scoped>
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
