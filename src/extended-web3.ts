import Web3, {
  Address,
  ContractAbi,
  ContractInitOptions,
  EthExecutionAPI,
  SupportedProviders,
  Web3Context,
  Web3EthInterface,
} from 'web3';
import {
  AbiAndBytecode,
  SolidityCompiler,
  SourceCodeAsText,
  SourceCodeInFile,
  SourceCodeOptions,
} from './solidity-compiler';
import { ExtendedContract } from './extended-contract';

export class ExtendedWeb3 extends Web3 {
  public readonly pluginNamespace = 'craftsman';

  public eth: ExtendedWeb3EthInterface;

  public readonly ExtendedContract: typeof ExtendedContract;

  // Ignore the typescript error: "A 'super' call must be the first statement in the constructor when a class contains initialized properties, parameter properties, or private identifiers.""
  // @ts-ignore
  public constructor(provider?: SupportedProviders<EthExecutionAPI> | string) {
    // To not receive the following warring in case of no provided provided to this instance
    // "NOTE: web3.js is running without provider. You need to pass a provider in order to interact with the network!"
    const warn = console.warn;
    console.warn = function() {};
    super(provider);
    console.warn = warn;

    // dummy statement to ignore a typescript error "Property 'eth' is used before being assigned".
    this.eth = this!.eth;

    class ExtendedContractBuilder<Abi extends ContractAbi> extends this!.eth
      .Contract<Abi> {
      // This property is only needed to make this class compatible with ExtendedContract.
      // TODO: probably refactor to remove this property. Because this class is not supposed to be a plugin.
      public readonly pluginNamespace: string;

      public contractName?: string;

      // The following 2 properties and their logic is duplicated and copied from ExtendedContract.
      // TODO: consider refactoring to use the same code written at ExtendedContract.
      public hadFinishedCompilation?: boolean;
      public compilationResult?: Promise<AbiAndBytecode>;

      public constructor(jsonInterface: Abi);
      public constructor(jsonInterface: Abi, address: Address);
      public constructor(jsonInterface: Abi, options: ContractInitOptions);
      public constructor(
        jsonInterface: Abi,
        address: Address,
        options: ContractInitOptions
      );
      public constructor(sourceCodeOptions: SourceCodeOptions);
      public constructor(
        sourceCodeOptions: SourceCodeOptions,
        address: Address
      );
      public constructor(
        sourceCodeOptions: SourceCodeOptions,
        options: ContractInitOptions
      );
      public constructor(
        sourceCodeOptions: SourceCodeOptions,
        address: Address,
        options: ContractInitOptions
      );
      public constructor(
        sourceCodeOptionsOrAbi: SourceCodeOptions | Abi,
        addressOrOptions?: Address | ContractInitOptions,
        options?: ContractInitOptions
      ) {
        if (
          typeof sourceCodeOptionsOrAbi === 'string' ||
          (sourceCodeOptionsOrAbi as SourceCodeAsText).sourceCode ||
          (sourceCodeOptionsOrAbi as SourceCodeInFile).path
        ) {
          super([] as any, addressOrOptions as any, options);

          SolidityCompiler.compileAndFillProperties(
            this,
            sourceCodeOptionsOrAbi as SourceCodeOptions
          );
        } else {
          const jsonInterface = sourceCodeOptionsOrAbi;
          super(jsonInterface as Abi, addressOrOptions as any, options);
        }
        this.pluginNamespace = 'extendedContract';
      }

      public async saveCompilationResult(filePath: string) {
        await SolidityCompiler.saveContractCompilation(filePath, this);
      }
    }

    this.ExtendedContract = ExtendedContractBuilder;
    this.eth.ExtendedContract = ExtendedContractBuilder;

    // To enable using `new ExtendedWeb3().craftsman.ExtendedContract`:
    this.craftsman = this;
  }

  public link(parentContext: Web3Context) {
    if (
      parentContext.provider &&
      this.provider &&
      parentContext.provider !== this.provider
    ) {
      throw new Error(
        'Only one provider should be provided! Either pass the provider to the Web3 instance or to the ExtendedWeb3 instance.'
      );
    }

    if (!parentContext.provider && this.provider) {
      parentContext.provider = this.provider;
    }
    super.link(parentContext);
  }
}

export interface ExtendedWeb3EthInterface extends Web3EthInterface {
  ExtendedContract: typeof ExtendedContract;
}

// Module Augmentation
declare module 'web3' {
  interface Web3 {
    // The Extended Contract will be available on both `web3.craftsman.ExtendedContract` and `web3.craftsman.eth.ExtendedContract`.
    craftsman: ExtendedWeb3;
  }
}
