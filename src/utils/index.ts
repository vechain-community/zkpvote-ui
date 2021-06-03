import CustomProtocolDetection from 'custom-protocol-detection';
import getConnex from './initConnex'
import { Topic } from '../interface/index.d';

export { default as backgroundAnimation } from './backgroundAnimation';

const connex = getConnex()

export const checkProtocolDetection = () => {
  const redirectUrl = `https://env.vechain.org/r/#/test/${encodeURIComponent(window.location.href)}`;
  const targetUrl = `vechain-app://${encodeURIComponent('test')}/${encodeURIComponent(window.location.href)}`;

  CustomProtocolDetection(`${targetUrl}`,
    () => {
      window.location.href = redirectUrl;
    },
    () => {
      setTimeout(() => {
        const frame = document.querySelector('#hiddenIframe') as HTMLIFrameElement;
        const contentDocument = frame && frame.contentDocument;
        if (frame === null || contentDocument !== null) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = redirectUrl;
        }
      }, 1000);
    });
};

export const delay = (time: number) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, time);
});

export const checkAuthorized = () => sessionStorage.getItem('signer');

export const checkIsConnex = () => true;

export const isOnLine = () => window.navigator.onLine;

export const sleep = () => new Promise((resolve) => {
  let timeId: ReturnType<typeof setTimeout> | null = null;

  const getConnexStatus = () => {
    const { progress } = connex.thor.status;
    if (progress === 1) {
      if (timeId) {
        clearTimeout(timeId);
        timeId = null;
      }
      resolve(true);
    } else {
      if (timeId) {
        clearTimeout(timeId);
        timeId = null;
      }
      timeId = setTimeout(() => {
        getConnexStatus();
      }, 100);
    }
  };
  getConnexStatus();
});

export const isTestNet = (): boolean => {
  const parentId = '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127';
  const block = connex.thor.genesis;
  return block.id === parentId;
};

export const ellipsis = (address: string) => `${address.slice(0, 8)}...`;

export const Uint8Array2json = (fileData: number[]): Promise<Topic> => new Promise((resolve) => {
  const buf = new Uint8Array(fileData);
  const reader = new FileReader();
  reader.readAsText(new Blob([buf]), 'utf-8');
  reader.onload = () => {
    resolve(JSON.parse(reader.result as string));
  };
});

export const statusMap = [
  {
    type: 'warning',
    label: 'Pending',
  },
  {
    type: 'default',
    label: 'Voting',
  },
  {
    type: 'error',
    label: 'To be tallied',
  },
  {
    type: 'ended',
    label: 'Ended',
  },
];

export default {};
