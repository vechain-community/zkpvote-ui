<template>
  <div class="zkp-votes">
    <h2 class="zkp-votes__title">
      <span>All Votes</span>
      <span class="count">{{ allVoteNumber }}</span>
    </h2>
    <Table
      class="zkp-votes__table"
      :data="listData"
      empty-text='No Records'
    >
      <TableColumn label="Voters" prop="address" show-overflow-tooltip>
        <template slot-scope="scope">
          <div style="display: flex; align-items: center">
            <div
              class="zkp-avatar__img"
              :style="{
                background: `url('data:image/svg+xml;utf8,${avatarImg(scope.row.signer)}')`,
                backgroundSize: 'cover'
              }"
            />
            <p class="zkp-avatar__address">{{ scope.row.signer }}</p>
          </div>
        </template>
      </TableColumn>
      <TableColumn label="Txid" prop="txID" show-overflow-tooltip />
      <TableColumn label="Encrypted vote" prop="address" align="center">
        <template slot-scope="scope">
          <Tooltip
            content='Verify the vote'
            placement='top'
            effect="dark"
          >
            <div
              class="zkp-votes__control"
              @click="() => handleClick(scope.row)"
            />
          </Tooltip>
        </template>
      </TableColumn>
    </Table>
    <template v-if="data.length > 10">
      <div class="zkp-votes__see_more" @click="handleClickSeeMore">See more</div>
    </template>
    <DialogVerify
      :code="code"
      :visible="visible"
      :printData="printData"
      :loading="isLoading"
      :txID="txID"
      @close="handleClose"
    />
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import { Table, TableColumn, Tooltip } from 'element-ui';
import { picasso } from '@vechain/picasso';
import { PrintItem } from '@/interface/index.d';
import ConnexService from '@/api';
import { State } from 'vuex-class';
import { delay } from '@/utils';
import DialogVerify from '../Dialog/Verify.vue';

@Component({
  components: {
    Table,
    TableColumn,
    DialogVerify,
    Tooltip,
  },
})
export default class Votes extends Vue {
  @Prop({ type: Number, default: 0 }) private status!: number;

  @State('signer') private signer!: string;

  private visible = false;

  private seeMore = false;

  private allVoteNumber = '';

  private data: Array<{
    txID?: string;
    signer?: string;
    hash?: string;
  }> = []

  private code = '';

  private txID = '';

  private offset = 0;

  private isLoading = false;

  private printData: PrintItem[] = []

  private get voteID() {
    return this.$route.params.voteID;
  }

  private get listData() {
    return this.seeMore ? this.data : this.data.filter((_, index) => index < 10);
  }

  private created() {
    this.getAllVoteNumber();
    this.getAllVote();
  }

  private handleClickSeeMore() {
    this.seeMore = true;
  }

  private avatarImg(address: string) {
    return picasso(address);
  }

  private async getAllVoteNumber() {
    this.allVoteNumber = await ConnexService.getNumVoter(this.voteID);
  }

  private async getAllVote() {
    const response = await ConnexService.getCastBinaryBallot({
      id: this.voteID,
      from: this.offset,
    });

    if (!response || !response.length) { return false; }
    this.offset += response.length;

    response.forEach((item) => {
      if (!this.data.find((dataItem) => dataItem.signer === item.signer)) {
        this.data.push(item);
      }
    });

    this.getAllVote();
    return false;
  }

  private async handleClick(row: { signer: string; txID: string; hash: string }) {
    this.visible = true;

    this.isLoading = true;

    this.printData.push({
      tag: 'contract',
      desc: 'Get the encrypted ballot',
    });

    await delay(300);

    const response = await ConnexService.getBallot(this.voteID, row.signer);
    if (response) {
      this.txID = row.txID;
      this.printData.push({
        tag: 'contract',
        desc: 'Parsing voting proof',
      });

      await delay(300);

      this.code = JSON.stringify(this.getCompressedBallot(response.decoded, row.hash), null, 2);
      this.printData.push({
        tag: 'contract',
        desc: 'Verify the zk proof',
      });

      await delay(300);

      this.printData.push({
        tag: 'contract',
        desc: 'Perform Elliptic Curve calculations',
      });

      await delay(300);

      const data = await ConnexService.verifyBallot(this.voteID, row.signer);
      if (data && data.decoded) {
        if (data.decoded[0]) {
          this.printData.push({
            tag: 'success',
            desc: 'Result: Valid',
          });
        } else {
          this.printData.push({
            tag: 'error',
            desc: 'Result: Invalid',
          });
        }
      }
    }
    this.isLoading = false;
  }

  private getCompressedBallot(decoded?: Connex.Thor.Decoded, hash?: string) {
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
      hash,
    };
  }

  private handleClose(payload: boolean) {
    this.printData = [];
    this.visible = payload;
  }
}
</script>

<style lang='scss' scoped>
.zkp-avatar__img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-right: 16px;
}

.zkp-avatar__address {
  flex: 1;
  overflow: hidden;
  text-overflow:ellipsis;
  white-space: nowrap;
}

.zkp-votes {
  width: 800px;
  margin: 0 auto 20px;
  background-color: rgba(255, 255, 255, .15);
  padding: 24px 0 0;
  box-sizing: border-box;

  #{&}__control {
    width: 38px;
    height: 38px;
    background: url('../../assets/images/signature-solid@2x.png') no-repeat center;
    background-size: contain;
    margin: 0 auto;
    cursor: pointer;
  }

  #{&}__see_more {
    height: 60px;
    line-height: 60px;
    text-align: center;
    background-color: rgba(255, 255, 255, .15);
    font-size: 16px;
    color: #ffffff;

    &.disabled {
      pointer-events: none;
      cursor: not-allowed;
    }
  }

  #{&}__title {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    line-height: 31px;
    color: #ffffff;
    margin: 0 0 20px;
    .count {
      min-width: 26px;
      margin-left: 10px;
      text-align: center;
      padding: 0 6px;
      height: 26px;
      line-height: 26px;
      background-color: #fffe00;
      font-size: 16px;
      color: #000000;
      border-radius: 24px;
      box-sizing: border-box;
    }
  }
  #{&}__table {
    background-color: transparent;
    padding-bottom: 8px;
    &::before {
      display: none;
    }

    /deep/ .el-table__header {
      margin-bottom: 8px;
      & tr {
        background-color: rgba(255, 255, 255, .15);
      }
      & th {
        height: 60px;
        font-size: 16px;
        background-color: transparent;
        color: #ffffff;
        border-bottom: unset;
      }
      & th:first-child .cell {
        padding-left: 42px;
      }
      & th:last-child .cell {
        padding-right: 42px;
      }
    }
  }

  /deep/ .el-table__body {
    tr {
      background-color: transparent;
      color: #ffffff;
      &:hover {
        background-color: transparent;
        & > td {
          background-color: transparent;
        }
      }
    }

    td {
      padding-top: 0;
      padding-bottom: 0;
      border-bottom: unset;
      &:first-child .cell {
        padding-left: 42px;
      }
      &:last-child .cell {
        padding-right: 42px;
      }
    }
  }
}
</style>
