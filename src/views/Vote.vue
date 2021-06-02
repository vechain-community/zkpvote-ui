<template>
    <Main class="zkp-vote" :class="[!isTestNet ? 'zkpvote' : '']">
        <template v-if="isShow">
            <template v-if="status === 1 && topicDetail.topic">
                <Share :topic="topicDetail.topic" />
            </template>
            <template v-if="topicDetail.topic">
                <template v-if="isSelf && status === 0">
                    <Authority
                        @open="showActiveTheVote"
                        :authorityKey="authorityKey"
                        :name="topicDetail.topic"
                    />
                </template>
                <template v-if="(status === 0 && this.isSelf) || status > 0">
                    <Detail
                        :status="status"
                        :topicDetail="topicDetail"
                        :proposedBy="proposedBy"
                        :authPubKey="authPubKey"
                        :endTime="endTime"
                    />
                </template>
                <template v-if="voteResult && status > 0">
                    <Encrypted
                        :status="status"
                        :voteResult="voteResult"
                        :txID="txID"
                        :authPubKey="authPubKey"
                        :choices="topicDetail.choices"
                    />
                </template>
                <template v-if="status > 0">
                    <AllVotes :status="status" />
                </template>
                <template v-if="isSelf && status === 0">
                    <ActiveTheVote
                        :visible="isShowActiveTheVote"
                        :loading="isLoading"
                        @close="hideActiveTheVote"
                        :printData="printData"
                    />
                </template>
                <a href="https://faucet.vecha.in/" target="_blank" class="faucet-link"></a>
            </template>
        </template>
        <template v-if="isTestNet && isShowNotFound">
            <NotFound />
        </template>
        <template v-if="isPreLoading && !isShowNotFound">
            <div
                class="loading"
                v-loading="true"
                element-loading-background="rgba(255, 255, 255, 0)"
            />
        </template>
        <template v-if="!isTestNet">
            <div class="environment">
                <div class="content">
                    <h2 class="title">WRONG ENVIRONMENT</h2>
                    <p class="desc">ZKPVOTE runs in VeChainThor Testnet</p>
                </div>
            </div>
        </template>
        <Dialog
            center
            :visible="isShowSignin"
            :close-on-click-modal="false"
            width="410px"
            :show-close="false"
        >
            <img class="signin-image" src="@/assets/images/signin.png" />
            <p class="signin-text">Please sign in first</p>
            <Button colorType="dark" size="sm" width="180px" @click="login">Sign in</Button>
        </Dialog>
    </Main>
</template>

<script lang='ts'>
import { Vue, Component, Inject } from 'vue-property-decorator'
import { Avatar, Button } from '@/baseComponents'
import {
  Main,
  Authority,
  Detail,
  ActiveTheVote,
  CodeFormat,
  Share,
  Encrypted,
  AllVotes,
  NotFound,
} from '@/components'

import { Dialog } from 'element-ui'

import {
  Uint8Array2json,
  checkIsConnex,
  isOnLine,
  isTestNet,
  checkProtocolDetection,
  delay,
} from '@/utils'
import ipfs from '@/api/ipfs'
import ConnexService from '@/api'
import { PrintItem, Topic, Config } from '@/interface/index.d'
import { utils } from 'myvetools'
import { randPower, toHex } from '@/zkvote/utils'
import { State, Action } from 'vuex-class'
import { g } from '@/zkvote/ec'
import BN from 'bn.js'

@Component({
  components: {
    Avatar,
    Button,
    Main,
    Authority,
    Detail,
    ActiveTheVote,
    CodeFormat,
    Share,
    Encrypted,
    AllVotes,
    NotFound,
    Dialog,
  },
})
export default class Vote extends Vue {
    @State('signer') private signer!: string

    @State('config') private config!: Config

    @Action('setSigner') private setSigner!: (signer: string) => void

    @Inject('reload') private reload!: () => void

    private get voteID() {
      return this.$route.params.voteID
    }

