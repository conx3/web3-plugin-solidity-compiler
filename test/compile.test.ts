import fs from 'fs';
import path from 'path';
import { Web3 } from 'web3';

import { SourceOrFile, SolidityCompiler } from '../src';

import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;

const fileName = 'sample.sol';

describe('compile', () => {
  let web3: Web3;
  beforeAll(() => {
    web3 = new Web3();
    web3.registerPlugin(new SolidityCompiler());
  });

  it.skip('compile source code', async () => {
    // Read the Solidity source code from the file system
    const contractPath = path.join(__dirname, fileName);
    const sourceCode = fs.readFileSync(contractPath, 'utf8');

    const res = await web3.solidityCompiler.compile(
      fileName,
      sourceCode,
      SourceOrFile.SOURCE
    );
    console.log(res);
  });

  it.skip('compile file', async () => {
    const res = await web3.solidityCompiler.compile(
      fileName,
      './test',
      SourceOrFile.PATH
    );
    console.log(res);
  });
});
