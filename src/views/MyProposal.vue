<template>
  <Main className='zkp-myProposal'>
    <div class='zkp-myProposal__container'>
      <Avatar />
      <h2 class='zkp-myProposal__title'>My proposals</h2>
      <ul class='zkp-myProposal__tab'>
        <template v-for='tab in tabs'>
          <li
            :class='tab.value === active && "active"'
            :key='tab.value'
            @click='() => handleFilter(tab.value)'
          >
            {{ tab.label }}
          </li>
        </template>
      </ul>
      <div
        class='zkp-myProposal__content'
        v-loading='isLoading'
        element-loading-background="rgba(255, 255, 255, 0)"
      >
        <Table
          :data='tableData'
          :show-header='false'
          class='zkp-myProposal__table'
          @row-click="handleRedirect"
          empty-text='No Records'
          v-show='!isLoading'
        >
          <TableColumn prop='topic' />
          <TableColumn prop='status' width='180' align='right'>
            <template slot-scope='scope'>
              <Tag :type='statusMap[scope.row.status].type'>
                {{ statusMap[scope.row.status].label}}
              </Tag>
            </template>
          </TableColumn>
          <Pagination
            :page-size="limit"
            slot='append'
            layout='prev, pager, next'
            :total="allData.length"
            background
            align='center'
            hide-on-single-page
            :current-page='currentPage'
            @current-change='handleChangeCurrentPage'
          />
        </Table>
      </div>
    </div>
  </Main>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import { Main } from '@/components';
import { Avatar, Tag } from '@/baseComponents';
import { Pagination, Table, TableColumn } from 'element-ui';
import { statusMap, Uint8Array2json } from '@/utils';
import { State } from 'vuex-class';
import ConnexService from '@/api';
import ipfs from '@/api/ipfs';
import {
  VoteItem, IpfsFileItem, Config,
} from '@/interface/index.d';

@Component({
  components: {
    Main,
    Avatar,
    Tag,
    Pagination,
    Table,
    TableColumn,
  },
})
export default class MyProposal extends Vue {
  @State('signer') private signer!: string;

  @State('config') private config!: Config;

  private isLoading = true;

  private active = 'all';

  private statusMap = statusMap;

  private limit = 10;

  private currentPage = 1;

  private tabs = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'voting', label: 'Voting' },
    { value: 'tally', label: 'To be tallied' },
    { value: 'ended', label: 'Ended' },
  ]

  private voteList: Array<VoteItem> = [];

  private created() {
    this.getIpfsList();
  }

  private handleChangeCurrentPage(currentPage: number) {
    this.currentPage = currentPage;
  }

  private get allData() {
    return this.voteList.filter((item) => {
      if (this.active === 'all') {
        return item;
      }
      return item.status === this.tabs.findIndex((tab) => tab.value === this.active) - 1;
    });
  }

  private get tableData() {
    const start = (this.currentPage - 1) * this.limit;
    const end = this.currentPage * this.limit;
    return this.allData.filter((item: VoteItem, index: number) => index >= start && index < end);
  }

  private async getVoteList(list: IpfsFileItem[], from: number) {
    const voteIDs = await ConnexService.getVoteDetail({
      fromAddress: this.signer,
      from,
      limit: this.limit,
    });
    if (voteIDs) {
      this.voteList.push(...await voteIDs.reduce(async (result, current) => {
        const prevResult = await result;
        const flag = list.find(
          (fileItem: IpfsFileItem) => fileItem.name.toLowerCase() === current.toLowerCase(),
        );
        if (flag) {
          let status = await ConnexService.proposalStatus(current);
          const endTime = await ConnexService.castEndTime(current);
          if (status === 1 && endTime * 1000 < new Date().getTime()) {
            status = 2;
          }
          const topic = await ipfs(this.config.ipfsConfig).files
            .read(`/${this.signer}/${current}`)
            .catch((err: ErrorConstructor) => {
              console.log(err.toString());
            });
          if (topic) {
            const topicDetail = await Uint8Array2json(topic);
            return [
              ...prevResult,
              {
                voteID: current,
                status,
                topic: topicDetail.topic,
              },
            ];
          }
        }
        return result;
      }, []));

      if (voteIDs.length === this.limit) {
        await this.getVoteList(list, from + 10);
      } else {
        this.isLoading = false;
      }
    }
  }

  private async getIpfsList() {
    try {
      const list = await ipfs(this.config.ipfsConfig).files.ls(`/${this.signer}`);
      if (list.length) {
        await this.getVoteList(list, 0);
      }
    } catch {
      this.isLoading = false;
    }
  }

  private handleFilter(type: string) {
    this.currentPage = 1;
    this.active = type;
  }

  private handleRedirect(row: VoteItem) {
    this.$router.push(`/vote/${row.voteID}`);
  }
}
</script>

<style lang='scss' scoped>
.zkp-myProposal {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 46px 0 78px;

  #{&}__table {
    background-color: transparent;
    &::before {
      display: none;
    }
    /deep/ .el-table__append-wrapper {
      margin-top: 24px;
    }
    /deep/ .el-table__body {
      border-collapse: separate;
      border-spacing: 0px 3px;
      tr {
        background-color: rgba(255, 255, 255, 0.15);
        color: #ffffff;
        transition: all .3s linear;

        &:hover {
          background-color: transparent;
          & > td {
            background-color: transparent;
          }
        }
      }

      td {
        border-bottom: unset;
        &:first-child .cell {
          padding-left: 20px;
        }
      }
    }
  }

  #{&}__container {
    width: 800px;
    min-height: 100%;
    background-color: rgba(255, 255, 255, .15);
    padding: 24px 24px 90px;
    box-sizing: border-box;
  }

  #{&}__title {
    font-family: AlibabaSans;
    font-weight: 700;
    margin: 20px 0 0;
    text-align: center;
    font-size: 30px;
    line-height: 47px;
    color: #ffffff;
  }

  #{&}__content {
    margin: 0 -24px;
    min-height: 200px;
  }

  #{&}__tab {
    padding-left: 0;
    display: flex;
    list-style-type: none;
    justify-content: center;
    font-family: AlibabaSans;
    color: #ffffff;
    margin: 28px 0 25px;

    & > li {
      padding: 0.25em 0.75em;
      border-radius: 2px;
      line-height: 1.5;
      cursor: pointer;
      font-size: 14px;
      user-select: none;
      &:not(:last-child) {
        margin-right: 1em;
      }

      &.active {
        background-color: #ffffff;
        color: #284d64;
      }
    }
  }

  #{&}__tagWrapper {
    width: 180px;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
