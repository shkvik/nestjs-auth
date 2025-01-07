import { randomInt } from 'node:crypto';

export const getCryptoCode = (codeSize: number): string => {
  return Array.from({ length: codeSize }, () => randomInt(0, 10)).join('');
};
