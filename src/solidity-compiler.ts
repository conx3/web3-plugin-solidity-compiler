import { ContractAbi } from 'web3';

import {
  CompileFailedError,
  CompileResult,
  compileSol,
  compileSourceString,
} from 'solc-typed-ast';

import { ExtendedContract } from './extended-contract';

export type AbiAndBytecode = { abi: ContractAbi; bytecodeString: string };

export type SourceCodeAsText = {
  sourceCode: string;
  contractName?: string;
};
export type SourceCodeInFile = {
  path: string | string[];
  contractName?: string;
};
export type SourceCodeOptions = string | SourceCodeAsText | SourceCodeInFile;

export type ScaffoldedCompileResult = CompileResult &
  // incase there is only one file and only one contract in it
  AbiAndBytecode & {
    // incase there is only one contract within the file: { [filename]: abi and bytecode of the only contract inside }
    [index: string]: AbiAndBytecode & {
      // incase there is multiple contracts within multiple files: { [filename][contract name]: abi and bytecode of every contract }
      [index: string]: AbiAndBytecode;
    };
  };

const pathRegex = /^([a-zA-Z]+:?)?(\/?[^\r\n\s/:]+)*\/?(?:([^\r\n\s/:]+(?:\.\w+)?)?)$/;

export class SolidityCompiler {
  private static scaffoldCompiledContract(
    result: CompileResult
  ): ScaffoldedCompileResult {
    let scaffoldedRes = result as ScaffoldedCompileResult;
    Object.keys(result.data.contracts).forEach(fileName => {
      scaffoldedRes[fileName] = {} as any;
      Object.keys(result.data.contracts[fileName]).forEach(contractName => {
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
      const contract = (scaffoldedRes[
        Object.keys(result.data.contracts)[0]
      ] as {
        [index: string]: {
          abi: ContractAbi;
          bytecodeString: string;
        };
      }) as any;
      (scaffoldedRes as any) = { ...scaffoldedRes, ...contract };
    }
    return scaffoldedRes;
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

  public static compileAndFillProperties<Abi extends ContractAbi>(
    contract: ExtendedContract<Abi>,
    sourceCodeOptions: SourceCodeOptions
  ) {
    contract.hadFinishedCompilation = false;
    contract.compilationResult = new Promise((resolve, reject) => {
      let path: string | string[] | undefined;
      let contractSourceCode: string | undefined;
      if (typeof sourceCodeOptions === 'string')
        if (pathRegex.test(sourceCodeOptions)) {
          path = sourceCodeOptions;
        } else {
          contractSourceCode = sourceCodeOptions;
        }
      else {
        path = (sourceCodeOptions as SourceCodeInFile).path;
        contractSourceCode = (sourceCodeOptions as SourceCodeAsText).sourceCode;
      }
      let contractName: string | undefined;
      contractName = (sourceCodeOptions as { contractName: string })
        .contractName;
      if (path) {
        SolidityCompiler.compileSol(path as any)
          .then(compilationRes => {
            let abi;
            let bytecodeString;
            if (contractName) {
              let contractPath: string;
              if (typeof path === 'string') {
                contractPath = path;
              } else {
                contractPath = Object.keys(compilationRes.data.contracts)?.find(
                  p => compilationRes[p][contractName as string]
                ) as string;
              }
              abi = compilationRes[contractPath][contractName].abi;
              bytecodeString =
                compilationRes[contractPath][contractName].bytecodeString;
            } else if (compilationRes.abi && compilationRes.bytecodeString) {
              // Ignore the typescript error: "Property 'jsonInterface' does not exist on type 'ContractOptions'."
              abi = compilationRes.abi;
              bytecodeString = compilationRes.bytecodeString;
            }
            contract.hadFinishedCompilation = true;
            if (abi && bytecodeString) {
              (contract.options as {
                jsonInterface: ContractAbi;
              }).jsonInterface = abi;
              (contract.options as { input: string }).input = bytecodeString;
              resolve({
                abi,
                bytecodeString,
              });
            } else {
              reject(
                new Error(
                  'Something when wrong. The reason could be that you have provided the code for multiple smart contracts'
                )
              );
            }
          })
          .catch((e: Error) => {
            reject(e);
          });
      } else if (contractSourceCode) {
        let fileName = 'contract';
        SolidityCompiler.compileSourceString(fileName, contractSourceCode)
          .then(compilationRes => {
            if (compilationRes.abi && compilationRes.bytecodeString) {
              // Ignore the typescript error: "Property 'jsonInterface' does not exist on type 'ContractOptions'."
              // @ts-ignore
              contract.options.jsonInterface = compilationRes.abi;
              (contract.options as { input: string }).input =
                compilationRes.bytecodeString;
              contract.hadFinishedCompilation = true;
              resolve({
                abi: compilationRes.abi,
                bytecodeString: compilationRes.bytecodeString,
              });
            } else {
              contract.hadFinishedCompilation = true;
              reject(
                new Error(
                  'Something when wrong. The reason could be that you have provided the code for multiple smart contracts'
                )
              );
            }
          })
          .catch((e: Error) => {
            reject(e);
          });
      } else {
        throw new Error(
          'Contract Options does not contain `path` nor `sourceCode`.'
        );
      }
    });
  }
}
