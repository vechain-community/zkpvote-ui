export interface PrintItem {
  tag?: string;
  desc?: string;
  event?: boolean;
}

export interface Topic {
  topic: string;
  choices: string[];
}

export interface VoteItem {
  voteID: string;
  status?: number;
  topic?: string;
  choices?: string[];
}

export interface IpfsFileItem {
  hash: string;
  name: string;
  size: number;
  type: number;
}

export interface IpfsConfig {
  host?: string;
  port?: string | number;
  protocol?: string;
}

export interface Config {
  ipfsConfig: IpfsConfig;
  contractAddress: string;
  endTime: number;
}
