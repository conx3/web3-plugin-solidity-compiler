import fs from 'fs';
import path from 'path';

import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;

// eslint-disable-next-line import/first
import { Web3 } from 'web3';
// eslint-disable-next-line import/first
import { SolidityCompiler } from '../src';

const fileName = 'sample.sol';
const contractName = 'MyContract';

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
const bytecodeString =
  '608060405234801561000f575f80fd5b506040516101d23803806101d283398181016040528101906100319190610074565b805f819055505061009f565b5f80fd5b5f819050919050565b61005381610041565b811461005d575f80fd5b50565b5f8151905061006e8161004a565b92915050565b5f602082840312156100895761008861003d565b5b5f61009684828501610060565b91505092915050565b610126806100ac5f395ff3fe6080604052348015600e575f80fd5b50600436106030575f3560e01c806323fd0e401460345780636ffd773c14604e575b5f80fd5b603a6066565b60405160459190608a565b60405180910390f35b606460048036038101906060919060ca565b606b565b005b5f5481565b805f8190555050565b5f819050919050565b6084816074565b82525050565b5f602082019050609b5f830184607d565b92915050565b5f80fd5b60ac816074565b811460b5575f80fd5b50565b5f8135905060c48160a5565b92915050565b5f6020828403121560dc5760db60a1565b5b5f60e78482850160b8565b9150509291505056fea2646970667358221220aa2a5a7b3dc51b8337b674baff3f766863b1c418bed25d0a8f22c20c6c3c819b64736f6c63430008140033';

// output by compileSol:
// 608060405234801561000f575f80fd5b506040516101d23803806101d283398181016040528101906100319190610074565b805f819055505061009f565b5f80fd5b5f819050919050565b61005381610041565b811461005d575f80fd5b50565b5f8151905061006e8161004a565b92915050565b5f602082840312156100895761008861003d565b5b5f61009684828501610060565b91505092915050565b610126806100ac5f395ff3fe6080604052348015600e575f80fd5b50600436106030575f3560e01c806323fd0e401460345780636ffd773c14604e575b5f80fd5b603a6066565b60405160459190608a565b60405180910390f35b606460048036038101906060919060ca565b606b565b005b5f5481565b805f8190555050565b5f819050919050565b6084816074565b82525050565b5f602082019050609b5f830184607d565b92915050565b5f80fd5b60ac816074565b811460b5575f80fd5b50565b5f8135905060c48160a5565b92915050565b5f6020828403121560dc5760db60a1565b5b5f60e78482850160b8565b9150509291505056fea264697066735822122051a32c7f5cda38532a6242bd4a35a7ca4ad652b6d685e1b2413ef3e2c34dce6b64736f6c63430008140033

describe('compile', () => {
  let web3: Web3;
  beforeAll(() => {
    web3 = new Web3();
    web3.registerPlugin(new SolidityCompiler());
  });

  it('compile source code', async () => {
    // Read the Solidity source code from the file system
    const contractPath = path.join(__dirname, fileName);
    const sourceCode = fs.readFileSync(contractPath, 'utf8');

    const res = await web3.solidityCompiler.compileSourceString(
      fileName,
      sourceCode
    );

    expect(res[fileName][contractName].bytecodeString).toBe(bytecodeString);
    expect(res[fileName][contractName].abi).toEqual(abi);
    expect(res[fileName][contractName]).toEqual(res[contractName]);
  });

  it('compile file', async () => {
    const fileWithPath = './test/' + fileName;
    const res = await web3.solidityCompiler.compileSol(fileWithPath);

    // expect(res[fileWithPath][contractName].bytecodeString).toBe(bytecodeString);
    expect(res[fileWithPath][contractName].abi).toEqual(abi);
    expect(res[fileWithPath][contractName]).toEqual(res[contractName]);
  });
});
