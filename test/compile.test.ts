import './polyfills';

// eslint-disable-next-line import/first
import { SolidityCompiler } from '../src';

import {
  fileName,
  sourceCode,
  contractName,
  sampleContractAbi,
  sampleContractBytecode0,
  sampleContractBytecode1,
  contractFileWithPath,
} from './smart_contracts/contracts-constants';

describe('compile', () => {
  beforeAll(() => {});

  it('compile source code', async () => {
    const res = await SolidityCompiler.compileSourceString(
      fileName,
      sourceCode
    );

    expect(res[fileName][contractName].bytecodeString).toBe(
      sampleContractBytecode0
    );
    expect(res[fileName][contractName].abi).toEqual(sampleContractAbi);
    expect(res[fileName][contractName]).toEqual(res[contractName]);
  });

  it('compile file', async () => {
    const fileWithPath = contractFileWithPath;
    const res = await SolidityCompiler.compileSol(fileWithPath);

    expect(res[fileWithPath][contractName].bytecodeString).toBe(
      sampleContractBytecode1
    );
    expect(res[fileWithPath][contractName].abi).toEqual(sampleContractAbi);
    expect(res[fileWithPath][contractName]).toEqual(res[contractName]);
  });
});
