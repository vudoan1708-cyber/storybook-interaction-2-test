import React from 'react';
import type {
  Argument,
  ImportExportKind,
  JestExpressionStatement,
  JestImportPath,
  JestLifeCycleFunction,
  JestMemberExpression,
  JestQuery,
  ObjectExpression,
} from '../../types';

import styled from '@emotion/styled';

const KeywordCode = styled.span`
  color: #e66bfb;
`;
const ObjectCode = styled.span`
  color: #8cefd8;
`;
const PropertyCode = styled.span`
  color: #8cefd8;
`;
const ArgumentCode = styled.span`
  color: #f0bbf5;
`;
const ParenthesisStyle = styled.span`
  color: #da70d6;
`;
const LiteralStyle = styled.span`
  color: #f9dea6;
`;
const CodeStyle = styled.code`
  background-color: rgb(50, 50, 50);
  padding: 4px;
  border-radius: 4px;
`;

type ImportDeclarationStatement = {
  declarationSyntax: ImportExportKind;
  keywords: Set<Omit<JestLifeCycleFunction, JestQuery>>;
  source: JestImportPath;
};
type VariableDeclarationStatement = {
  declarationSyntax: ImportExportKind;
  keywords: Set<JestQuery>;
  callee: JestMemberExpression;
};

export default ({
  item,
  kind,
}: {
  item: JestExpressionStatement | ImportDeclarationStatement | VariableDeclarationStatement,
  kind: 'importDeclarations' | 'variableDeclarations' | 'statements',
}) => {
  const isObjectExpression = (arg: Argument): arg is ObjectExpression => {
    return typeof arg === 'object' && arg !== null && 'type' in arg && (arg as any).type === 'object';
  };
  const generateArguments = (arg: Argument): string => {
    if (isObjectExpression(arg)) {
      return `{
        ${
          Array.isArray(arg.properties)
            ? (arg.properties as Array<{ key: string; value: Argument }>).map((prop) => `${prop.key}: ${generateArguments(prop.value)}`).join(', ')
            : `${(arg.properties as { key: string; value: Argument }).key}: ${generateArguments((arg.properties as { key: string; value: Argument }).value)}`
          }
      }`;
    }
    if (typeof arg === 'string' || typeof arg === 'number') {
      return arg.toString();
    }
    return '';
  }
  const generateDeclarationProperty = (item: ImportDeclarationStatement) => {
    if (item.declarationSyntax === 'default') {
      return `${Array.from(item.keywords.values()).join(', ')}`;
    }
    if (item.declarationSyntax === 'named') {
      return `{ ${Array.from(item.keywords.values()).join(', ')} }`;
    }
    return '';
  };

  const generateStatementLine = (statement: JestExpressionStatement): React.JSX.Element => {
    return (
      <>
        {statement.keyword ? <KeywordCode>{statement.keyword} </KeywordCode> : null}
        <ObjectCode>{statement.callee.object}</ObjectCode>
        {
          statement.callee.property
            ? <>
                <span style={{color: "white"}}>.</span>
                <PropertyCode>{statement.callee.property}</PropertyCode>
              </>
            : null
        }

        {
          statement.callee.noParen
            ? null
            : (
              <ParenthesisStyle>
                (
                  <ArgumentCode>
                    {statement.callee.arguments
                      ?.map((arg) => generateArguments(arg))
                      .join(', ')}
                  </ArgumentCode>
                )
              </ParenthesisStyle>
              )
        }

        {
          statement.callee.chained
            ? <>
                <span style={{color: "white"}}>.</span>{generateStatementLine(statement.callee.chained)}
              </>
            : null
        }
      </>
    )
  };

  return (
    <CodeStyle>
      {
        kind === 'statements'
          ? generateStatementLine(item as JestExpressionStatement)
          : <>
              <KeywordCode>{kind === 'importDeclarations' ? 'import ' : 'const '}</KeywordCode>
              <ObjectCode>{generateDeclarationProperty(item as ImportDeclarationStatement)} </ObjectCode>
              <KeywordCode>{kind === 'importDeclarations' ? 'from ' : '= '}</KeywordCode>
              {
                kind === 'importDeclarations'
                  ? <LiteralStyle>
                      '{(item as ImportDeclarationStatement).source}'
                    </LiteralStyle>
                  : <>
                      <ObjectCode>{(item as VariableDeclarationStatement).callee.object}</ObjectCode>
                      <ParenthesisStyle>
                        (
                          <ArgumentCode>
                            {(item as VariableDeclarationStatement).callee.arguments
                              ?.map((arg) => generateArguments(arg))
                              .join(', ')}
                          </ArgumentCode>
                        )
                      </ParenthesisStyle>
                    </>
                  
              }
            </>
      }
      <LiteralStyle>;</LiteralStyle>
    </CodeStyle>
  )
};
