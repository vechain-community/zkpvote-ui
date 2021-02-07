<template>
  <div class='zkp-detail'>
    <Avatar />
    <p
      class='zkp-detail__endTime'
      v-if='endTime !== -1'
    >
      End in {{ formatEndTime() }}
    </p>
    <p class='zkp-detail__by'>
      Proposed by:
      <a
        :href='`https://explore-testnet.vechain.org/accounts/${proposedBy}`'
        target='_blank'
      >
        {{ proposedBy | ellipsis }}
      </a>
    </p>
    <template v-if='"topic" in topicDetail'>
      <h2 class='zkp-detail__title'>
        {{ topicDetail.topic }}
        <template v-if='status !== -1'>
          <Tag :type='statusMap[status].type'>{{ statusMap[status].label }}</Tag>
        </template>
      </h2>
      <RadioGroup
        v-model='option'
        :disabled='status !== 1'
        v-if='status < 2'
      >
        <template v-for='(choice, index) in topicDetail.choices'>
          <Radio :key='choice' :label='index + 1'>{{choice}}</Radio>
        </template>
      </RadioGroup>
    </template>
    <template v-if='status > 1'>
      <div class='zkp-detail__result'>
        <div class='item'>
          <div class='label'>
            <span class='option'>{{ topicDetail.choices[0] }}</span>
            <template v-if='status === 3'>
              <span class='votes'>{{ result.yes }} votes, {{ percentage(result.yes) }}%</span>
            </template>
            <template v-else>
              <span class='votes'>- votes</span>
            </template>
          </div>
          <div class='track'>
            <div
              class='progress'
               v-if='status === 3'
              :style="{ width: `${percentage(result.yes)}%` }"
            />
          </div>
        </div>
        <div class='item'>
          <div class='label'>
            <span class='option'>{{ topicDetail.choices[1] }}</span>
            <template v-if='status === 3'>
              <span class='votes'>
                {{ result.no }} votes,
                {{ percentage(result.no) }}%
              </span>
            </template>
            <template v-else>
              <span class='votes'>- votes</span>
            </template>
          </div>
          <div class='track'>
            <div
              class='progress'
               v-if='status === 3'
              :style="{ width: `${percentage(result.no)}%` }"
            />
          </div>
        </div>
      </div>
    </template>
    <template v-if='status === 1'>
      <Button
        size='sm'
        class='zkp-detail__button'
        width='230px'
        :disabled='!option'
        @click='handleVoteAction'
      >
        Vote
      </Button>
      <p class="zkp-detail__noSelf">
        The voting results will be announced after the voting ends
      </p>
    </template>
    <template v-if='status === 2'>
      <p class="zkp-detail__noSelf">
        The result will be counted and upload by the author
      </p>
      <Button
        class='zkp-detail__tally'
        width='282px'
        @click='handleTally'
        v-if='proposedBy === signer'
      >
        <span>Tally</span>
        <small>Calculate the result</small>
      </Button>
    </template>
    <template v-if='status === 3'>
      <Button
        class='zkp-detail__tally'
        width='230px'
        size='sm'
        @click='verifyTallyRes'
        :disabled='!txID'
      >
        Verify the result
      </Button>
    </template>
    <DialogVote
      :visible='visible'
      :printData='printData'
      @close='handleClose'
      :loading='voteIsLoading'
      :authorityKey='authorityKey'
      :name='topicDetail.topic'
    />
    <DialogTally
      :visible='visibleTally'
      @close='handleTallyClose'
      :authPubKey='authPubKey'
    />
    <DialogResult
      :visible='visibleResult'
      :printData='printData2'
      :txID='txID'
      :loading='resultLoading'
      :code='JSON.stringify({
        voteid: this.voteID,
        choice1: this.result.yes,
        choice2: this.result.no,
        valid: this.result.valid,
        invlid: this.result.invalid,
      }, null, 2)'
      @close='handleResultClose'
    />
  </div>
</template>

<script lang='ts'>
import {
  Vue, Component, Prop, Inject,
} from 'vue-property-decorator';
import { Avatar, Tag, Button } from '@/baseComponents';
import {
  checkIsConnex,
  isOnLine,
  isTestNet,
  checkProtocolDetection,
  ellipsis,
  delay,
} from '@/utils';
import { PrintItem, Topic } from '@/interface/index.d';
import { State, Action } from 'vuex-class';
import { Radio, RadioGroup } from 'element-ui';
import { point } from '@/zkvote/ec';
import BN from 'bn.js';
import { randPower, toHex } from '@/zkvote/utils';
import { generateBallot, compressBallot } from '@/zkvote/binary-ballot';
import ConnexService from '@/api';
import dayjs from 'dayjs';
import DialogVote from '../Dialog/Vote.vue';
import DialogTally from '../Dialog/Tally.vue';
import DialogResult from '../Dialog/Result.vue';

