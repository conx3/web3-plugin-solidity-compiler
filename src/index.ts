import { Web3PluginBase } from 'web3';

import {
  CompileFailedError,
  CompileResult,
  compileSol,
  compileSourceString,
} from 'solc-typed-ast';

export enum SourceOrFile {
  SOURCE,
  PATH,
}

export class SolidityCompiler extends Web3PluginBase {
  public pluginNamespace = 'solidityCompiler';

  constructor() {
    super();
    console.log('good');
  }
  public async compile(
    fileName: string | string[],
    pathOrSource: string,
    type: SourceOrFile = SourceOrFile.PATH
  ) {
    let result: CompileResult | undefined;

    try {
      if (type === SourceOrFile.SOURCE) {
        if (typeof fileName !== 'string') {
          throw Error('Wrong parameters passed to `compile`');
        }
        result = await compileSourceString(fileName, pathOrSource, 'auto');
      } else {
        console.log(
          pathOrSource.lastIndexOf('/') === pathOrSource.length - 1
            ? pathOrSource
            : pathOrSource + '/' + fileName
        );
        result = await compileSol(
          pathOrSource.lastIndexOf('/') === pathOrSource.length - 1
            ? pathOrSource
            : pathOrSource + '/' + fileName,
          'auto'
        );
      }
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
    }

    return result;
  }
}

// Module Augmentation
declare module 'web3' {
  interface Web3Context {
    solidityCompiler: SolidityCompiler;
  }
}
