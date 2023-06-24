import {
  sourceCode,
  sampleContractAbi,
  sampleContractBytecode2,
  contractFileWithPath,
  sampleContractBytecode3,
  contractFile2WithPath,
} from './smart_contracts/sample-contract';

import { ExtendedContract } from '../src';
import { Web3BaseProvider } from 'web3';

export async function testSuccessfulCompilation(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType(sourceCode);
  expect(contract.hadFinishedCompilation).toBe(false);
  const compilationResult = await contract.compilationResult;
  expect(contract.hadFinishedCompilation).toBe(true);

  expect(compilationResult).toMatchObject({
    abi: sampleContractAbi,
    bytecodeString: sampleContractBytecode2,
  });

  expect(contract.options.jsonInterface).toMatchObject(sampleContractAbi);
  expect(contract.options.input).toEqual(sampleContractBytecode2);
}
export async function testSuccessfulCompilationFromCodeOptions(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType({
    sourceCode,
    contractName: 'MyContract',
  });
  expect(contract.hadFinishedCompilation).toBe(false);
  const compilationResult = await contract.compilationResult;
  expect(contract.hadFinishedCompilation).toBe(true);

  expect(compilationResult).toMatchObject({
    abi: sampleContractAbi,
    bytecodeString: sampleContractBytecode2,
  });

  expect(contract.options.jsonInterface).toMatchObject(sampleContractAbi);
  expect(contract.options.input).toEqual(sampleContractBytecode2);
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
    bytecodeString: sampleContractBytecode3,
  });

  expect(contract.options.jsonInterface).toMatchObject(sampleContractAbi);
  expect(contract.options.input).toEqual(sampleContractBytecode3);
}

export async function testSuccessfulCompilationFromFileOptions(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType({
    path: contractFileWithPath,
    contractName: 'MyContract',
  });
  expect(contract.hadFinishedCompilation).toBe(false);
  const compilationResult = await contract.compilationResult;
  expect(contract.hadFinishedCompilation).toBe(true);

  expect(compilationResult).toMatchObject({
    abi: sampleContractAbi,
    bytecodeString: sampleContractBytecode3,
  });

  expect(contract.options.jsonInterface).toMatchObject(sampleContractAbi);
  expect(contract.options.input).toEqual(sampleContractBytecode3);
}

export async function testSuccessfulCompilationFromMultiFileWithOptions(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType({
    path: [contractFileWithPath, contractFile2WithPath],
    contractName: 'MyContract',
  });
  expect(contract.hadFinishedCompilation).toBe(false);
  const compilationResult = await contract.compilationResult;
  expect(contract.hadFinishedCompilation).toBe(true);

  expect(compilationResult).toMatchObject({
    abi: sampleContractAbi,
    bytecodeString: sampleContractBytecode3,
  });

  expect(contract.options.jsonInterface).toMatchObject(sampleContractAbi);
  expect(contract.options.input).toEqual(sampleContractBytecode3);
}

export function testCompilationCauseError(
  ExtendedContractType: typeof ExtendedContract
) {
  const contract = new ExtendedContractType(sourceCode + ' invalid code');

  const compilationResult = contract.compilationResult;
  expect(compilationResult).rejects.toThrow('Failed parsing imports');
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
