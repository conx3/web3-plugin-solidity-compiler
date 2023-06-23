import './polyfills';

import { Web3 } from 'web3';

import { ExtendedWeb3 } from '../src/extended-web3';

import {
  sourceCode,
  sampleContractAbi,
  sampleContractBytecode2,
} from './smart_contracts/sample-contract';

describe('ExtendedWeb3 as plugin', () => {
  let web3: Web3;
  beforeAll(() => {
    web3 = new Web3('http://localhost:8545');
    web3.registerPlugin(new ExtendedWeb3());
  });

  it('compile source code', async () => {
    const contract = new web3.extendedWeb3.ExtendedContract(sourceCode);
    expect(contract.hadFinishedCompilation).toBe(false);
    const compilationResult = await contract.compilationResult;
    expect(contract.hadFinishedCompilation).toBe(true);

    expect(compilationResult).toMatchObject({
      abi: sampleContractAbi,
      bytecodeString: sampleContractBytecode2,
    });

    expect(contract.options.jsonInterface).toMatchObject(sampleContractAbi);
    expect(contract.options.input).toEqual(sampleContractBytecode2);
  });

  // This test case can be unskipped if there is a node running
  it.skip('deploy contract', async () => {
    const contract = new web3.extendedWeb3.ExtendedContract(sourceCode);
    await contract.compilationResult;

    const accounts = await web3.eth.getAccounts();
    const contractDeployed = await contract
      .deploy({
        // @ts-expect-error
        arguments: [1000],
      })
      .send({
        from: accounts[0],
        gas: '1000000',
        // other transaction's params
      });

    console.log('contractDeployed', contractDeployed.options.address);

    const myNumber = await contractDeployed.methods.myNumber().call();
    expect(myNumber).toBe(1000);

    await (contractDeployed.methods.setMyNumber as any)(100).send({
      from: accounts[0],
    });
    const myNumberModifled = await contractDeployed.methods.myNumber().call();
    expect(myNumberModifled).toBe(100);
  });

  it('raise error while compiling an invalid code', async () => {
    const contract = new web3.extendedWeb3.ExtendedContract(
      sourceCode + ' invalid code'
    );

    const compilationResult = contract.compilationResult;
    expect(compilationResult).rejects.toThrow('Failed parsing imports');
  });
});
