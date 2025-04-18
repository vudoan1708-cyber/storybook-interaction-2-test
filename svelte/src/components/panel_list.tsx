import React from 'react';
import { JestExpressionStatement } from '../../types';

import Code from './code';

export default ({ list }: { list: Array<JestExpressionStatement> }) => {
  return (
    <ol>
      {list?.map((item, idx) => (
        <li key={idx}><Code item={item} /></li>
      ))}
    </ol>
  )
}
