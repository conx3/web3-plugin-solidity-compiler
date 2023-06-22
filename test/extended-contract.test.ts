import fs from 'fs';
import path from 'path';

import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;

import { ExtendedContract } from '../src/extended-contract';
import Web3 from 'web3';

const fileName = 'sample.sol';

const bytecodeStringBySource =
  '608060405234801561000f575f80fd5b506040516101d23803806101d283398181016040528101906100319190610074565b805f819055505061009f565b5f80fd5b5f819050919050565b61005381610041565b811461005d575f80fd5b50565b5f8151905061006e8161004a565b92915050565b5f602082840312156100895761008861003d565b5b5f61009684828501610060565b91505092915050565b610126806100ac5f395ff3fe6080604052348015600e575f80fd5b50600436106030575f3560e01c806323fd0e401460345780636ffd773c14604e575b5f80fd5b603a6066565b60405160459190608a565b60405180910390f35b606460048036038101906060919060ca565b606b565b005b5f5481565b805f8190555050565b5f819050919050565b6084816074565b82525050565b5f602082019050609b5f830184607d565b92915050565b5f80fd5b60ac816074565b811460b5575f80fd5b50565b5f8135905060c48160a5565b92915050565b5f6020828403121560dc5760db60a1565b5b5f60e78482850160b8565b9150509291505056fea2646970667358221220157d481b6fa041752b9792053b2967d4a3b16bc8ff915677923ebec19d515cbb64736f6c63430008140033';

const abi = [
  {
    inputs: [{ internalType: 'uint256', name: '_myNumber', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'myNumber',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_myNumber', type: 'uint256' }],
    name: 'setMyNumber',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

// Read the Solidity source code from the file system
const contractPath = path.join(__dirname, fileName);
const sourceCode = fs.readFileSync(contractPath, 'utf8');

describe('ExtendedContract', () => {
  let web3: Web3;
  beforeAll(() => {
    web3 = new Web3('http://localhost:8545');
  });

  it('compile source code', async () => {
    const contract = new ExtendedContract(sourceCode);
    expect(contract.hadFinishedCompilation).toBe(false);
    const compilationResult = await contract.compilationResult;
    expect(contract.hadFinishedCompilation).toBe(true);

    expect(compilationResult).toMatchObject({
      abi,
      bytecodeString: bytecodeStringBySource,
    });

    expect(contract.options.jsonInterface).toMatchObject(abi);
    expect(contract.options.input).toEqual(bytecodeStringBySource);
  });

  // This test case can be unskipped if there is a node running
  it.skip('deploy contract', async () => {
    const contract = new ExtendedContract(sourceCode);
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
    expect(myNumber).toBe(1000n);

    await (contractDeployed.methods.setMyNumber as any)(100).send({
      from: accounts[0],
    });
    const myNumberModifled = await contractDeployed.methods.myNumber().call();
    expect(myNumberModifled).toBe(100n);
  });

  it('raise error while compiling an invalid code', async () => {
    const contract = new ExtendedContract(sourceCode + ' invalid code');

    const compilationResult = contract.compilationResult;
    expect(compilationResult).rejects.toThrow('Failed parsing imports');
  });
});