    private get isPreLoading() {
      return (
        this.proposedBy
            && this.proposedBy !== '0x'
            && this.isTestNet
            && !this.topicDetail.topic
      )
    }

    private get isShow() {
      return this.isTestNet && this.status !== -1 && this.topicDetail.topic
    }

    private get isShowNotFound() {
      if (this.status === -1) {
        if (!this.voteIDStatus) {
          return true
        }
        if (!this.proposedBy) {
          return true
        }
        return false
      }
      if (this.isTestNet) {
        if (this.status > 0) {
          return false
        }
        if (this.status === 0 && this.isSelf) {
          return false
        }

        if (!this.voteIDStatus) {
          return true
        }

        if (this.status === 0 && (!this.signer || !this.isSelf)) {
          return true
        }

        if (!this.proposedBy) {
          return true
        }
      }
      return false
    }

    private isTestNet = true

    private authorityKey = ''

    private isShowSignin = false

    private isShowActiveTheVote = false

    private status = -1

    private endTime = -1

    private voteResult: Connex.Thor.VMOutput | string = ''

    private txID?: string = ''

    private authPubKey?: string = ''

    private topicDetail: Topic = {
      topic: '',
      choices: [],
    }

    private isSelf = false

    private proposedBy = '0x'

    private isLoading = false

    private printData: PrintItem[] = []

    private get voteIDStatus() {
      return this.voteID.length === 66 && utils.isHex(this.voteID)
    }

    private async created() {
      try {
        if (!(await checkIsConnex())) {
          checkProtocolDetection()
          return false
        }

        if (!(await isOnLine())) {
          throw Error('Connection Error')
        }

        if (!(await isTestNet())) {
          this.isTestNet = false
          throw Error('ZKPVote only runs in Testnet')
        }

        if (this.voteIDStatus) {
          const signer = await this.checkVoteIDexist()

          if (!signer) {
            return false
          }

          this.proposedBy = signer

          this.isSelf = this.signer === signer

          await this.getVoteStatus()

          await this.getVoteDetail(signer)

          if (!this.signer && !this.isShowNotFound) {
            return await this.login()
          }
        }
        return false
      } catch (err) {
        if ((err.message || err) === 'user cancelled') {
          this.isShowSignin = true
          return false
        }

        if ((err.message || err) === 'VoteID does not exist') {
          this.proposedBy = ''
        }

        return this.$notify({
          type: 'error',
          title: 'Error',
          message: `${err.message || err}`,
        })
      }
    }

    private async login() {
      const signer = await ConnexService.login()
      if (signer) {
        sessionStorage.setItem('signer', signer)
        this.setSigner(signer)
        this.reload()
      }
    }

    private async checkVoteIDexist() {
      const response = await ConnexService.checkVoteIDexist(this.voteID)
      if (!response) {
        return undefined
      }
      return response
    }

    private async getVoteDetail(signer: string) {
      const topic = await ipfs(this.config.ipfsConfig).files.read(
        `/${signer}/${this.voteID}`,
      )
      this.topicDetail = await Uint8Array2json(topic)
    }

    private async getVoteStatus() {
      try {
        const status = await ConnexService.proposalStatus(this.voteID)
        if (status !== undefined) {
          this.status = status
        }
        const endTime = await ConnexService.castEndTime(this.voteID)

        if (endTime !== undefined) {
          this.endTime = endTime
        }

        if (
          this.status === 1
                && this.endTime * 1000 < new Date().getTime()
        ) {
          this.status = 2
        }

        switch (this.status) {
          case 0:
            if (this.isSelf) {
              this.authorityKey = toHex(randPower())
            }
            break
          default:
            this.authPubKey = await ConnexService.getAuthPubKey(
              this.voteID,
            )
            if (this.signer) {
              await this.getVoteResult()
              await this.getCastBinaryBallot(0)
            }
            break
        }
      } catch (err) {
        this.$notify({
          type: 'error',
          title: 'Error',
          message: `${err.message || err}`,
        })
      }
    }

