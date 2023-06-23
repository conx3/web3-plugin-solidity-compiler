import { TextEncoder } from 'util';

import crypto from 'crypto';

global.TextEncoder = TextEncoder;

if (typeof global.crypto !== 'object') {
  global.crypto = crypto.webcrypto as any;
}
