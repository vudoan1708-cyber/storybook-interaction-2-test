import fs from 'fs';

import { parse as svelteParser } from 'svelte/compiler';
import { parse as babelParser } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

import { ObjectExpression } from '../../types';
import { DEFINE_ACTORS } from './constants';

export const getFileContent = (filePath: string) => {
  if (!fs.existsSync(filePath))  return null;

  return fs.readFileSync(filePath, 'utf-8')?.toString();
};

type FileExtensionType = 'svelte' | 'stories.svelte';

const analyseJsTsScriptBlock = (code: string) => {
  const ast = babelParser(code, {
    sourceType: 'module',
    plugins: ['typescript'],
  });

  const exportedProps: ObjectExpression['properties'] = [];
  // Reference: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-asts
  // Most of the code for traverse are from ChatGPT as I knew nothing about AST 🥲
  traverse(ast, {
    ExportNamedDeclaration(path) {
      const declaration = path.node.declaration;
      if (declaration?.type === 'VariableDeclaration') {
        for (const decl of declaration.declarations) {
          if (
            decl.id.type === 'Identifier' &&
            (declaration.kind === 'let' || declaration.kind === 'const')
          ) {
            const name = decl.id.name;
            let defaultValue: string = '';

            if (decl.init) {
              const { code } = generate(decl.init);
              defaultValue = code;
            }
            exportedProps.push({ key: name, value: defaultValue });
          }
        }
      }
    },
  });

  return exportedProps;
};
const analyseSvelteCode = (code: string) => {
  const parsed = svelteParser(code);
  const scriptBlock = parsed.instance;
  if (!scriptBlock) {
    console.error('No <script> block found in .svelte file.');
  }
  const scriptCode = code.slice((scriptBlock as any).content.start, (scriptBlock as any).content.end);

  // Analyse the script block
  return analyseJsTsScriptBlock(scriptCode);
};

type AnalyseCodeType = {
  filePath: string | null,
  fileContent: string | null,
  fileExt: FileExtensionType,
  parameters: any
};
export const analyseCode = ({ filePath, fileContent = null, parameters }: Partial<AnalyseCodeType>) => {
  let content: string | null = '';
  if (fileContent) {
    content = fileContent;
  } else {
    content = getFileContent(filePath as string);
  }

  if (!content) {
    console.error(`File path not found: ${filePath}`);
    console.error(`File content not valid: ${content}`);
    process.exit(1);
  }

  return analyseSvelteCode(content);
}
