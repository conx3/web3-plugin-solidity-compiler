import { ContractAbi } from 'web3';

import {
  CompileFailedError,
  CompileResult,
  compileSol,
  compileSourceString,
} from 'solc-typed-ast';

import fs from 'fs';
import path from 'path';

import { ExtendedContract } from './extended-contract';

export type AbiAndBytecode = {
  abi: ContractAbi;
  bytecodeString: string;
  contractName: string;
};

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

        scaffoldedRes[fileName][contractName] = {
          abi,
          bytecodeString,
          contractName,
        };
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
          contractName: string;
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
      let result;
      let error;
      let triesCounter = 0;
      do {
        try {
          triesCounter += 1;
          result = await compileSol(fileOrFiles as any, 'auto');
        } catch (err) {
          error = err;
          // when running for the first time, sometimes the permission is denied
          // so we wait for a second before trying again
          if (SolidityCompiler.retryCondition(error, triesCounter)) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } while (SolidityCompiler.retryCondition(error, triesCounter));

      if (!result) {
        throw error;
      }

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
      let result;
      let error;
      let triesCounter = 0;
      do {
        try {
          triesCounter += 1;
          result = await compileSourceString(fileName, sourceCode, 'auto');
        } catch (err) {
          error = err;
          // when running for the first time, sometimes the permission is denied
          // so we wait for a second before trying again
          if (SolidityCompiler.retryCondition(error, triesCounter)) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } while (SolidityCompiler.retryCondition(error, triesCounter));

      if (!result) {
        throw error;
      }

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

  private static retryCondition(error: unknown, triesCounter: number) {
    return (
      error &&
      ((error as Error).message.includes('permission denied') || // linux and macOS
        (error as Error).message.includes('operation not permitted')) && // windows
      triesCounter <= 10
    );
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
          .then((compilationRes) => {
            let abi;
            let bytecodeString;
            if (contractName) {
              let contractPath: string;
              if (typeof path === 'string') {
                contractPath = path;
              } else {
                contractPath = Object.keys(compilationRes.data.contracts)?.find(
                  (p) => compilationRes[p][contractName as string]
                ) as string;
              }
              abi = compilationRes[contractPath][contractName].abi;
              bytecodeString =
                compilationRes[contractPath][contractName].bytecodeString;
            } else if (compilationRes.abi && compilationRes.bytecodeString) {
              abi = compilationRes.abi;
              bytecodeString = compilationRes.bytecodeString;
              contractName = compilationRes.contractName;
            }
            if (abi && bytecodeString && contractName) {
              (contract.options as {
                jsonInterface: ContractAbi;
              }).jsonInterface = abi;
              (contract.options as { input: string }).input = bytecodeString;
              contract.contractName = contractName;
              contract.hadFinishedCompilation = true;
              resolve({
                abi,
                bytecodeString,
                contractName,
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
      } else if (contractSourceCode) {
        let fileName = 'contract';
        SolidityCompiler.compileSourceString(fileName, contractSourceCode)
          .then((compilationRes) => {
            if (compilationRes.abi && compilationRes.bytecodeString) {
              // Ignore the typescript error: "Property 'jsonInterface' does not exist on type 'ContractOptions'."
              // @ts-ignore
              contract.options.jsonInterface = compilationRes.abi;
              (contract.options as { input: string }).input =
                compilationRes.bytecodeString;
              contractName = compilationRes.contractName;
              contract.contractName = contractName;
              contract.hadFinishedCompilation = true;
              resolve({
                abi: compilationRes.abi,
                bytecodeString: compilationRes.bytecodeString,
                contractName,
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

  public static async saveContractCompilation<Abi extends ContractAbi>(
    filePath: string,
    contract: ExtendedContract<Abi>
  ) {
    if (contract.compilationResult) {
      await contract.compilationResult;
    }
    // Ignore the typescript error: "Property 'jsonInterface' does not exist on type 'ContractOptions'."
    // @ts-ignore
    const abi = contract.options.jsonInterface;
    if (abi) {
      SolidityCompiler.saveCompilationResult(filePath, {
        abi,
        bytecodeString:
          contract.options.input instanceof Uint8Array
            ? new TextDecoder().decode(contract.options.input)
            : contract.options.input ?? '',
        contractName: contract.contractName ?? '',
      });
    }
  }

  public static async saveCompilationResult(
    filePath: string,
    compilationResult: AbiAndBytecode
  ) {
    const fileContent = `// This file has been generated by:
//	"web3-plugin-craftsman" (https://github.com/conx3/web3-plugin-craftsman)

/* eslint-disable */

export const ${compilationResult.contractName}Abi = ${JSON.stringify(
      compilationResult.abi,
      undefined,
      2
    )
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"([^"]*)"/g, "'$1'")} as const;

export const ${compilationResult.contractName}Bytecode = '${
      compilationResult.bytecodeString
    }';\n`;

    // Write the ABI and Bytecode to the file system
    let contractPath;
    if (
      filePath.endsWith('/') ||
      filePath.endsWith('\\') ||
      (!filePath.endsWith('.ts') && !filePath.endsWith('.js'))
    ) {
      contractPath = path.join(
        __dirname,
        filePath,
        compilationResult.contractName + '-artifacts.ts'
      );
    } else {
      contractPath = path.join(__dirname, filePath);
    }
    const dirname = path.dirname(contractPath);
    if (!(await fs.existsSync(dirname))) {
      await fs.mkdirSync(dirname, { recursive: true });
    }
    await fs.writeFileSync(contractPath, fileContent, 'utf8');
  }
}
