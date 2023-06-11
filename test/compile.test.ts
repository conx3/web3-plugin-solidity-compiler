import { SourceOrFile, compile} from '../src';


import path from 'path';
import fs from 'fs'

const fileName = 'sample.sol'

describe('compile', () => {
  it('compile source code', async () => {
    // Read the Solidity source code from the file system
    const contractPath = path.join(__dirname, fileName);
    const sourceCode = fs.readFileSync(contractPath, 'utf8');

    const res = await compile(fileName, sourceCode, SourceOrFile.SOURCE)
    console.log(res)
  });
  it('compile file', async () => {
    const res = await compile(fileName, "./test", SourceOrFile.PATH)
    console.log(res)
  });
});
