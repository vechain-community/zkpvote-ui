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
- **Client**: Sync. Visit [env](https://env.vechain.org/#sync) , download and install Sync.
- **Environment**: VeChainThor Blockchain Testnet
- **Claim Token**: Claim Testnet VTHO on [Faucet](https://faucet.vecha.in) to cover the transaction fee.

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

### Deploy IPFS Server

You can refer to [this link](https://github.com/ipfs/go-ipfs#running-ipfs-inside-docker) to deploy your own IPFS server.

### Create configuration file(`.env`)

create `.env` file from `env.example`:

```
cp env.example .env
```

Configure `.env`:

```
# Contract address
CONTRACT_ADDRESS=0xb857ec3641ef2a7b9fc2ab4fbe3e65386df17253

# Host of your IPFS server, example: 127.0.0.1
IPFS_HOST=

# Port of your IPFS server, example:5001
IPFS_PORT=

# Protocol of your IPFS server(http/https), example: http
IPFS_PROTOCOL=
```

### Build & Run

We recommend using docker to deploy this project, you can refer to the following links to install `docker` and `docker-compose`:

- [Install Docker Engine | Docker Documentation](https://docs.docker.com/engine/install/)
- [Install Docker Compose | Docker Documentation](https://docs.docker.com/compose/install/)

Build docker image:

```
docker-compose build
docker-compose up -d
```

Now, you can access your service at: `http://localhost:3000` .