    private async getVoteResult() {
      const voteResult = await ConnexService.getBallot(
        this.voteID,
        this.signer,
      )
      if (voteResult) {
        this.voteResult = voteResult
      }
    }

    private async getCastBinaryBallot(from: number) {
      const response = await ConnexService.getCastBinaryBallot({
        id: this.voteID,
        fromAddress: this.signer,
        from,
        limit: 256,
      })
      if (response && response.length) {
        // eslint-disable-next-line array-callback-return
        const data = response.find((item) => item.signer === this.signer)
        if (data) {
          this.txID = data.txID
        } else {
          await this.getCastBinaryBallot(from + 10)
        }
      }
    }

    private hideActiveTheVote(payload: boolean) {
      this.printData = []
      this.isShowActiveTheVote = payload
      this.reload()
    }

    private async showActiveTheVote(payload: boolean) {
      if (!(await checkIsConnex())) {
        checkProtocolDetection()
        return false
      }

      if (!(await isOnLine())) {
        throw Error('Connection Error')
      }

      if (!(await isTestNet())) {
        throw Error('ZKPVote only runs in Testnet')
      }

      if (this.isLoading) {
        return false
      }

      this.isLoading = true
      this.isShowActiveTheVote = payload
      this.printData.push({
        tag: 'website',
        desc: 'Get private key',
      })

      await delay(300)

      this.printData.push({
        tag: 'website',
        desc: 'Perform Elliptic Curve calculations',
      })

      await delay(300)

      this.printData.push({
        tag: 'website',
        desc: 'Compute public key',
      })

      await delay(300)

      await this.setPublicKey()

      return false
    }

    private async setPublicKey() {
      try {
        const k = new BN(this.authorityKey.slice(2), 'hex')
        const gk = g.mul(k)
        this.printData.push({
          tag: 'contract',
          desc: 'Set public key',
        })

        await delay(300)

        const response = await ConnexService.setAuthPubKey(this.signer, [
          this.voteID,
          toHex(gk.getX()),
          gk.getY().isEven() ? '0x02' : '0x03',
        ])

        this.isLoading = false
        if (response) {
          this.printData.push({
            tag: 'success',
            desc: 'Active successfully!',
          })
        }
        return undefined
      } catch (err) {
        this.printData = []
        this.isLoading = false
        this.isShowActiveTheVote = false
        return this.$notify({
          type: 'error',
          title: 'Error',
          message: `${err}`,
        })
      }
    }
}
</script>

<style lang='scss' scoped>
.zkp-vote {
    padding: 20px 0 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.loading {
    width: 100%;
    height: 400px;
}

.title {
    font-size: 40px;
    font-family: AlibabaSans;
    font-weight: 900;
    color: #ffffff;
    line-height: 62px;
    margin: 0;
}

.desc {
    font-size: 18px;
    font-family: AlibabaSans;
    font-weight: bold;
    color: #ffffff;
    line-height: 28px;
    margin: 6px 0 0 0;
}

.zkpvote {
    padding: 0;
    max-width: 100%;
    min-height: 800px;
    background: url('../assets/images/not-found/wrong-enviroment-bg.png')
        no-repeat bottom center;
    background-size: contain;
}

.environment {
    width: 100%;
    flex: 1;
    position: relative;

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
    }
}

.signin-image {
    display: block;
    margin: 0 auto;
}
.signin-text {
    font-size: 18px;
    font-weight: 700;
    color: #000000;
    line-height: 28px;
    text-align: center;
}

.faucet-link {
    position: fixed;
    right: 60px;
    bottom: 70px;
    width: 225px;
    height: 90px;
    background: url('../assets/images/faucet-bg.png') no-repeat center;
    background-size: contain;
    &:hover {
        background: url('../assets/images/faucet-hover-bg.png') no-repeat center;
        background-size: contain;
    }
}
</style>
