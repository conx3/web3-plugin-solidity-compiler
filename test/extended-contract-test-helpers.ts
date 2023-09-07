import {
  sourceCode,
  sampleContractAbi,
  contractFileWithPath,
  contractFile2WithPath,
  childContractAbi,
} from './smart_contracts/contracts-constants';

import { ExtendedContract } from '../src';
import { Web3BaseProvider } from 'web3';

console.log('process.env.RUNNER_OS', process.env.RUNNER_OS);
console.log('process.env.MATRIX_OS', process.env.MATRIX_OS);
export const itSkipIfWindows =
  process.env.RUNNER_OS !== 'Windows' ||
  process.env.MATRIX_OS !== 'windows-latest'
    ? it
    : it.skip;

export async function testSuccessfulCompilation(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType(sourceCode);
  expect(contract.hadFinishedCompilation).toBe(false);
  const compilationResult = await contract.compilationResult;
  expect(contract.hadFinishedCompilation).toBe(true);

  expect(compilationResult).toMatchObject({
    abi: sampleContractAbi,
    bytecodeString: /0x[0-9a-f]+/i,
  });

  expect(contract.options.jsonInterface).toMatchObject(sampleContractAbi);
  expect(contract.options.input).toMatch(/^[0-9a-f]+$/i);
}
export async function testSuccessfulCompilationFromCodeOptions(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType({
    sourceCode,
    contractName: 'SimpleContract',
  });
  expect(contract.hadFinishedCompilation).toBe(false);
  const compilationResult = await contract.compilationResult;
  expect(contract.hadFinishedCompilation).toBe(true);

  expect(compilationResult).toMatchObject({
    abi: sampleContractAbi,
    bytecodeString: /0x[0-9a-f]+/i,
  });

  expect(contract.options.jsonInterface).toMatchObject(sampleContractAbi);
  expect(contract.options.input).toMatch(/^[0-9a-f]+$/i);
}

export async function testSuccessfulCompilationFromFile(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType(contractFileWithPath);
  expect(contract.hadFinishedCompilation).toBe(false);
  const compilationResult = await contract.compilationResult;
  expect(contract.hadFinishedCompilation).toBe(true);

  expect(compilationResult).toMatchObject({
    abi: sampleContractAbi,
    bytecodeString: /^[0-9a-f]+$/i,
  });

  expect(contract.options.jsonInterface).toMatchObject(sampleContractAbi);
  expect(contract.options.input).toMatch(/^[0-9a-f]+$/i);
}

export async function testSuccessfulCompilationFromFileOptions(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType({
    path: contractFileWithPath,
    contractName: 'SimpleContract',
  });
  expect(contract.hadFinishedCompilation).toBe(false);
  const compilationResult = await contract.compilationResult;
  expect(contract.hadFinishedCompilation).toBe(true);

  expect(compilationResult).toMatchObject({
    abi: sampleContractAbi,
    bytecodeString: /0x[0-9a-f]+/i,
  });

  expect(contract.options.jsonInterface).toMatchObject(sampleContractAbi);
  expect(contract.options.input).toMatch(/^[0-9a-f]+$/i);
}

export async function testSuccessfulCompilationFromMultiFileWithOptions(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType({
    path: [contractFileWithPath, contractFile2WithPath],
    contractName: 'ChildContract',
  });
  expect(contract.hadFinishedCompilation).toBe(false);
  const compilationResult = await contract.compilationResult;
  expect(contract.hadFinishedCompilation).toBe(true);

  expect(compilationResult).toMatchObject({
    abi: childContractAbi,
    bytecodeString: /0x[0-9a-f]+/i,
  });

  expect(contract.options.jsonInterface).toMatchObject(childContractAbi);
  expect(contract.options.input).toMatch(/^[0-9a-f]+$/i);
}

export function testCompilationCauseError(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType(sourceCode + ' invalid code');

  const compilationResult = contract.compilationResult;
  expect(compilationResult).rejects.toThrow('Failed parsing imports');
}

export async function testSaveCompilationResultFromSolidityCode(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType(sourceCode);

  const filePath = '../test/compilation_output/simple-contract-custom-file.ts';

  await contract.saveCompilationResult(filePath);

  const { SimpleContractAbi } = require(filePath);

  expect(SimpleContractAbi).toEqual(contract.options.jsonInterface);
  expect(contract.options.input).toMatch(/^[0-9a-f]+$/i);
}

export async function testSaveCompilationResultFromSolidityFile(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType({
    path: [contractFileWithPath, contractFile2WithPath],
    contractName: 'ChildContract',
  });

  await contract.saveCompilationResult('../test/compilation_output');

  const {
    ChildContractAbi,
  } = require('../test/compilation_output/ChildContract-artifacts.ts');

  expect(ChildContractAbi).toEqual(contract.options.jsonInterface);
  expect(contract.options.input).toMatch(/^[0-9a-f]+$/i);
}

export async function testDeploymentAndCalls(
  ExtendedContractType: typeof ExtendedContract,
  fromAccount: string,
  provider?: Web3BaseProvider
) {
  const contract = new ExtendedContractType(sourceCode);
  await contract.compilationResult;

  if (provider) {
    contract.provider = provider;
  }
  const contractDeployed = await contract
    .deploy({
      // @ts-expect-error
      arguments: [1000],
    })
    .send({
      from: fromAccount,
      gas: '1000000',
      // other transaction's params
    });

  console.log('contractDeployed', contractDeployed.options.address);

  const myNumber = await contractDeployed.methods.myNumber().call();
  expect(myNumber).toBe(1000n);

  await (contractDeployed.methods.setMyNumber as any)(100).send({
    from: fromAccount,
  });
  const myNumberModified = await contractDeployed.methods.myNumber().call();
  expect(myNumberModified).toBe(100n);
}
