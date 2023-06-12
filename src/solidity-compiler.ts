import { ContractAbi, Web3PluginBase } from 'web3';

import {
  CompileFailedError,
  CompileResult,
  compileSol,
  compileSourceString,
} from 'solc-typed-ast';

export type ScaffoldedCompileResult = CompileResult & {
  [index: string]: { abi: ContractAbi; bytecodeString: string } & {
    [index: string]: { abi: ContractAbi; bytecodeString: string };
  };
};

export class SolidityCompiler extends Web3PluginBase {
  public pluginNamespace = 'solidityCompiler';

  private scaffoldCompiledContract(
    result: CompileResult
  ): ScaffoldedCompileResult {
    const scaffoldedRes = result as ScaffoldedCompileResult;
    Object.keys(result.data.contracts).forEach((fileName) => {
      Object.keys(result.data.contracts[fileName]).forEach((contractName) => {
        const contract: {
          abi: ContractAbi;
          evm: { bytecode: { object: string } };
          bytecodeString: string;
        } = result.data.contracts[fileName][contractName];
        const bytecodeString = contract.evm.bytecode.object;
        const abi = contract.abi;

        scaffoldedRes[fileName] = {} as any;
        scaffoldedRes[fileName][contractName] = { abi, bytecodeString };
        scaffoldedRes[contractName] = { abi, bytecodeString } as any;
      });
    });
    return scaffoldedRes;
  }

  public async compileSol(fileName: string): Promise<ScaffoldedCompileResult>;
  public async compileSol(
    fileNames: string[]
  ): Promise<ScaffoldedCompileResult>;
  public async compileSol(fileOrFiles: string | string[]) {
    try {
      let result = await compileSol(fileOrFiles as any, 'auto');
      result = this.scaffoldCompiledContract(result);

      return result;
    } catch (e) {
      if (e instanceof CompileFailedError) {
        console.error('Compile errors encountered:');

        for (const failure of e.failures) {
          console.error(`Solc ${failure.compilerVersion}:`);

          for (const error of failure.errors) {
            console.error(error);
          }
        }
      } else {
        console.error(e);
      }
      throw e;
    }
  }

  public async compileSourceString(
    fileName: string,
    sourceCode: string
  ): Promise<ScaffoldedCompileResult> {
    try {
      let result = await compileSourceString(fileName, sourceCode, 'auto');

      const scaffoldedRes = this.scaffoldCompiledContract(result);

      return scaffoldedRes;
    } catch (e) {
      if (e instanceof CompileFailedError) {
        console.error('Compile errors encountered:');

        for (const failure of e.failures) {
          console.error(`Solc ${failure.compilerVersion}:`);

          for (const error of failure.errors) {
            console.error(error);
          }
        }
      } else {
        console.error(e);
      }
      throw e;
    }
  }
}

// Module Augmentation
declare module 'web3' {
  interface Web3Context {
    solidityCompiler: SolidityCompiler;
  }
}
