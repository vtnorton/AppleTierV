import path from 'node:path';
import ts from 'typescript';

const DIST_DIR = path.join(import.meta.dir, '..', 'dist');
const CORE_JS_BUNDLE = path.join(import.meta.dir, '..', 'node_modules', 'core-js-bundle', 'minified.js');
const ENTRY_FILES = ['seriesPage.js', 'moviesPage.js'];

const downlevelToEs5 = (source: string): string => {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.None,
      downlevelIteration: true,
    },
  });
  return result.outputText;
};

const run = async (): Promise<void> => {
  const polyfills = await Bun.file(CORE_JS_BUNDLE).text();

  for (const fileName of ENTRY_FILES) {
    const filePath = path.join(DIST_DIR, fileName);
    const source = await Bun.file(filePath).text();
    const es5 = downlevelToEs5(source);
    await Bun.write(filePath, `${polyfills}\n${es5}`);
    console.log(`  [es5] ${fileName}`);
  }
};

await run();
