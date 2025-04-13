import React, { useEffect, useState } from "react";

import { AddonPanel, Button } from '@storybook/components';

const record = (state: boolean) => {
  console.log(`${state ? 'Recording....' : 'Stopping....'}`);
  new MutationObserver(() => {

  });
};

export default ({ active } : { active: boolean }) => {
  const [ recordState, setRecordState ] = useState(false);

  useEffect(() => {
    console.log('recordState', recordState)
    record(recordState);
  }, [ recordState ]);

  return (
    <AddonPanel active={active}>
      <h3>Recorded Interactions:</h3>
      <Button onClick={() => { setRecordState(!recordState); }}>
        {!recordState ? 'Record' : 'Stop'}
      </Button>
      <ul>
      </ul>
    </AddonPanel>
  );
}