@Component({
  filters: {
    ellipsis,
    dayjs,
  },
  components: {
    Avatar,
    Tag,
    Radio,
    RadioGroup,
    Button,
    DialogVote,
    DialogTally,
    DialogResult,
  },
})
export default class Detail extends Vue {
  @Action('setSigner') private setSigner!: (signer: string) => void

  @Inject('reload') private reload!: () => void

  @State('signer') private signer!: string;

  @Prop({ type: Number, default: 0 }) private status!: number;

  @Prop({ type: String, default: '' }) private proposedBy!: string;

  @Prop({ type: String, default: '' }) private authPubKey!: string;

  @Prop() private endTime!: string | number;

  @Prop({ type: Object, default: () => ({}) }) private topicDetail!: Topic;

  private get voteID() {
    return this.$route.params.voteID;
  }

  private visible = false;

  private visibleTally = false;

  private visibleResult = false;

  private resultLoading = false;

  private option: string | number = '';

  private statusMap = [
    {
      type: 'warning',
      label: 'Pending',
    },
    {
      type: 'default',
      label: 'Voting',
    },
    {
      type: 'ended',
      label: 'Ended',
    },
    {
      type: 'ended',
      label: 'Ended',
    },
  ];

  private authorityKey = '';

  private tallyIsLoading = false;

  private voteIsLoading = false;

  private isCast = false;

  private txID = '';

  private result = {
    valid: 0,
    no: 0,
    yes: 0,
    invalid: 0,
  }

  private printData: PrintItem[] = []

  private printData2: PrintItem[] = []

  private formatEndTime() {
    return dayjs.unix(+this.endTime).format('YYYY.MM.DD HH:mm');
  }

  private handleClose(payload: boolean) {
    this.authorityKey = '';
    this.printData = [];
    this.visible = payload;
    if (this.isCast) {
      this.reload();
    }
  }

  private async verifyTallyRes() {
    try {
      if (this.visibleResult) {
        return false;
      }
      this.visibleResult = true;
      this.resultLoading = true;

      this.printData2.push({
        tag: 'contract',
        desc: 'Get the encrypted ballot',
      });
      await delay(300);
      this.printData2.push({
        tag: 'contract',
        desc: 'Parsing voting proof',
      });
      await delay(300);
      this.printData2.push({
        tag: 'contract',
        desc: 'Verify the zk proof',
      });
      await delay(300);
      this.printData2.push({
        tag: 'contract',
        desc: 'Perform Elliptic Curve calculations',
      });
      await delay(300);
      const valid = await ConnexService.verifyTallyRes(this.voteID);
      this.resultLoading = false;
      if (valid) {
        if (parseInt(valid, 16)) {
          this.printData2.push({
            tag: 'success',
            desc: 'Result: Valids',
          });
        } else {
          this.printData2.push({
            tag: 'error',
            desc: 'Result: InValid',
          });
        }
      }
      return false;
    } catch (err) {
      this.visibleResult = false;
      this.resultLoading = false;
      this.printData = [];
      return this.$notify({
        type: 'error',
        title: 'Error',
        message: `${err.message || err}`,
      });
    }
  }

  private async created() {
    if (this.status === 3) {
      const result = await ConnexService.getTallyRes(this.voteID);
      this.txID = await ConnexService.setTallyResEvent(this.voteID) as string;
      if (result) {
        this.result.valid = +result[0] - +result[1];
        this.result.invalid = +result[1];
        this.result.yes = +result[2];
        this.result.no = this.result.valid - this.result.yes;
      }
    }
  }

  private percentage(number: number) {
    let percentage = 0;
    if (number > 0) {
      percentage = ((number / this.result.valid) * 100);
    }
    if (percentage >= 100) {
      percentage = 100;
    }
    return percentage.toFixed(2);
  }

  private handleTally() {
    this.visibleTally = true;
  }

  private handleTallyClose(payload: boolean) {
    this.visibleTally = payload;
  }

  private handleResultClose(payload: boolean) {
    this.visibleResult = payload;
    this.printData2 = [];
  }

  private async handleVoteAction() {
    if (!this.signer) {
      await this.handleLogin();
    } else {
      await this.handleVote();
    }
  }

