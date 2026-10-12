import type { TierlistState } from './tier';

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (code: string): Uint8Array => {
  const normalized = code.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

export const encodeShareCode = (state: TierlistState): string => {
  const json = JSON.stringify(state);
  return toBase64Url(new TextEncoder().encode(json));
};

export const decodeShareCode = (code: string): TierlistState => {
  const json = new TextDecoder().decode(fromBase64Url(code));
  return JSON.parse(json) as TierlistState;
};
