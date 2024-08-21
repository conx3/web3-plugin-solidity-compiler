import './polyfills';

// eslint-disable-next-line import/first
import { SolidityCompiler } from '../src';

import {
  fileName,
  sourceCode,
  contractName,
  sampleContractAbi,
  contractFileWithPath,
  contractFolder,
} from './smart_contracts/contracts-constants';

describe('compile', () => {
  beforeAll(() => {});

  it('compile source code', async () => {
    const res = await SolidityCompiler.compileSourceString(
      fileName,
      sourceCode
    );

    expect(res[fileName][contractName].bytecodeString).toMatch(/^[0-9a-f]+$/i);
    expect(res[fileName][contractName].abi).toEqual(sampleContractAbi);
    expect(res[fileName][contractName]).toEqual(res[contractName]);
  });

  it('compile file', async () => {
    const fileWithPath = contractFileWithPath;
    const res = await SolidityCompiler.compileSol(fileWithPath);

    expect(res[fileWithPath][contractName].bytecodeString).toMatch(
      /^[0-9a-f]+$/i
    );
    expect(res[fileWithPath][contractName].abi).toEqual(sampleContractAbi);
    expect(res[fileWithPath][contractName]).toEqual(res[contractName]);
  });

  it('compile folder', async () => {
    const folderWithPath = contractFolder;
    const res = await SolidityCompiler.compileAndSaveFromFolder(folderWithPath);

    //console.log('Compile Result:', res); 

    expect(res[folderWithPath][contractName].bytecodeString).toMatch(
      /^[0-9a-f]+$/i
    );
    expect(res[folderWithPath][contractName].abi).toEqual(sampleContractAbi);
    expect(res[folderWithPath][contractName]).toEqual(res[contractName]);
});
});
