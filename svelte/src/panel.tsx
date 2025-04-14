import React, { useEffect, useState } from "react";

import { AddonPanel } from '@storybook/components';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import {
  RadioButtonChecked as RadioButtonCheckedIcon,
  Stop as StopIcon,
} from '@mui/icons-material';

// Type
import { Status } from '../types';
import { onElementClick } from "./eventListeners";

export default ({ active } : { active: boolean }) => {
  const [ recordState, setRecordState ] = useState<Status>('off');
  const [ alerts, setAlert ] = useState<string[]>([]);

  const recordChangesToDomTree = (status: Status) => {
    console.log(`${status === 'on' ? 'Recording....' : 'Stopping....'}`);
    new MutationObserver(() => {
  
    });
  };
  
  const parseElementViaUserEvent = (e: Event) => {
    const elementWithDataTestId = onElementClick(e);
    if (!elementWithDataTestId) {
      console.log('e?.target', e?.target);
      setAlert((prev) => [ ...prev, `${(e?.target as any)?.nodeName} doesn't have a data-testid or any of its parent element` ]);
      return;
    }
    console.log('STILL LOGGED?')
  };
  
  const toggleListener = (status: Status) => {
    // get the iframe content window
    const frameElement = document.querySelector('iframe[data-is-storybook="true"]');
    const root: HTMLElement = (frameElement as any)?.contentDocument.querySelector('#root');
    if (!root) return;
  
    console.log('root', root);
    if (status === 'on') {
      root.addEventListener('click', parseElementViaUserEvent);
      return;
    }
    if (status === 'off') {
      root.removeEventListener('click', parseElementViaUserEvent);
    }
  };
  
  const toggleRecorder = {
    on: () => {
      recordChangesToDomTree('on');
      toggleListener('on');
    },
    off: () => {
      // Remove event listener and stuff
      recordChangesToDomTree('off');
      toggleListener('off');
    }
  }

  // Life Cycle
  useEffect(() => {
    console.log('recordState', recordState);
    toggleRecorder[recordState]();
  }, [ recordState ]);

  return (
    <AddonPanel active={active}>
      <h3>Recorded Interactions:</h3>
      <ul>
      </ul>

      {alerts.map((alert, idx) => (
        <Alert
          key={idx}
          variant="outlined"
          severity="error"
          style={{ width: '50%', position: 'absolute', right: 0, bottom: `calc(50px * ${idx + 1})` }}
          onClose={() => { setAlert((prev) => prev.filter((_, i) => i !== idx)); }}>
          {alert}
        </Alert>
      ))}

      {/* Footer */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderRadius: 'var(--border-radius)',
      }}>
        <Tooltip title={recordState === 'off' ? 'Start recording' : 'Stop recording'} arrow>
          <Button
            variant="contained"
            style={recordState === 'off' ? { backgroundColor: 'rgba(225, 225, 225, 0.08)', width: '100px' } : { width: '100px' }}
            color="error"
            startIcon={recordState === 'off' ? <RadioButtonCheckedIcon color="error" /> : <StopIcon />}
            onClick={(e) => {
              e.persist();
              setRecordState((prev) => prev === 'off' ? 'on' : 'off');
            }}>
            {recordState === 'off' ? 'Record' : 'Stop'}
          </Button>
        </Tooltip>
      </footer>
    </AddonPanel>
  );
}
