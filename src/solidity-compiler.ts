import { ContractAbi } from 'web3';

import {
  CompileFailedError,
  CompileResult,
  compileSol,
  compileSourceString,
} from 'solc-typed-ast';

export type AbiAndBytecode = { abi: ContractAbi; bytecodeString: string };

export type ScaffoldedCompileResult = CompileResult &
  // incase there is only one file and only one contract in it
  AbiAndBytecode & {
    // incase there is only one contract within the file: { [filename]: abi and bytecode of the only contract inside }
    [index: string]: AbiAndBytecode & {
      // incase there is multiple contracts within multiple files: { [filename][contract name]: abi and bytecode of every contract }
      [index: string]: AbiAndBytecode;
    };
  };

export class SolidityCompiler {
  private static scaffoldCompiledContract(
    result: CompileResult
  ): ScaffoldedCompileResult {
    let scaffoldedRes = result as ScaffoldedCompileResult;
    Object.keys(result.data.contracts).forEach((fileName) => {
      scaffoldedRes[fileName] = {} as any;
      Object.keys(result.data.contracts[fileName]).forEach((contractName) => {
        const contract: {
          abi: ContractAbi;
          evm: { bytecode: { object: string } };
          bytecodeString: string;
        } = result.data.contracts[fileName][contractName];
        const bytecodeString = contract.evm.bytecode.object;
        const abi = contract.abi;

        scaffoldedRes[fileName][contractName] = { abi, bytecodeString };
        // scaffoldedRes[contractName] = { abi, bytecodeString } as any;
      });
      if (Object.keys(result.data.contracts[fileName]).length === 1) {
        const contract = scaffoldedRes[fileName][
          Object.keys(result.data.contracts[fileName])[0]
        ] as any;
        (scaffoldedRes as any)[fileName] = {
          ...scaffoldedRes[fileName],
          ...contract,
        };
      }
    });
    if (Object.keys(result.data.contracts).length === 1) {
      const contract = scaffoldedRes[Object.keys(result.data.contracts)[0]] as {
        [index: string]: {
          abi: ContractAbi;
          bytecodeString: string;
        };
      } as any;
      (scaffoldedRes as any) = { ...scaffoldedRes, ...contract };
    }
    return scaffoldedRes;
  }

  public async compileSol(fileName: string): Promise<ScaffoldedCompileResult>;
  public async compileSol(
    fileNames: string[]
  ): Promise<ScaffoldedCompileResult>;
  public async compileSol(fileOrFiles: string | string[]) {
    return SolidityCompiler.compileSol(fileOrFiles as any);
  }

  public static async compileSol(
    fileName: string
  ): Promise<ScaffoldedCompileResult>;
  public static async compileSol(
    fileNames: string[]
  ): Promise<ScaffoldedCompileResult>;
  public static async compileSol(fileOrFiles: string | string[]) {
    try {
      let result = await compileSol(fileOrFiles as any, 'auto');
      result = SolidityCompiler.scaffoldCompiledContract(result);

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
    return SolidityCompiler.compileSourceString(fileName, sourceCode);
  }
  public static async compileSourceString(
    fileName: string,
    sourceCode: string
  ): Promise<ScaffoldedCompileResult> {
    try {
      let result = await compileSourceString(fileName, sourceCode, 'auto');

      const scaffoldedRes = SolidityCompiler.scaffoldCompiledContract(result);

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
      }
      throw e;
    }
  }
}
