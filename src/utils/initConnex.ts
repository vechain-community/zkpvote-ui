import Connex from '@vechain/connex'

let connex: Connex | null = null
if (!connex) {
  connex = new Connex({
    node: 'https://testnet.outofgas.io/',
    network: 'test',
  })
}
export default function getConnex(): Connex {
  return connex!
}
