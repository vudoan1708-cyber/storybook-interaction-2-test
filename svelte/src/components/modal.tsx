import React, { ReactElement, useRef, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Typography from '@mui/material/Typography';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styled from '@emotion/styled';

import { EXPECT_OUTCOME_API_CALL_MAPPER, EXPECT_STATEMENTS } from '../helpers';
import type { APICallRecord, ExpectStatement } from '../../types';

type FlagElement = { element: Element, flag: boolean };

const Section = styled.section`
  padding: 4px;
  margin: 4px 0;
  background-color: rgba(200, 200, 200, .5);
  border-radius: 4px;
  border-bottom: 1px solid rgba(200, 200, 200, .25);
  text-align: center;
`;

export default ({
  elements,
  apis,
  onClose,
  onSubmit,
}: {
  elements: Element[],
  apis: APICallRecord,
  onClose: () => void,
  onSubmit: ({ target, negation, outcome }: { target: Element | string | null, negation: string, outcome: ExpectStatement }) => void,
}) => {
  const [ step, setStep ] = useState<number>(1);
  const [ flagElements, setFlagElements ] = useState<FlagElement[]>(elements.map((element) => ({ element, flag: false })));
  const apiRef = useRef<Array<string>>(Object.keys(apis));

  const extract = (url: string, what = 'url') => {
    const matchingTemplate = `[${apis[url].method}]`;
    if (what === 'url') {
      // Add 1 to ignore the space before the url. E.g: [PUT] /<url>
      return url.slice(matchingTemplate.length + 1, url.length);
    }
    if (what === 'method') {
      return url.slice(0, matchingTemplate.length);
    }
    return '';
  };
  const [ apiKeys, setApiKeys ] = useState<Array<{ url: string, method: APICallRecord[string]['method'], flag: boolean }>>(apiRef.current.map((url) => ({
    url: extract(url, 'url'),
    method: extract(url, 'method') as APICallRecord[string]['method'],
    flag: false,
  })));
  const [ outcome, setOutcome ] = useState<ExpectStatement>();
  const [ not, setNot ] = useState<boolean>(false);

  const backOrClose = () => {
    if (step === 1) {
      setOutcome((statement) => ({ ...statement, arguments: [] } as ExpectStatement));
      onClose();
      return;
    }
    if (step > 1) {
      setStep(step - 1);
    }
  };
  const increment = () => {
    if (step === 1) {
      setStep(step + 1);

      // assume this is step 2 where the expect stage comes up so we create default value coming from the API call record
      createDefaultValue(outcome as ExpectStatement);
      return;
    }
    if (step > 1) {
      onSubmit({
        target: (flagElements.find((object) => object.flag)?.element || apiKeys.find((object) => object.flag)?.url) ?? null,
        negation: not ? 'not' : '',
        outcome: outcome as ExpectStatement,
      });
    }
  };

  const onToggle = () => {
    setNot(!not);
  };

  const createDefaultValue = (outcome: ExpectStatement) => {
    if (!outcome) return;

    const foundApi = apiKeys.find((key) => key.flag);
    if (!foundApi) return;

    const keyToGetFromApiCallRecord = EXPECT_OUTCOME_API_CALL_MAPPER[outcome.keyword] as keyof APICallRecord[string];
    if (keyToGetFromApiCallRecord) {
      const defaultInputValue = apis[`${foundApi.method} ${foundApi.url}`][keyToGetFromApiCallRecord];
      if (!defaultInputValue) return;

      setOutcome({ ...outcome, arguments: [ defaultInputValue ] } as ExpectStatement);
    }
  };

  const previewSelection = (): ReactElement | null => {
    let jsxComponent: ReactElement | null = null;

    const foundElement = flagElements.find((object) => object.flag);
    const foundApi = apiKeys.find((object) => object.flag);
    if (foundElement || foundApi) {
      jsxComponent = (
        <Section>
          <i>expect </i>
          <Chip
            sx={{
              margin: '4px',
            }}
            variant={(foundElement?.flag || foundApi?.flag) ? "filled" : "outlined"}
            label={`${foundElement?.element?.getAttribute('data-testid') || foundApi?.url}`} />

          {
            not
              ? <i>.not</i>
              : null
          }
          {
            outcome
              ? (
                  <>
                    .<Chip
                        sx={{
                          margin: '4px',
                          maxWidth: '100%',
                        }}
                        variant="filled"
                        label={
                          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {outcome.keyword}
                            {
                              (outcome?.arguments ?? []).length > 0
                                ? (
                                    <Box
                                      sx={{
                                        ml: 1,
                                        px: 1,
                                        py: 0.5,
                                        bgcolor: 'rgba(0, 0, 0, 0.25)',
                                        color: 'white',
                                        borderRadius: '16px',
                                        fontSize: '0.75rem',
                                        lineHeight: 1,
                                        minWidth: 24,
                                        textAlign: 'center',
                                        overflow: 'hidden',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '370px',
                                      }}>
                                      {outcome.arguments}
                                    </Box>
                                  )
                                : null
                            }
                          </span>
                        } />
                  </>
                )
              : null
          }
        </Section>
      )
    }
    return jsxComponent;
  };

  return (
    <Dialog
      open={elements.length > 0 || apiRef.current.length > 0}
      onClose={onClose}>
      <DialogTitle>Expect()</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            step === 1
              ? 'One of the below options might be of your interest for the expect statement.'
              : 'Choose one of the following expression outcomes for your expect statement.'
          }
        </DialogContentText>
        {previewSelection()}
        {
          step === 1
            ? (
                <Stack spacing={2}>
                  <section>
                    {apiKeys.length
                      ? (
                          <>
                            <Typography component="div" style={{ marginTop: '4px' }}>
                              API calls
                            </Typography>
                            <Alert
                              severity="warning"
                              sx={{
                                margin: '4px 0',
                                '.MuiAlert-message': {
                                  padding: '4px 0',
                                }
                              }}>
                              <small>
                                Some early API calls may not be captured due to Storybook environment and mock libraries (if any).
                              </small>
                            </Alert>
                          </>
                        )
                      : null
                    }

                    {apiKeys.map((key, idx) => (
                      <Chip
                        key={idx}
                        icon={key.flag ? <CheckCircleIcon /> : undefined}
                        sx={{
                          margin: '4px',
                        }}
                        variant={key.flag ? "filled" : "outlined"}
                        label={
                          <Typography variant="body2" component="span">
                            <b>{key.method}</b> {key.url}
                          </Typography>
                        }
                        clickable
                        onClick={(e) => {
                          e.persist();
                          setApiKeys(apiRef.current.map((k, resetIndex) => ({ url: extract(k, 'url'), method: extract(k, 'method') as APICallRecord[string]['method'], flag: idx === resetIndex })));
                          // Reset
                          setFlagElements(elements.map((element) => ({ element, flag: false })));
                        }} />
                    ))}
                  </section>

                  <section>
                    {flagElements.length > 0
                      ? (
                          <Typography component="div" style={{ marginTop: '4px' }}>
                            <code>data-testid</code>s of elements
                          </Typography>
                        )
                      : null
                    }

                    {flagElements.map((object, idx) => (
                      <Chip
                        key={idx}
                        icon={object.flag ? <CheckCircleIcon /> : undefined}
                        sx={{
                          margin: '4px',
                        }}
                        variant={object.flag ? "filled" : "outlined"}
                        label={`${object.element.getAttribute('data-testid')}`}
                        clickable
                        onClick={(e) => {
                          e.persist();
                          // Reset
                          setApiKeys(apiRef.current.map((k) => ({ url: extract(k, 'url'), method: extract(k, 'method') as APICallRecord[string]['method'], flag: false })));
                          setFlagElements(elements.map((element, resetIndex) => ({ element, flag: idx === resetIndex })));
                        }} />
                    ))}
                  </section>
                </Stack>
              )
            : <>
                <div>
                  <FormControlLabel control={<Switch checked={not} onChange={onToggle} />} label="Not" />
                </div>
                {(
                  EXPECT_STATEMENTS.map((statement, idx) => (
                    <Chip
                      key={idx}
                      icon={statement.keyword === outcome?.keyword ? <CheckCircleIcon /> : undefined}
                      sx={{ margin: '4px' }}
                      variant={statement.keyword === outcome?.keyword ? "filled" : "outlined"}
                      label={statement.keyword}
                      clickable
                      onClick={() => {
                        // Reset
                        setOutcome({ ...statement, arguments: [] });
                        // Provide default value to the textarea input if any
                        createDefaultValue(statement);
                      }} />
                  ))
                )}

                {
                  (outcome?.argumentTypes ?? []).length > 0
                    ? (
                      <TextareaAutosize
                        maxRows={4}
                        aria-label="argument"
                        placeholder="Argument"
                        style={{ width: '100%', resize: 'vertical', marginTop: '12px' }}
                        value={outcome?.arguments?.[0] ?? ''}
                        onChange={(e) => {
                          e.persist();
                          setOutcome((current) => ({ ...current, arguments: [ e.target.value ].filter(Boolean) } as ExpectStatement));
                        }} />
                      )
                    : null
                }
              </>
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={backOrClose}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button
          type="submit"
          disabled={step === 1
            ? (flagElements.every((object) => !object.flag) && apiKeys.every((object) => !object.flag))
            : !outcome?.keyword}
          onClick={increment}>
          Select
        </Button>
      </DialogActions>
    </Dialog>
  )
};
