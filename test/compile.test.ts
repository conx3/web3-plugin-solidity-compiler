import './polyfills';

// eslint-disable-next-line import/first
import { SolidityCompiler } from '../src';

import {
  fileName,
  sourceCode,
  contractName,
  sampleContractAbi,
  sampleContractBytecode0,
  bytecodeStringBySource1,
} from './smart_contracts/sample-contract';

describe('compile', () => {
  const solidityCompiler = new SolidityCompiler();
  beforeAll(() => {});

  it('compile source code', async () => {
    const res = await solidityCompiler.compileSourceString(
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
    const fileWithPath = './test/smart_contracts/' + fileName;
    const res = await solidityCompiler.compileSol(fileWithPath);

    expect(res[fileWithPath][contractName].bytecodeString).toBe(
      bytecodeStringBySource1
    );
    expect(res[fileWithPath][contractName].abi).toEqual(sampleContractAbi);
    expect(res[fileWithPath][contractName]).toEqual(res[contractName]);
  });
});
