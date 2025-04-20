import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AddonPanel } from '@storybook/components';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Alert, { AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import {
  RadioButtonChecked as RadioButtonCheckedIcon,
  Stop as StopIcon,
  FeaturedPlayList as FeaturedPlayListIcon,
} from '@mui/icons-material';

import styled from '@emotion/styled';

import PanelList from './panel_list';

// Type
import {
  Actors,
  Argument,
  EventType,
  Framework,
  JestDeclarationExpression,
  JestExpressionStatement,
  JestQuery,
  ObjectExpression,
  Status,
  UserEventResult,
} from '../../types';
import {
  onElementChange,
  onElementClick,
  onElementInput,
  Jest,
  debounce,
  FRAMEWORK_TO_LOGO,
} from '../helpers';

const noActorsFoundErrorMessage = '[interaction-2-test] Could not find an actor. Please make sure you define at least 1 actor through i2t-actors property in your stories file';

const H3Style = styled.h3`
  display: inline-flex;
  gap: 4px;
  align-items: center;
`;

const FooterStyle = styled.footer`
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FrameworkDivStyle = styled.div`
  display: inline-flex;
  gap: 16px;
  align-items: center;
  font-size: 16px;
  margin-right: 8px;
  color: white;
`;

const CustomSelectStyle = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    padding: '0 16px',
  },
}));

export default ({
  active,
  actors,
  storyRendered,
  framework,
  component,
} : {
  active: boolean,
  actors: Actors,
  storyRendered: boolean,
  framework: Framework,
  component: {
    componentName: string,
    extension: string,
    props: ObjectExpression['properties'],
  }
}) => {
  const [ recordState, setRecordState ] = useState<Status>('off');
  const [ alerts, setAlert ] = useState<Array<{ message: string, style: AlertProps['severity'] }>>([]);
  const [ steps, setSteps ] = useState<Array<JestExpressionStatement>>([]);
  const [ imports, setImports ] = useState<JestDeclarationExpression['importDeclaration']>([]);
  const [ variables, setVariables ] = useState<JestDeclarationExpression['variableDeclaration']>([]);
  const [ testFramework, setTestFramework ] = useState('Jest');

  // Create ref to use updated variable inside useCallback
  const rootRef = useRef<HTMLElement | null>(null);
  const actorsRef = useRef<Actors>(actors);
  const componentRef = useRef(component);

  // Initialise Jest with a FE framework
  Jest.init(framework, component.componentName);

  const recordChangesToDomTree = (status: Status) => {
    new MutationObserver(() => {
  
    });
  };

  // Process the result (alert if error or warn and set recorded step list if successful)
  const processResult = (result: UserEventResult | null) => {
    if (result?.status === 'error' || result?.status === 'warning') {
      setAlert((prev) => [ ...prev, { message: result?.message as string, style: result?.status } ]);
      return;
    }
    if (result?.status === 'success') {
      // Use User interaction to Jest code mapper here
      const recordedStep = Jest[result.target?.eventType as EventType](result.target, (result.target?.element as HTMLInputElement)?.value ?? '');
      setSteps((items) => [ ...items, recordedStep ]);
      // Check for imports or declaration
      const declarationStatements = Jest.createDeclaration(result.target?.accessBy as JestQuery, componentRef.current.props);
      setImports(declarationStatements?.importDeclaration ?? []);
      setVariables(declarationStatements?.variableDeclaration ?? []);
    }
  };

  // Input change event with debounce
  const onElementInputWithDebounce = useMemo(() => debounce((e: Event) => {
    const result = onElementInput(rootRef.current as any, e, actorsRef.current);
    processResult(result);
    return result;
  }, 500), [rootRef, actorsRef]);

  // Wrap the event handler with useCallback so that its reference remains stable.
  const parseElementViaUserEvent = useCallback((e: Event) => {
    const elementWithDataTestId = {
      click: () => onElementClick(rootRef.current as any, e, actorsRef.current),
      input: () => onElementInputWithDebounce(e),
      change: () => onElementChange(rootRef.current as any, e, actorsRef.current),
      hover: () => null,
    };
    const result = elementWithDataTestId[e.type as EventType]();
    processResult(result);
  }, []);
  
  const toggleListener = (status: Status) => {
    // get the iframe content window
    const frameElement = document.querySelector('iframe[data-is-storybook="true"]');
    const rootElement: HTMLElement = (frameElement as any)?.contentDocument.querySelector('#root');
    // update the ref
    rootRef.current = rootElement;
    if (!rootRef.current) return;
    if (!actorsRef.current) {
      setAlert([
        {
          message: noActorsFoundErrorMessage,
          style: 'error',
        }
      ]);
      setRecordState('off');
      return;
    }
  
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

  const onItemRemove = (removingIdx: number) => {
    setSteps((steps) => steps.filter((_, idx) => idx !== removingIdx));
  };

  // Life Cycle
  useEffect(() => {
    toggleRecorder[recordState]();
  }, [ recordState ]);
  useEffect(() => {
    actorsRef.current = actors;
    if (!actorsRef.current && storyRendered) {
      setAlert([
        {
          message: noActorsFoundErrorMessage,
          style: 'error',
        }
      ]);
    }
    // If story is not rendered
    if (!storyRendered) {
      setRecordState('off');
      setSteps([]);
    }
  }, [ actors, storyRendered ]);
  useEffect(() => {
    componentRef.current = component;
  }, [ component ]);

  return (
    <AddonPanel active={active}>
      <H3Style id="i2t-header" style={{ padding: '8px 0 0 8px' }}>
        <FeaturedPlayListIcon />
        Recorded Interactions
      </H3Style>
      <PanelList
        actionList={steps}
        importList={imports}
        variableList={variables}
        onItemRemove={onItemRemove} />

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
      <FooterStyle>
        <Tooltip title={recordState === 'off' ? 'Start recording' : 'Stop recording'} arrow>
          <Button
            variant="contained"
            style={recordState === 'off' ? { backgroundColor: 'rgba(225, 225, 225, 0.08)', width: '100px' } : { width: '100px' }}
            color="error"
            startIcon={recordState === 'off' ? <RadioButtonCheckedIcon color="error" /> : <StopIcon />}
            onClick={() => {
              setRecordState((prev) => prev === 'off' ? 'on' : 'off');
            }}>
            {recordState === 'off' ? 'Record' : 'Stop'}
          </Button>
        </Tooltip>

        <FrameworkDivStyle>
          <FormControl
            size="small"
            color="primary"
            sx={{ m: 1, margin: 0,  padding: 0, minWidth: 100, minHeight: 36 }}>
            <CustomSelectStyle
              labelId="test-framework-label"
              id="test-framework"
              value={testFramework}
              label="Test Framework"
              style={{ color: "white", backgroundColor: "grey", height: "36px" }}
              onChange={(e) => { setTestFramework('Jest'); } } variant={'standard'}>
              <MenuItem value="Jest">Jest</MenuItem>
            </CustomSelectStyle>
          </FormControl>

          |

          <div style={{ display: "flex", width: "20px" }}><img src={FRAMEWORK_TO_LOGO[framework]} /></div>
        </FrameworkDivStyle>
      </FooterStyle>
    </AddonPanel>
  );
}
