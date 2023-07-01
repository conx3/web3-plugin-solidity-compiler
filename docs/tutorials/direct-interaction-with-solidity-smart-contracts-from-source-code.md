# Tutorial: Interacting with Ethereum Smart Contracts, Directly from Solidity Source Code

TLDR: This is a tutorial for getting started with a `web3.js` plugin called `web3-plugin-craftsman` which compiles a smart contract and generates its ABI and bytecode and enables the developer to use them smoothly or save them for later use.

## Introduction

In the world of blockchain development, the direct interaction with Solidity smart contracts from source code often presents a daunting task for beginners and even some experienced developers. The `web3-plugin-craftsman` package aims to simplify this process using its `ExtendedContract` class, so that you can focus more on the development side. By the end of this tutorial, we would have walked through the creation, compilation, deployment, and interaction with a simple Solidity smart contract directly from a Solidity source code. Get ready to enhance your smart contract development experience!

> **_Note:_** 📝
> The `web3-plugin-craftsman` package is a plugin for web3.js version 4. And it allows instantiating contracts directly from Solidity source code or a solidity file. So, instead of requiring the Bytecode from compiling the smart contract somewhere, you can pass the source code, or the file path, to `ExtendedContract` and then use it as you would use a normal web3.js contract object. And you can also write the generated contract's ABI and Bytecode to a TypeScript, or a JavaScript, file that is compatible and easily readable by a normal `web3.js` `Contract`.

## Prerequisites

Before we begin, please make sure you have:

