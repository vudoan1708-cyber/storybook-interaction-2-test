import { APICallRecord } from './index';

declare global {
  interface Window {
    __apiCallRecord?: APICallRecord = {};
  }
};
