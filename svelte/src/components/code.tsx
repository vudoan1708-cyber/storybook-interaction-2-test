import React from 'react';
import { Argument, JestExpressionStatement, ObjectExpression } from '../../types';

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
const CodeStyle = styled.code`
  background-color: rgb(50, 50, 50);
  padding: 4px;
  border-radius: 4px;
`;

export default ({ item }: { item: JestExpressionStatement }) => {
  const isObjectExpression = (arg: Argument): arg is ObjectExpression => {
    return typeof arg === 'object' && arg !== null && 'type' in arg && (arg as any).type === 'object';
  };
  const generateArguments = (arg: Argument): string => {
    if (isObjectExpression(arg)) {
      return `{
        ${arg.properties.key}: ${generateArguments(arg.properties.value)}
      }`;
    }
    if (typeof arg === 'string') {
      return arg;
    }
    return '';
  }
  return (
    <CodeStyle>
      {item.keyword ? <KeywordCode>{item.keyword} </KeywordCode> : null}
      <ObjectCode>{item.callee.object}</ObjectCode><span style={{color: "white"}}>.</span><PropertyCode>{item.callee.property}</PropertyCode>
      <ParenthesisStyle>
        (
          <ArgumentCode>
            {item.callee.arguments
              ?.map((arg) => generateArguments(arg))
              .join(', ')}
          </ArgumentCode>
        )
      </ParenthesisStyle>
    </CodeStyle>
  )
};
