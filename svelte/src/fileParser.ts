import * as parser from '@babel/parser';
import traverse from '@babel/traverse';

const analyseJsTsCode = (code) => {
  const ast = parser.parse(code);
  traverse(ast, {

  });
};
