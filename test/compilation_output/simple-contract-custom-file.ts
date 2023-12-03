// This file has been generated by:
//	"web3-plugin-craftsman" (https://github.com/conx3/web3-plugin-craftsman)

/* eslint-disable */

export const SimpleContractAbi = [
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_myNumber',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
    signature: ''
  },
  {
    inputs: [],
    name: 'myNumber',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function',
    signature: '0x23fd0e40',
    constant: true,
    payable: false
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_myNumber',
        type: 'uint256'
      }
    ],
    name: 'setMyNumber',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
    signature: '0x6ffd773c',
    constant: false,
    payable: false
  }
] as const;

export const SimpleContractBytecode = '608060405234801561000f575f80fd5b506040516101d23803806101d283398181016040528101906100319190610074565b805f819055505061009f565b5f80fd5b5f819050919050565b61005381610041565b811461005d575f80fd5b50565b5f8151905061006e8161004a565b92915050565b5f602082840312156100895761008861003d565b5b5f61009684828501610060565b91505092915050565b610126806100ac5f395ff3fe6080604052348015600e575f80fd5b50600436106030575f3560e01c806323fd0e401460345780636ffd773c14604e575b5f80fd5b603a6066565b60405160459190608a565b60405180910390f35b606460048036038101906060919060ca565b606b565b005b5f5481565b805f8190555050565b5f819050919050565b6084816074565b82525050565b5f602082019050609b5f830184607d565b92915050565b5f80fd5b60ac816074565b811460b5575f80fd5b50565b5f8135905060c48160a5565b92915050565b5f6020828403121560dc5760db60a1565b5b5f60e78482850160b8565b9150509291505056fea2646970667358221220b3fa91c5ebf0008f678f3318967f2eb36ff7e2247c1361dc5e83ae35435c48ec64736f6c63430008160033';
