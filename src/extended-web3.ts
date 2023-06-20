import Web3, {
  Address,
  ContractAbi,
  ContractInitOptions,
  EthExecutionAPI,
  SupportedProviders,
  Web3EthInterface,
} from 'web3';
import { AbiAndBytecode, SolidityCompiler } from './solidity-compiler';
import { ExtendedContract } from './extended-contract';

export interface ExtendedWeb3EthInterface extends Web3EthInterface {
  ExtendedContract: typeof ExtendedContract;
}

export class ExtendedWeb3 extends Web3 {
  public readonly pluginNamespace = 'extendedWeb3';

  public eth: ExtendedWeb3EthInterface;

  public constructor(provider?: SupportedProviders<EthExecutionAPI> | string) {
    super(provider);

    // dummy statement to ignore a typescript error "Property 'eth' is used before being assigned".
    this.eth = this!.eth;

    class ExtendedContractBuilder<Abi extends ContractAbi> extends this!.eth
      .Contract<Abi> {
      // This property is only needed to make this class compatible with ExtendedContract.
      // TODO: probably refactor to remove this property. Because this class is not supposed to be a plugin.
      public readonly pluginNamespace;

      // The following 2 properties and their logic is duplicated and copied from ExtendedContract.
      // TODO: consider refactoring to use the same code written at ExtendedContract.
      public hadFinishedCompilation?: boolean;
      public waitForCompilation?: Promise<AbiAndBytecode>;

      public constructor(jsonInterface: Abi);
      public constructor(jsonInterface: Abi, address: Address);
      public constructor(jsonInterface: Abi, options: ContractInitOptions);
      public constructor(
        jsonInterface: Abi,
        address: Address,
        options: ContractInitOptions
      );
      public constructor(sourceCode: string);
      public constructor(sourceCode: string, address: Address);
      public constructor(sourceCode: string, options: ContractInitOptions);
      public constructor(
        sourceCode: string,
        address: Address,
        options: ContractInitOptions
      );
      public constructor(
        jsonInterfaceOrSourceCode: Abi | string,
        addressOrOptions?: Address | ContractInitOptions,
        options?: ContractInitOptions
      ) {
        if (typeof jsonInterfaceOrSourceCode === 'string') {
          super([] as any, addressOrOptions as any, options);
          this.hadFinishedCompilation = false;
          this.waitForCompilation = new Promise((resolve, reject) => {
            const sourceCode = jsonInterfaceOrSourceCode;
            const anyName = 'contract';

            SolidityCompiler.compileSourceString(anyName, sourceCode)
              .then((compilationRes) => {
                if (compilationRes.abi && compilationRes.bytecodeString) {
                  this.options.jsonInterface = compilationRes.abi;
                  (this.options as { input: string }).input =
                    compilationRes.bytecodeString;
                  resolve({
                    abi: compilationRes.abi,
                    bytecodeString: compilationRes.bytecodeString,
                  });
                } else {
                  reject(
                    new Error(
                      'Something when wrong. The reason could be that you have multiple smart contracts provided'
                    )
                  );
                }
                this.hadFinishedCompilation = true;
              })
              .catch((e: Error) => {
                this.hadFinishedCompilation = true;
                reject(e);
              });
          });
        } else {
          const jsonInterface = jsonInterfaceOrSourceCode;
          super(jsonInterface, addressOrOptions as any, options);
        }
        this.pluginNamespace = 'extendedContract';
      }
    }

    (this as any).ExtendedContract = ExtendedContractBuilder;
    this.eth.ExtendedContract = ExtendedContractBuilder;
  }
}

// Module Augmentation
declare module 'web3' {
  interface Web3 {
    extendedWeb3: {
      ExtendedContract: typeof ExtendedContract;
    };
  }
}