1. A basic understanding of JavaScript and Solidity.
2. Node.js installed on your personal computer. Node.js can be downloaded from the [official Node.js website](https://nodejs.org/en/download/).
3. A package manager for Node like [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) or [yarn](https://classic.yarnpkg.com/lang/en/docs/getting-started/)
4. A local Ethereum development node working on your system. This will act as our local blockchain. If you do not have one already, you may download and use Ganache from http://truffleframework.com/ganache

## Section 1: Setting Up

### Setting Up a JavaScript Project

Let's set up our JavaScript project. Follow the steps below:

1. Start by creating a new directory for your project and navigate into it:

   ```bash
   mkdir my-ethereum-project && cd my-ethereum-project
   ```

2. Initiate a new Node.js project:

   ```bash
   npm init -y
   ```

   This will create a `package.json` file in our project directory.

3. Create an `index.js` file in your project's root directory:

   ```bash
   touch index.js
   ```

4. In your `package.json` file, set your project `type` to `module`, and add the `start` script:

   ```json
   "type": "module",
   "scripts": {
       "start": "node index.js"
    },
   ```

5. Install `web3.js` and `web3-plugin-craftsman` to interact with Ethereum:

   ```bash
   npm install web3 web3-plugin-craftsman
   ```

    Or if you are using yarn:

   ```bash
   yarn add web3 web3-plugin-craftsman
   ```

With these steps, you have successfully prepared a JavaScript Node.js project. The directory structure of your project should look as follows:

```
my-ethereum-project
 ┣ node_modules
 ┣ index.js
 ┣ package.json
 ┗ package-lock.json
```

You're now ready to write your first Ethereum contract using Solidity and JavaScript!

### Initialize `web3` object and register the `web3-plugin-craftsman` plugin

In this section, we will initialize our `web3` object and make it ready. Write the following into your `index.js` file:

```javascript
import { ExtendedWeb3 } from 'web3-plugin-craftsman';
import { Web3 } from 'web3';

// Initialize a new Web3 object
const web3 = new Web3('http://localhost:7545'); // This should be the path to your local Ethereum RPC URL

// Creating and Register the ExtendedWeb3 plugin
web3.registerPlugin(new ExtendedWeb3());
```

On executing the above commands, we first create an instance of the `Web3` object that can connect to our local Ethereum development node. And then we register a new instance of `ExtendedWeb3` as a plugin to the created `web3` instance.

## Section 2: Creating Your First Solidity Smart Contract

Alright, our workspace is set up and ready. Now, let's get our hands dirty by coding a simple `HelloWorld` smart contract in Solidity.

Below is the Solidity code:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message;

    constructor(string memory initMessage) {
        message = initMessage;
    }

    function updateMessage(string memory newMessage) public {
        message = newMessage;
    }
}
```

In this contract, we have a public `string` variable `message` that we initialize at the contract deployment using `constructor`. We also have a function `updateMessage` to change the message afterwards.

Go ahead and save this code into a file called `HelloWorld.sol`. After saving the file, our `web3-plugin-craftsman` package will use this file to create our smart contract in the next steps.

## Section 3: Creating the Contract Instance Directly from Solidity Code

With our `HelloWorld` Solidity contract ready, let's utilize `web3-plugin-craftsman` to create a JavaScript instance of our contract:

```javascript
// Create an ExtendedContract
const contract = new web3.craftsman.ExtendedContract('/path/to/HelloWorld.sol');
```

Replace `'/path/to/HelloWorld.sol'` with the exact path where you saved your `HelloWorld.sol` file.

This command will create an instance of our `HelloWorld` contract. Our `ExtendedContract` object, `contract`, now represents the `HelloWorld` contract in our Javascript environment. We can interact with it using different methods provided by `web3-plugin-craftsman`.

Congratulations! You've successfully set up your tools and created your first smart contract using `web3-plugin-craftsman`. In the upcoming sections, we'll explore how to interact with this contract and utilize the benefits of `web3-plugin-craftsman`.

## Section 4: Handling Compilation Results

Now that we've created our contract instance, we should handle the compilation result. As the compilation starts to happen instantly after the contract source code is provided in the constructor, we need to wait for the compilation result. Here's how:

```javascript
// Wait for the contract compilation and handle compilation errors, if any
try {
  const compilationResult = await contract.compilationResult;
  console.log('Compilation was successful', JSON.stringify(compilationResult, undefined '  '));
  // the compilationResult will consists of:
  // {
  //     abi: ContractAbi,
  //     bytecodeString: string,
  //     contractName: string,
  // }
} catch (error) {
  console.error('Compilation failed', error);
}
```

In case of a successful compilation, the `compilationResult` will include the bytecode, the application binary interface (ABI), and the contract name given inside the Solidity file. This is available to you as you might need that information later.

Note: If the contract compilation fails (due to any syntax errors or other problems), an error will be thrown with details about the problems which helps debug and fix them.

## Section 5: Deploying the Smart Contract

Having successfully compiled our `HelloWorld` contract, it's now time to deploy it to our local Ethereum network.

Let's begin by setting up the address which will deploy the contract along with the initial parameter - the message.

Replace `<account_address>` with the account address that will be used for deploying the contract and `<initial_message>` with your initialization message.

```javascript
// get the accounts provided by your Ethereum node (like Ganache).
const accounts = await web3.eth.getAccounts();
fromAccount = accounts[0];

// Set up the constructor parameter
const initial_message = '<initial_message>';
const deployParams = { arguments: [initial_message], from: fromAddress };
```

Now, let's deploy:

```javascript
// Deploy the contract
let contractInstance;
try {
  contractInstance = await contract.deploy(deployParams);
  console.log('Deployment was successful');
} catch (error) {
  console.error('Deployment failed', error);
}
```

If the deployment is successful, `contractInstance` is now an instance of `HelloWorld` contract on the blockchain. It can be used to interact with the contract.

In case the deployment fails (due to issues like lack of funds in the deployer account, output bytecode exceeding Ethereum's block gas limit, etc.), an error will be thrown.

Congratulations! Your `HelloWorld` contract is now deployed! In the next sections, we'll show you how to interact with it.

## Section 6: Interacting with the Smart Contract

Now, with our contract successfully deployed on the Ethereum network, let's interact with it.

We can interact with the contract by calling the methods we had defined within it. Let's begin by reading the initial message we passed to the contract:

```javascript
// Read the current value of the message
let currentMessage;
try {
  currentMessage = await contractInstance.methods.message().call();
  console.log('Current message:', currentMessage);
} catch (error) {
  console.error('Failed to fetch message:', error);
}
```

Next, let's update the message with a new one:

```javascript
// Update the message
const newMessage = 'Hello, Ethereum!';
const updateParams = { from: fromAddress };
try {
  await contractInstance.methods.updateMessage(newMessage).send(updateParams);
  console.log('Message updated successfully');
} catch (error) {
  console.error('Failed to update message:', error);
}
```

And finally, let's verify that our message has been updated successfully:

```javascript
// Verify the message has been updated
try {
  currentMessage = await contractInstance.methods.message().call();
  console.log('Updated message:', currentMessage);
} catch (error) {
  console.error('Failed to fetch updated message:', error);
}
```

Congratulations! You have successfully interacted with your Ethereum contract using `web3-plugin-craftsman`.

## Section 7: Conclusion and Next Steps

We have successfully set up `web3` and `web3-plugin-craftsman`, created a `HelloWorld` contract, handled its compilation, deployed it onto the Ethereum network, and interacted with it.

This is a basic workflow of how you'd work with Ethereum contracts. However, Solidity is a powerful language and Ethereum is a flexible platform; there's so much more to explore.

Possible next steps to deepen your understanding are:
- Check the [README file of `web3-plugin-craftsman`](https://github.com/conx3/web3-plugin-craftsman) an explore it for things like the [constructor options](https://github.com/conx3/web3-plugin-craftsman#the-constructor-options) that let you for example pass multiple smart contracts files. And check the [save the compilation result](https://github.com/conx3/web3-plugin-craftsman#save-the-compilation-result) functionality...
- Experiment with more complex smart contracts: Go beyond a "Hello World" example and create contracts for practical use cases, such as voting systems, token creation, decentralized exchanges, etc.
- Understand Ethereum environments: Apart from local, understand the usage of the test nets (like Sepolia) and the Ethereum mainnet and learn to deploy your contract on them.
- Learn about the Ethereum ecosystem: Get comfortable with various Ethereum development tools, libraries, wallets, and DApps.
- Understand security concerns: Learn how to write secure contracts and understand potential vulnerabilities in contract creation.

Congrats on setting your foot in Ethereum development! Keep learning and exploring. Happy coding!
