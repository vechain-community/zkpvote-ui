<template>
  <Dialog
    center
    :visible="visible"
    width="730px"
    @close='close'
  >
    <h3 slot="title" style="margin: 0">Decrypt your vote</h3>
    <CodeFormat type="dark" :data="code" />
    <p class="txid">
      TxID:
      <a target='_blank' :href='`https://explore-testnet.vechain.org/transactions/${txID}`'>{{txID}}</a>
    </p>
    <template v-if='!authorityKey && !voteResult.number'>
      <Upload
        drag
        action=''
        :before-upload='handleBeforeUpload'
        accept=".txt"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Upload the vote key generated when you voted</div>
      </Upload>
    </template>
    <template v-if='isLoading'>
      <Button loading class="loading">Decrypt…</Button>
    </template>
    <template v-if="voteResult.number">
      <div class="option">
        <span>Your option:</span>
        <span>Option{{ voteResult.number }}, {{ voteResult.choice }}</span>
      </div>
      <a
        class="github-link"
        href='https://github.com/zzGHzz/zkVoteContract/blob/master/contractV2/'
        target="_blank"
      >
        <span></span>
        See more details
      </a>
      <CustomButton
        colorType='dark'
        width="200px"
        size='sm'
        @click="close"
      >
        Done
      </CustomButton>
    </template>

  </Dialog>
</template>

<script lang='ts'>
import {
  Vue,
  Component,
  Prop,
  Emit,
} from 'vue-property-decorator';
import { Button as CustomButton } from '@/baseComponents';
import { Dialog, Upload, Button } from 'element-ui';
import { PrintItem } from '@/interface/index.d';
import BN from 'bn.js';
import { g, ECP, point } from '@/zkvote/ec';
import { toHex } from '@/zkvote/utils';
import { State } from 'vuex-class';
import { uncompressBallot, verifyBallot } from '@/zkvote/binary-ballot';
import CodeFormat from '../CodeFormat/index.vue';

@Component({
  components: {
    CustomButton,
    Dialog,
    CodeFormat,
    Upload,
    Button,
  },
})
export default class DialogVote extends Vue {
  @State('signer') private signer!: string;

  @Prop({ type: Boolean, default: false }) private visible!: boolean;

  @Prop({ type: Boolean, default: true }) private disabled!: boolean;

  @Prop({ type: String, default: '' }) private txID!: string;

  @Prop({ type: String, default: '' }) private authPubKey!: string;

  @Prop({ type: String, default: true }) private code!: string;

  @Prop({ type: Array, default: () => ([]) }) private choices!: string[];

  private get voteID() {
    return this.$route.params.voteID;
  }

  private printData: PrintItem[] = [];

  private authorityKey = '';

  private isLoading = false;

  private voteResult = {
    number: 0,
    choice: '',
  }

  @Emit()
  private close() {
    this.authorityKey = '';
    this.isLoading = false;
    this.voteResult = {
      number: 0,
      choice: '',
    };
    return false;
  }

  private getBallotContent(a: BN, gk: ECP, y: ECP): boolean {
    const w = gk.mul(a);
    if (w.eq(y)) {
      return false;
    } if (w.add(g).eq(y)) {
      return true;
    }
    throw new Error('Wrong vote key');
  }

  private async getSelfVoteOption() {
    try {
      const k = new BN(this.authorityKey.slice(2), 'hex');
      const gk = point(
        new BN(`${this.authPubKey.slice(2, 66)}`, 'hex'),
        new BN(`${this.authPubKey.slice(66, 130)}`, 'hex'),
      );

      const parseCode = JSON.parse(this.code);

      const b = uncompressBallot({
        h: toHex(parseCode.h.substr(2), 10),
        y: toHex(parseCode.y.substr(2), 10),
        zkp: [
          toHex(parseCode.zkp[0].substr(2), 10),
          toHex(parseCode.zkp[1].substr(2), 10),
          toHex(parseCode.zkp[2].substr(2), 10),
          toHex(parseCode.zkp[3].substr(2), 10),
          toHex(parseCode.zkp[4].substr(2), 10),
          toHex(parseCode.zkp[5].substr(2), 10),
          toHex(parseCode.zkp[6].substr(2), 10),
          toHex(parseCode.zkp[7].substr(2), 10),
        ],
        prefix: toHex(parseCode.prefix.substr(2), 10),
      }, this.signer, gk);

      if (!verifyBallot(b)) {
        throw Error('Wrong vote key');
      }

      const voteResult = this.getBallotContent(k, gk, b.y);

      if (voteResult !== undefined) {
        this.isLoading = false;
        this.voteResult = {
          number: voteResult ? 1 : 2,
          choice: this.choices[voteResult ? 0 : 1],
        };
      }
    } catch (err) {
      this.isLoading = false;
      this.authorityKey = '';
      this.$notify({
        type: 'error',
        title: 'Error',
        message: err.message || err,
      });
    }
  }

  private handleBeforeUpload(file: File) {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        this.authorityKey = reader.result.trim();
        if (this.isLoading) {
          return false;
        }
        this.isLoading = true;
        this.getSelfVoteOption();
      }
      return false;
    };
    reader.readAsText(file);

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

.loading {
  width: 100%;
  margin: 12px 0;
  padding: 24px 12px;
  height: 100px;
  font-size: 16px;
  color: #000000;
  border: 1px solid #d9d9d9;
}

.option {
  height: 100px;
  border: 1px solid #d9d9d9;
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  span {
    color: #000000;
    &:first-child {
      font-size: 16px;
      line-height: 24px;
      margin-bottom: 3px;
      font-weight: 500;
    }
    &:last-child {
      font-size: 14px;
      line-height: 22px;
    }
  }
}

/deep/ .el-upload {
  width: 100%;
}

/deep/ .el-icon-upload {
  margin: 0 10px 0 0;
  font-size: 48px;
}

/deep/ .el-upload-dragger {
  height: auto;
  padding: 24px 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
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
