import React, { useEffect, useState } from 'react';
import { UserEventResult } from '../../types';

export default ({ list }: { list: Array<UserEventResult['target']> }) => {
  return (
    <ul>
      {list?.map((item, idx) => (
        <li key={idx}>{item?.element?.tagName} {item?.eventType}</li>
      ))}
    </ul>
  )
}
