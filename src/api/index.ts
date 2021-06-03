import getConnex from '@/utils/initConnex'
import { utils } from 'myvetools'
import { addrVotingContract, abiVotingContract } from '@/abi'

const connex = getConnex()
export default class ConnexService {
  private static instance: ConnexService

  private static contractAddress: string

  private static connex: Connex

  public static getInstance(contractAddress: string): ConnexService {
    if (!ConnexService.instance) {
      ConnexService.instance = new ConnexService()
      ConnexService.contractAddress = contractAddress
    }
    return ConnexService.instance
  }

  /**
   * transferMethod
   * @param abiName
   */
  private static transferMethod(abiName: string) {
    return connex.thor
      .account(addrVotingContract)
      .method(utils.getABI(abiVotingContract, abiName, 'function'))
  }

  /**
   * transferEvent
   * @param abiName
   */
  private static transferEvent(abiName: string) {
    return connex.thor
      .account(addrVotingContract)
      .event(utils.getABI(abiVotingContract, abiName, 'event'))
  }

  private static async getReceipt(txid: string): Promise<Connex.Thor.Receipt | undefined> {
    try {
      const transaction = connex.thor.transaction(txid)
      if (!transaction) { return undefined }
      return new Promise((resolve, reject) => {
        let receipt: Connex.Thor.Receipt | null
        let flag = 0
        const timerId = setInterval(async () => {
          if (!receipt) {
            flag += 1

            receipt = await transaction.getReceipt()

            if (receipt) {
              clearInterval(timerId)
              resolve(receipt)
            }
            if (flag > 5) {
              clearInterval(timerId)
              // eslint-disable-next-line prefer-promise-reject-errors
              reject('Transaction Reverted')
            }
          }
        }, 1000 * 10)
      })
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  private static async signingService<T>(
    abiName: string, signer: string, data: Array<T>,
  ): Promise<string | undefined> {
    try {
      const method = this.transferMethod(abiName)

      if (!method) { return undefined }

      const asClause = method.asClause(...data)

      if (!asClause) { return undefined }

      const service = connex.vendor.sign('tx', [{ ...asClause }])

      if (!service) { return undefined }

      service.signer(signer).gas(0).delegate('https://omg.outofgas.io:28050/sign?authorization=275ad8b3-20e5-4041-bced-98532423ed0d')

      const response = await service.request()

      if (!response || !('txid' in response)) { return undefined }

      return Promise.resolve(response.txid)
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async login() {
    try {
      if ('thor' in connex) {
        const account = connex.thor.account(ConnexService.contractAddress)
        if (!account) { return undefined }

        const code = await account.getCode()

        if (!code || !('code' in code)) { return undefined }

        if (code.code === '0x') {
          throw Error('You have selected an incompatible environment. Please change your node to proceed.')
        }

        const response = await connex.vendor.sign('cert', {
          purpose: 'identification',
          payload: {
            type: 'text',
            content: 'Wallet Authorization',
          },
        }).request()

        if (!response || !('annex' in response)) {
          return undefined
        }

        return Promise.resolve(response.annex.signer)
      }
      return undefined
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async newProposal(signer: string, data: Array<string | number>) {
    try {
      const txID = await this.signingService<string | number>('newBinaryVote', signer, data)

      if (!txID) { return undefined }

      const receipt = await this.getReceipt(txID)

      if (receipt?.reverted) {
        throw Error('Transaction Reverted')
      }

      return Promise.resolve({
        signer,
        txID,
        voteID: receipt?.outputs[0].events[0].topics[1],
      })
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async setAuthPubKey(signer: string, data: string[]) {
    try {
      const txID = await this.signingService<string>('setAuthPubKey', signer, data)

      if (!txID) { return undefined }

      const receipt = await this.getReceipt(txID)

      if (receipt?.reverted) {
        throw Error('Transaction Reverted')
      }

      return Promise.resolve({
        signer,
        txID,
      })
    } catch (err) {
      return Promise.reject(err)
    }
  }

  public static async checkVoteIDexist(voteID: string) {
    try {
      const response = await this.transferMethod('voteAuth').call(voteID)

      if (!response) { return undefined }

      if ('data' in response && parseInt(`${response.data}`, 16) === 0) {
        throw Error('VoteID does not exist')
      }

      if (response.decoded?.revertReason) {
        throw Error(`${response.decoded?.revertReason}`)
      }

      return Promise.resolve(`0x${response.data.slice(66 - 40, 66)}`)
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async proposalStatus(voteID: string) {
    try {
      const response = await this.transferMethod('getState').call(voteID)

      if (!response || !('data' in response)) { return undefined }

      return Promise.resolve(parseInt(`${response.data}`, 16))
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async getAuthPubKey(id: string) {
    try {
      const response = await this.transferMethod('getAuthPubKey').call(id)

      if (!response || !('data' in response) || response.data === '0x') { return undefined }

      return Promise.resolve(response.data)
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async getVoteDetail({
    id,
    fromAddress,
    from = 0,
    limit = 256,
  }: {
    id?: string;
    fromAddress?: string;
    from?: number;
    limit?: number;
  }) {
    try {
      const response = await this.transferEvent('NewBinaryVote')
        .filter([{ id, fromAddress }])
        .order('desc')
        .apply(from, limit)

      if (!response || !response.length) { return undefined }

      return Promise.resolve(response.map((item) => item.decoded?.id))
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async getBallot(id: string, signer: string) {
    try {
      const response = await this.transferMethod('getBallot').call(id, signer)
      if (!response || response.data === '0x' || response.reverted) {
        return undefined
      }

      return Promise.resolve(response)
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async cast(signer: string, data: Array<string | string[]>) {
    try {
      const txID = await this.signingService<string | string[]>('cast', signer, data)

      if (!txID) { return undefined }

      const receipt = await this.getReceipt(txID)

      if (receipt?.reverted) {
        throw Error('Transaction Reverted')
      }

      return Promise.resolve({
        signer,
        txID,
      })
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async getCastBinaryBallot({
    id,
    fromAddress,
    from = 0,
    limit = 256,
  }: {
    id?: string;
    fromAddress?: string;
    from?: number;
    limit?: number;
  }) {
    try {
      const response = await this.transferEvent('CastBinaryBallot')
        .filter([{ id, fromAddress }])
        .order('desc')
        .apply(from, limit)

      if (!response || !response.length) { return undefined }
      return Promise.resolve(response.map((item) => ({
        txID: item.meta?.txID,
        signer: item.meta?.txOrigin,
        hash: item.decoded?.ballotHash,
      })))
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async verifyBallot(id: string, signer: string) {
    try {
      const response = await this.transferMethod('verifyBallot').call(id, signer)

      if (!response || response.data === '0x' || response.reverted) {
        return undefined
      }

      return Promise.resolve(response)
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async castEndTime(voteID: string) {
    try {
      const response = await this.transferMethod('castEndTime').call(voteID)
      if (!response || response.data === '0x' || response.reverted || !response.decoded) {
        return undefined
      }

      return Promise.resolve(response.decoded[0])
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async getNumVoter(voteID: string) {
    try {
      const response = await this.transferMethod('getNumVoter').call(voteID)
      if (!response || response.data === '0x' || response.reverted || !response.decoded) {
        return undefined
      }

      return Promise.resolve(response.decoded[0])
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async getVoter(voteID: string, index: number) {
    try {
      const response = await this.transferMethod('getVoter').call(voteID, index)
      if (!response || response.data === '0x') {
        return undefined
      }

      return Promise.resolve(`0x${response.data.slice(66 - 40, 66)}`)
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async getTallyRes(voteId: string) {
    try {
      const response = await this.transferMethod('getTallyRes').call(voteId)
      if (!response || response.data === '0x') {
        return undefined
      }

      return Promise.resolve(response.decoded)
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async verifyTallyRes(voteId: string) {
    try {
      const response = await this.transferMethod('verifyTallyRes').call(voteId)
      if (!response || response.data === '0x') {
        return undefined
      }
      return Promise.resolve(response.data)
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async Tally(signer: string, data: Array<string | string[] | number>) {
    try {
      const setTallyResMethod = this.transferMethod('setTallyRes')
      const endTallyMethod = this.transferMethod('endTally')

      if (!setTallyResMethod || !endTallyMethod) { return undefined }

      const setTallyResAsClause = setTallyResMethod.asClause(...data)
      const endTallyAsClause = endTallyMethod.asClause(data[0])

      if (!setTallyResAsClause || !endTallyAsClause) { return undefined }

      const service = connex.vendor.sign('tx', [{ ...setTallyResAsClause }, { ...endTallyAsClause }])

      if (!service) { return undefined }

      service.signer(signer).gas(0).delegate('https://omg.outofgas.io:28050/sign?authorization=275ad8b3-20e5-4041-bced-98532423ed0d')

      const response = await service.request()

      if (!response || !('txid' in response)) { return undefined }

      const receipt = await this.getReceipt(response.txid)

      if (receipt?.reverted) {
        throw Error('Transaction Reverted')
      }

      return Promise.resolve({
        signer,
        txID: response.txid,
        voteID: receipt?.outputs[0].events[0].topics[1],
      })
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }

  public static async setTallyResEvent(voteID: string) {
    try {
      const response = await this.transferEvent('SetTallyRes')
        .filter([{ voteID }])
        .order('desc')
        .apply(0, 1)
      return Promise.resolve(response[0].meta?.txID)
    } catch (err) {
      return Promise.reject(err.message || err)
    }
  }
}
