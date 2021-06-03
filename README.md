# ZKPVote

An open source interface for ZKPVote - a serverless voting application in which no one except the voting authority knows the ballot contents.

- Ballot verifiable
  - Voters can verify the existence of their ballots.
  - Anyone can verify the validity of a recorded ballot.
  - Recorded ballots are immutable.
- Tally results universally verifiable
  - Anyone can verify that all and only the valid ballots have been tallied.
  - Anyone can verify the correctness of the tally results.
- Voters are allowed to cast multiple times and the newer ballot will replace the previous one cast by the same voter.

## Demo website

- **Website**: [zkpvote.vechain.org](https://zkpvote.vechain.org/)
- **Client**: Sync2. Visit [VeChain Sync](https://sync.vecha.in/) , download and install Sync.
- **Environment**: VeChainThor Blockchain Testnet
- **Claim Token**: Claim Testnet VET and VTHO on [Faucet](https://faucet.vecha.in) to cover the transaction fee.

## Voting process and features

<img width="" src="screenshots/process.png" alt="Process">

## ZKPVote contract

Please see the [@vechain-community/zkpvote-contracts](https://github.com/vechain-community/zkpvote-contracts) repository. ZKPVote is using contractV2.

## Screenshots

<img width="" src="screenshots/homepage.png" alt="Home page">
<img width="" src="screenshots/proposal.png" alt="Proposal">

## Deployment

### Clone

```bash
git clone https://github.com/vechain-community/zkpvote-ui.git
cd zkpvote-ui/
```

### Build

Run the following command to compile the source code.

#### Install all the dependencies listed
```bash
yarn install
```

#### Compiles and hot-reloads for development
```
yarn serve
```

#### Compiles and minifies for production
```
yarn build
```
Then the `dist` folder will be generated.

### Deploy

You can use any web server (Nginx, Apache, etc) to deploy the project, you just need to put the `dist` folder to the specified location.

Because the project uses a browser history routing scheme, additional configuration is required, You can refer to [this link](https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations).


### Deploy your own IPFS Server

You can refer to [this link](https://github.com/ipfs/go-ipfs#running-ipfs-inside-docker) to deploy your own IPFS server.

#### Modify the configuration file

The configuration file is stored in the `public/config.json`, edit the file to modify the configuration.

