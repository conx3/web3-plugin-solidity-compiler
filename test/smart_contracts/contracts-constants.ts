import fs from 'fs';
import path from 'path';

export const fileName = 'simple-contract.sol';
export const contractFileWithPath =
  './test/smart_contracts/simple-contract.sol';
export const contractName = 'SimpleContract';

export const contractFile2WithPath =
  './test/smart_contracts/child-contract.sol';

// Read the Solidity source code from the file system
const contractPath = path.join(__dirname, fileName);
export const sourceCode = fs.readFileSync(contractPath, 'utf8');

export const sampleContractAbi = [
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
] as const;

export const childContractAbi = [
  {
    inputs: [{ internalType: 'string', name: '_myText', type: 'string' }],
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
    inputs: [],
    name: 'myText',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
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
  {
    inputs: [{ internalType: 'string', name: '_myText', type: 'string' }],
    name: 'setMyText',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

