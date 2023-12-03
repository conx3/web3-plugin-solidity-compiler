import { TextEncoder, TextDecoder } from 'util';

import crypto from 'crypto';

Object.assign(global, { TextDecoder, TextEncoder });

if (typeof global.crypto !== 'object') {
  global.crypto = crypto.webcrypto as any;
}
