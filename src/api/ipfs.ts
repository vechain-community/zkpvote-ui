import IPFS_API from 'ipfs-api';

import { IpfsConfig } from '@/interface/index.d';

export default ({
  host = 'localhost',
  port = '5001',
  protocol = 'http',
}: IpfsConfig) => IPFS_API({
  host,
  port,
  protocol,
});
