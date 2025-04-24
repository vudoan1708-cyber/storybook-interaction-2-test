import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AddonPanel } from '@storybook/components';

import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Alert, { AlertProps } from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';

import {
  RadioButtonChecked as RadioButtonCheckedIcon,
  Stop as StopIcon,
  FeaturedPlayList as FeaturedPlayListIcon,
  SettingsSuggest as SettingsSuggestIcon,
} from '@mui/icons-material';

import styled from '@emotion/styled';

import PanelList from './panel_list';
import Modal from './modal';

// Type
import {
  Actors,
  EventType,
  ExpectStatement,
  Framework,
  JestDeclarationExpression,
  JestExpressionStatement,
  JestQuery,
  NonInteractiveEventType,
  ObjectExpression,
  RecordingSettings,
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
import { getFromLocalStorage, saveToLocalStorage } from '../helpers/settings';

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

const InfoAndSettingsDevStyle = styled.div`
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

const initialSettings = getFromLocalStorage();

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
  const [ settings, setSettings ] = useState<RecordingSettings | null>(initialSettings);
  const [ recordState, setRecordState ] = useState<Status>(settings?.status ?? 'off');

  const [ alerts, setAlert ] = useState<Array<{ message: string, style: AlertProps['severity'] }>>([]);
  const [ steps, setSteps ] = useState<Array<JestExpressionStatement>>([]);
  const [ imports, setImports ] = useState<JestDeclarationExpression['importDeclaration']>([]);
  const [ variables, setVariables ] = useState<JestDeclarationExpression['variableDeclaration']>([]);

  const [ testFramework, setTestFramework ] = useState('Jest');
  const [ nonInteractiveElements, setNonInteractiveElements ] = useState<Set<Element>>(new Set());
  const [ potentialElementsToExpect, setPotentialElementsToExpect ] = useState<Set<Element>>(new Set());

  const [ observer, setObserver ] = useState<MutationObserver>();

  // Create ref to use updated variable inside useCallback
  const rootRef = useRef<HTMLElement | null>(null);
  const actorsRef = useRef<Actors>(actors);
  const componentRef = useRef(component);

  // Initialise Jest with a FE framework
  Jest.init(framework, component.componentName);

  const resetElementSets = {
    option1() {
      setNonInteractiveElements(new Set());
    },
    option2() {
      setPotentialElementsToExpect(new Set());
    },
    both() {
      this.option1();
      this.option2();
    }
  };

  const recordChangesToDomTree = (status: Status) => {
    if (status === 'on') {
      const mutationObserver = new MutationObserver((mutations) => {
        const removedElements = mutations
          .filter((mutation) => mutation.removedNodes.length > 0)
          .map((mutation) => Array.from(mutation.removedNodes))
          .flat()
          // Make sure they are elements and not nodes (like TEXT node for example)
          .filter((node): node is Element => node.nodeType === Node.ELEMENT_NODE)
          .filter((element) => element.getAttribute('data-testid'));

        for (const item of removedElements || []) {
          const testId = item.getAttribute('data-testid') ?? '';
          if (!testId || nonInteractiveElements.has(item)) {
            break;
          }

          setNonInteractiveElements((items) => items.add(item));
          // Find out if there are more than 1 of the same elements removed from the UI
          const elements = removedElements.filter((element) => element.getAttribute('data-testid')  === testId);
          if (elements?.length === 0) {
            continue;
          }
          if (elements?.length === 1) {
            processResult({
              status: 'success',
              target: {
                eventType: 'waitForElementToBeRemoved',
                accessBy: 'queryByTestId',
                element: elements[0],
                accessAtIndex: 0,
              }
            });
            return;
          }

          processResult({
            status: 'success',
            target: {
              eventType: 'waitForElementToBeRemoved',
              accessBy: 'queryAllByTestId',
              element: elements?.[0] ?? null,
              accessAtIndex: 0,
            }
          });
        }

        const addedElements = mutations
          .filter((mutation) => (
            mutation.removedNodes.length > 0 || mutation.addedNodes.length > 0 || mutation.type === 'characterData'
          ))
          .map((mutation) => [ ...mutation.removedNodes, ...mutation.addedNodes ])
          .flat()
          // Make sure they are elements and not nodes (like TEXT node for example)
          .filter((node): node is Element => node.nodeType === Node.ELEMENT_NODE)
          .filter((element) => element.getAttribute('data-testid'));

        if (addedElements.length === 0) return;
        addedElements.forEach((element) => {
          if (potentialElementsToExpect.has(element)) return;
          setPotentialElementsToExpect((items) => items.add(element));
        });
      });
      setObserver(mutationObserver);
      mutationObserver.observe(rootRef.current as HTMLElement, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true,
      });
      return;
    }

    if (status === 'off') {
      observer?.disconnect();
    }
  };

  // Process the result (alert if error or warn and set recorded step list if successful)
  const processResult = (result: UserEventResult | null, chainingOperations?: {}) => {
    if (result?.status === 'error' || result?.status === 'warning') {
      setAlert((prev) => [ ...prev, { message: result?.message as string, style: result?.status } ]);
      return;
    }
    if (result?.status === 'success') {
      // Use User interaction to Jest code mapper here
      const recordedStep = Jest[result.target?.eventType as EventType | Extract<NonInteractiveEventType, 'waitForElementToBeRemoved' | 'expect'>]({
        userEvent: result.target,
        value: (result.target?.element as HTMLInputElement)?.value ?? '',
        chainingOperations: chainingOperations ?? {},
      });
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
    // Modal component aren't reachable as it is placed on the same level as body, not #root
    // const rootElement: HTMLElement = (frameElement as any)?.contentDocument.querySelector('#root');
    const rootElement: HTMLElement = (frameElement as any)?.contentDocument.body;
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
      toggleListener('on');
      recordChangesToDomTree('on');
    },
    off: () => {
      // Remove event listener and stuff
      toggleListener('off');
      recordChangesToDomTree('off');
    }
  }

  const onItemRemove = (removingIdx: number) => {
    let removingItem = steps[removingIdx];
    setSteps((items) => items.filter((_, idx) => idx !== removingIdx));
  };
  const onImportItemRemove = (removingIdx: number) => {
    setImports((items) => items.filter((_, idx) => idx !== removingIdx));
  };
  const onVariableItemRemove = (removingIdx: number) => {
    setVariables((items) => items.filter((_, idx) => idx !== removingIdx));
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
    } else if (actorsRef.current) {
      setAlert([]);
    }
    // If story is not rendered
    if (!storyRendered) {
      setRecordState('off');
      setSteps([]);
      setImports([]);
      setVariables([]);
      resetElementSets.both();
    }
  }, [ actors, storyRendered ]);
  useEffect(() => {
    componentRef.current = component;
  }, [ component ]);
  useEffect(() => {
    if (settings?.status === 'on' && storyRendered) {
      setRecordState('on');
    }
    saveToLocalStorage(settings ?? { status: 'off' });
  }, [ settings, storyRendered ]);

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
        onItemRemove={onItemRemove}
        onImportItemRemove={onImportItemRemove}
        onVariableItemRemove={onVariableItemRemove} />

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

      {/* Modal */}
      {
        recordState === 'off' && potentialElementsToExpect.size > 0
          ? <Modal
              elements={Array.from(potentialElementsToExpect)}
              onClose={() => { resetElementSets.option2(); }}
              onSubmit={({ element, negation, outcome }: { element: Element | null, negation: string, outcome: ExpectStatement }) => {
                if (potentialElementsToExpect.size === 0) return;
                processResult(
                  {
                    status: 'success',
                    target: {
                      eventType: 'expect',
                      accessBy: 'queryByTestId',
                      element,
                      accessAtIndex: 0,
                    }
                  },
                  {
                    negation,
                    outcome,
                  },
                );
                resetElementSets.option2();
              }} />
          : null
      }

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

        <InfoAndSettingsDevStyle>
          <Chip
            icon={<SettingsSuggestIcon style={{ color: settings?.status === 'off' ? 'white' : 'black' }} />}
            sx={{
              backgroundColor: settings?.status === 'off' ? 'transparent' : 'white',
              '& .MuiChip-label': {
                color: settings?.status === 'off' ? 'white' : 'black',
              },
              '&:hover': {
                backgroundColor: 'rgba(200, 200, 200, .75) !important',
              }
            }}
            variant="outlined"
            label={`Auto-record: ${settings?.status?.toUpperCase() ?? 'OFF'}`}
            clickable
            onClick={() => { setSettings((sett) => ({ status: (sett?.status || 'on') === 'on' ? 'off' : 'on' })) }} />
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
        </InfoAndSettingsDevStyle>
      </FooterStyle>
    </AddonPanel>
  );
}
