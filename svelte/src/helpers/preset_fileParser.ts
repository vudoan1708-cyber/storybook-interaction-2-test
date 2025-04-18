import fs from 'fs';

import { parse as svelteParser } from 'svelte/compiler';
import { parse as babelParser } from '@babel/parser';
import traverse from '@babel/traverse';

import { Actors, UserEvent } from '../../types';
import { DEFINE_ACTORS } from './constants';

export const getFileContent = (filePath: string) => {
  if (!fs.existsSync(filePath))  return null;

  return fs.readFileSync(filePath, 'utf-8')?.toString();
};

type FileExtensionType = 'svelte' | 'stories.svelte';

let results: UserEvent[] = [];

const analyseJsTsScriptBlock = (code: string) => {
  const ast = babelParser(code, {
    sourceType: 'module',
    plugins: ['typescript'],
  });

  // Reference: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#toc-asts
  traverse(ast, {
    CallExpression(path) {
      if (
        path.node.callee.type === 'MemberExpression' &&
        path.node.callee.property.type === 'Identifier' &&
        path.node.callee.property.name === 'addEventListener'
      ) {
        const [ eventType, handler ] = path.node.arguments;
        if (eventType.type === 'StringLiteral') {
          results.push({
            type: 'script',
            eventName: eventType.value,
            element: (path.node.callee.object as any)?.name,
          });
        }
      }
    },
  });
};
const analyseSvelteCode = (code: string, actors: Actors) => {
  const parsed = svelteParser(code);
  const scriptBlock = parsed.instance;
  if (!scriptBlock) {
    console.error('No <script> block found in .svelte file.');
  }
  const scriptCode = code.slice((scriptBlock as any).content.start, (scriptBlock as any).content.end);

  // Analyse the script block
  analyseJsTsScriptBlock(scriptCode);

  // Analyse the template block
  const templateBlock = parsed.html;
  const walk = (node: any) => {
    if (node.type === 'InlineComponent' && node.attributes) {
      for (const attr of node.attributes) {
        if (attr.type === 'EventHandler') {

        }
      }
    }
    if ((node.type === 'Element') && node.attributes) {
      console.log('node', node);
      for (const attr of node.attributes) {
        if (attr.type === 'Attribute') {
          results.push({
            type: 'template',
            eventName: attr.name,
            element: node.name,
            handler: attr.expression?.name,
            location: attr.expression?.start
              ? {
                  line: attr.expression.start.line,
                  column: attr.expression.start.column,
                }
              : undefined,
          });
        }
      }
    }

    if (node.children) node.children.forEach(walk);
  };

  walk(templateBlock);
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

  // Babel
  analyseSvelteCode(content, parameters[DEFINE_ACTORS]);
  console.log('results', results);
  // Svelte compiler
}