  private async handleLogin() {
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

      if (+this.endTime * 1000 < new Date().getTime()) {
        throw Error('Fail to vote. The vote is ended');
      }
      const signer = await ConnexService.login();
      if (signer) {
        sessionStorage.setItem('signer', signer);
        this.setSigner(signer);
        this.reload();
      }
      return false;
    } catch (err) {
      return this.$notify({
        type: 'error',
        title: 'Message',
        message: `${err.message || err}`,
      });
    }
  }

  private async handleVote() {
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

      if (+this.endTime * 1000 < new Date().getTime()) {
        throw Error('Fail to vote. The vote is ended');
      }

      this.visible = true;
      this.voteIsLoading = true;
      this.printData.push({
        tag: 'website',
        desc: 'Get your option',
      });

      await delay(300);

      const gk = point(
        new BN(`${this.authPubKey.slice(2, 66)}`, 'hex'),
        new BN(`${this.authPubKey.slice(66, 130)}`, 'hex'),
      );

      this.printData.push({
        tag: 'website',
        desc: 'Generate private key',
      });

      await delay(300);

      const a = randPower();
      this.authorityKey = toHex(a);
      this.printData.push({
        tag: 'website',
        desc: 'Encrypted your option with the private key',
      });

      await delay(300);

      const val = this.option === 1;

      const ballot = generateBallot({
        a,
        gk,
        v: val,
        address: this.signer,
      });

      this.printData.push({
        tag: 'website',
        desc: 'Compress your vote',
      });

      await delay(300);

      const b = compressBallot(ballot);
      this.printData.push({
        tag: 'browser',
        desc: 'Send vote transaction',
      });

      await delay(300);

      this.printData.push({
        tag: 'contract',
        desc: 'Upload your encrypted & compressed vote',
      });

      await delay(300);

      const response = await ConnexService.cast(
        this.signer,
        [this.voteID, b.h, b.y, b.zkp, b.prefix],
      ).catch((err) => {
        this.printData.push({
          tag: 'error',
          desc: err,
        });
      });
      this.voteIsLoading = false;
      if (response && 'signer' in response) {
        this.isCast = true;
        this.printData.push({
          tag: 'success',
          desc: `
            Vote successfully!
            Your vote has been encrypted on the blockchain. No one else knows what you have voted. <strong @click="handleDownload">Download</strong> the vote key to decrypt your vote.
          `,
        });
      }
      return false;
    } catch (err) {
      this.voteIsLoading = false;
      return this.$notify({
        type: 'error',
        title: 'Message',
        message: `${err.message || err}`,
      });
    }
  }
}
</script>

<style lang='scss' scoped>
.zkp-detail {
  width: 800px;
  margin: 0 auto 20px;
  background-color: rgba(255, 255, 255, .15);
  padding: 24px 40px 46px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;

  #{&}__endTime {
    position: absolute;
    right: 21px;
    top: 29px;
    font-size: 12px;
    line-height: 18px;
    margin: 0;
    color: #ffffff;
  }

  #{&}__noSelf {
    text-align: center;
    font-size: 12px;
    line-height: 18px;
    color: #f5a623;
  }

  #{&}__result {
    width: 80%;
    margin: 24px auto;

    .item  {
      margin-bottom: 12px;
    }

    .label {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      line-height: 25px;
      margin-bottom: 6px;

      .option {
        color: #ffffff;
        margin-right: 0.75em;
        word-wrap: break-word;
        white-space: pre-line;
        word-break: break-word;
      }

      .votes {
        color: #fffe00;
        flex-shrink: 0;
        white-space: nowrap;
      }
    }

    .track {
      width: 100%;
      height: 5px;
      border-radius: 5px;
      background-color: #d8d8d8;
    }

    .progress {
      border-radius: 5px;
      height: 100%;
      background-color: #fffe00;
    }
  }

  #{&}__by {
    font-size: 14px;
    line-height: 22px;
    color: #ffffff;
    text-align: center;
    margin: 17px 0 4px;
    a {
      color: #ffffff;
      text-decoration: underline;
    }
  }

  #{&}__title {
    font-size: 24px;
    line-height: 36px;
    color: #ffffff;
    text-align: center;
    word-break: break-all;
    white-space: pre-line;
    & > span {
      margin-left: 1em;
      position: relative;
      top: -0.25em;
    }
  }

  #{&}__button {
    margin-top: 24px;
  }

  #{&}__tally {
    margin-top: 12px;
    small {
      font-size: 12px;
    }
  }

  /deep/ .el-radio-group {
    display: flex;
    flex-direction: column;
    align-self: center;
    .el-radio {
      margin: 6px 0;
    }
  }
}
</style>
