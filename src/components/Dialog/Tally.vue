<template>
  <Dialog
    center
    :visible="visible"
    :close-on-click-modal="!isShow || result"
    width="675px"
    :show-close='!isShow || result'
    @close="close"
  >
    <h3 slot="title" style="margin: 0">Tally</h3>
    <template v-if="!authorityKey">
      <Upload
        drag
        action=''
        :before-upload='handleBeforeUpload'
        accept=".txt"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Upload the authority key generated when active this vote</div>
      </Upload>
    </template>
    <template v-if="authorityKey">
      <div class="authority">
        <span>Authority Key</span>
        <span>{{ authorityKey }}</span>
      </div>
    </template>
    <template v-if="authorityKey && !isShow">
      <CustomButton
        colorType='dark'
        width="310"
        size='sm'
        @click="handleUploadResult"
        style="margin: 52px auto"
      >
        Calculate and upload result
      </CustomButton>
    </template>

    <template v-if="printData.length">
      <Print :data="printData" />
    </template>
    <template v-if='isShow'>
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
        :loading='!result'
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
  Inject,
} from 'vue-property-decorator';
import { Button as CustomButton } from '@/baseComponents';
import { Dialog, Upload, Button } from 'element-ui';
import { PrintItem } from '@/interface/index.d';
import ConnexService from '@/api';
import { State } from 'vuex-class';
import { Tally, prepTallyRes, ResForTally } from '@/zkvote/binary-tally';
import { g, point } from '@/zkvote/ec';
import { toHex } from '@/zkvote/utils';
import BN from 'bn.js';
import { uncompressBallot } from '@/zkvote/binary-ballot';
import {
  checkIsConnex, checkProtocolDetection, isOnLine, isTestNet, delay,
} from '@/utils';
import CodeFormat from '../CodeFormat/index.vue';
import Print from '../Print/index.vue';

@Component({
  components: {
    CustomButton,
    Dialog,
    CodeFormat,
    Upload,
    Button,
    Print,
  },
})
export default class DialogTally extends Vue {
  @Inject('reload') private reload!: () => void;

  @Prop({ type: Boolean, default: false }) private visible!: boolean;

  @Prop({ type: String, default: '' }) private authPubKey!: string;

  @State('signer') private signer!: string;

  private printData: PrintItem[] = [];

  private authorityKey = '';

  private isShow = false;

  private result = false;

  private completed = false;

  private get voteID() {
    return this.$route.params.voteID;
  }

  private handleBeforeUpload(file: File) {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        this.authorityKey = reader.result.trim();
      }
    };
    reader.readAsText(file);
    return false;
  }

  private getCompressedBallot(decoded: Connex.Thor.Decoded) {
    return {
      h: toHex(decoded[0], 10),
      y: toHex(decoded[1], 10),
      zkp: [
        toHex(decoded[2][0], 10),
        toHex(decoded[2][1], 10),
        toHex(decoded[2][2], 10),
        toHex(decoded[2][3], 10),
        toHex(decoded[2][4], 10),
        toHex(decoded[2][5], 10),
        toHex(decoded[2][6], 10),
        toHex(decoded[2][7], 10),
      ],
      prefix: toHex(decoded[3], 10),
    };
  }

  private async handleUploadResult() {
    try {
      if (!await checkIsConnex()) {
        checkProtocolDetection();
        return false;
      }
      if (!await isOnLine()) {
        throw Error('Connection Error');
      }
      if (!await isTestNet()) {
        throw Error('ZKPVote only runs in Testnet');
      }
      if (this.isShow) {
        return false;
      }
      this.isShow = true;
      const k = new BN(this.authorityKey.slice(2), 'hex');

      const createGk = g.mul(k);

      if (
        toHex(createGk.getX()).slice(2) !== this.authPubKey.slice(2, 66)
          && toHex(createGk.getY()).slice(2) !== this.authPubKey.slice(66, 130)
      ) {
        throw Error('Wrong vote key');
      }

      const gk = point(
        new BN(`${this.authPubKey.slice(2, 66)}`, 'hex'),
        new BN(`${this.authPubKey.slice(66, 130)}`, 'hex'),
      );
      this.printData.push({
        tag: 'website',
        desc: 'Perform Elliptic Curve calculations with Authority Key to get GK',
      });

      await delay(300);

      this.printData.push({
        tag: 'website',
        desc: 'Calling contract to get result',
      });

      await delay(300);

      this.printData.push({
        tag: 'contract',
        desc: 'Get all compressed votes',
      });

      await delay(300);

      this.printData.push({
        tag: 'website',
        desc: 'Uncompress all votes with GK',
      });

      const allVoteNumber = await ConnexService.getNumVoter(this.voteID);
      let r: ResForTally = {
        V: 0,
        X: '0x0',
        Y: '0x0',
        zkp: ['0x0', '0x0', '0x0'],
        prefix: '0x0',
        invalidBallots: [],
      };

      if (allVoteNumber > 0) {
        const tally = new Tally(k, this.signer);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < +allVoteNumber; i++) {
          /* eslint-disable no-await-in-loop */
          const addr = await ConnexService.getVoter(this.voteID, i);
          if (addr) {
            const ballot = await ConnexService.getBallot(this.voteID, addr);
            if (ballot && ballot.decoded) {
              const cb = this.getCompressedBallot(ballot.decoded);
              const b = uncompressBallot(cb, addr, gk);

              tally.count(b);
            }
          }
        }

        r = prepTallyRes(tally.getRes());
      }
      await delay(300);

      this.printData.push({
        tag: 'contract',
        desc: 'Group valid and invalid votes',
      });

      await delay(300);

      this.printData.push({
        tag: 'contract',
        desc: 'Group by votes option',
      });

      await delay(300);

      const response = await ConnexService.Tally(this.signer, [
        this.voteID,
        r.invalidBallots,
        r.V,
        r.X,
        r.Y,
        r.zkp,
        r.prefix,
      ]);

      if (!response) {
        return false;
      }

      const result = await ConnexService.getTallyRes(this.voteID);
      // this.txID = await ConnexService.setTallyResEvent(this.voteID) as string;
      if (result) {
        this.completed = true;
        const total = +result[0];
        const yes = +result[2];
        const invalid = +result[1];
        const valid = total - invalid;
        this.printData.push({
          tag: 'success',
          desc: `
      Tally successfully!
      **************************************************
      Voting result:
      Choice1: ${yes}
      Choice2: ${valid - yes}
      Invalid votes: ${invalid}
      `,
        });
      }
      this.result = true;
    } catch (err) {
      this.result = true;
      this.$notify({
        type: 'error',
        title: 'Message',
        message: `${err.message || err}`,
      });
    }
    return false;
  }

  @Emit()
  private close() {
    if (this.completed) {
      this.reload();
    }
    this.completed = false;
    this.authorityKey = '';
    this.isShow = false;
    this.printData = [];
    this.result = false;
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

.authority {
  border: 1px solid #d9d9d9;
  padding: 30px;
  margin: 12px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 4px;
  span {
    color: #000000;
    &:first-child {
      font-size: 14px;
      line-height: 17px;
      margin-bottom: 3px;
      font-weight: 700;
    }
    &:last-child {
      font-size: 12px;
      line-height: 14px;
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
