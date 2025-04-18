import React, { useCallback, useEffect, useRef, useState } from "react";

import { AddonPanel } from '@storybook/components';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Alert, { AlertProps } from '@mui/material/Alert';
import Snackbar from "@mui/material/Snackbar";

import {
  RadioButtonChecked as RadioButtonCheckedIcon,
  Stop as StopIcon,
} from '@mui/icons-material';

import Panel_list from "./panel_list";

// Type
import { Actors, EventType, Status, UserEventResult } from '../../types';
import { onElementChange, onElementClick, onElementInput } from "../helpers/eventListeners";

export default ({ active, actors } : { active: boolean, actors: Actors }) => {
  const [ recordState, setRecordState ] = useState<Status>('off');
  const [ alerts, setAlert ] = useState<Array<{ message: string, style: AlertProps['severity'] }>>([]);
  const [ steps, setSteps ] = useState<Array<UserEventResult['target']>>([]);

  // Create ref to use updated variable inside useCallback
  const rootRef = useRef<HTMLElement | null>(null);
  const actorsRef = useRef<Actors>(actors);

  const recordChangesToDomTree = (status: Status) => {
    new MutationObserver(() => {
  
    });
  };

  // Wrap the event handler with useCallback so that its reference remains stable.
  const parseElementViaUserEvent = useCallback((e: Event) => {
    const elementWithDataTestId = {
      click: () => onElementClick(rootRef.current as any, e, actorsRef.current),
      input: () => onElementInput(rootRef.current as any, e, actorsRef.current),
      change: () => onElementChange(rootRef.current as any, e, actorsRef.current),
      hover: () => null,
    };
    const result = elementWithDataTestId[e.type as EventType]();
    if (result?.status === 'error' || result?.status === 'warning') {
      setAlert((prev) => [ ...prev, { message: result?.message as string, style: result?.status } ]);
      return;
    }
    // TODO: collate user flow into coherent dataset for processing
    if (result?.status === 'success') {
      // Use User interaction to Jest code mapper here
      setSteps((items) => [ ...items, result.target ]);
    }
  }, []);
  
  const toggleListener = (status: Status) => {
    // get the iframe content window
    const frameElement = document.querySelector('iframe[data-is-storybook="true"]');
    const rootElement: HTMLElement = (frameElement as any)?.contentDocument.querySelector('#root');
    // update the ref
    rootRef.current = rootElement;
    if (!rootRef.current) return;
  
    if (status === 'on') {
      rootRef.current.addEventListener('click', parseElementViaUserEvent, { capture: true });
      rootRef.current.addEventListener('input', parseElementViaUserEvent);
      rootRef.current.addEventListener('change', parseElementViaUserEvent, { capture: true });
      return;
    }
    if (status === 'off') {
      rootRef.current.removeEventListener('click', parseElementViaUserEvent, { capture: true });
      rootRef.current.removeEventListener('input', parseElementViaUserEvent);
      rootRef.current.removeEventListener('change', parseElementViaUserEvent, { capture: true });
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
    toggleRecorder[recordState]();
  }, [ recordState ]);
  useEffect(() => {
    actorsRef.current = actors;
  }, [ actors ]);

  return (
    <AddonPanel active={active}>
      <h3>Recorded Interactions:</h3>
      <Panel_list list={steps} />

      {alerts.map((alert, idx) => (
        <Snackbar
          key={idx}
          open
          autoHideDuration={6000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          style={{ bottom: `calc(50px * ${idx + 1})` }}
          onClose={() => { setAlert((prev) => prev.filter((_, i) => i !== idx)); }}>
          <Alert
            severity={alert.style}
            onClose={() => { setAlert((prev) => prev.filter((_, i) => i !== idx)); }}>
            {alert.message}
          </Alert>
        </Snackbar>
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
