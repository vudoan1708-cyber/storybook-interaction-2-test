import React, { ReactElement, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextareaAutosize,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styled from '@emotion/styled';

import { EXPECT_STATEMENTS } from '../helpers';
import { ExpectStatement } from '../../types';

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
  onClose,
  onSubmit,
}: {
  elements: Element[],
  onClose: () => void,
  onSubmit: ({ element, negation, outcome }: { element: Element | null, negation: string, outcome: ExpectStatement }) => void,
}) => {
  const [ step, setStep ] = useState<number>(1);
  const [ flagElements, setFlagElements ] = useState<FlagElement[]>(elements.map((element) => ({ element, flag: false })));
  const [ outcome, setOutcome ] = useState<ExpectStatement>();
  const [ not, setNot ] = useState<boolean>(false);

  const backOrClose = () => {
    if (step === 1) {
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
      return;
    }
    if (step > 1) {
      onSubmit({
        element: flagElements.find((object) => object.flag)?.element ?? null,
        negation: not ? 'not' : '',
        outcome: outcome as ExpectStatement,
      });
    }
  };

  const onToggle = () => {
    setNot(!not);
  };

  const previewSelection = (): ReactElement | null => {
    let jsxComponent: ReactElement | null = null;

    const found = flagElements.find((object) => object.flag);
    if (found) {
      jsxComponent = (
        <Section>
          <i>expect </i>
          <Chip
            sx={{
              margin: '4px',
            }}
            variant={found.flag ? "filled" : "outlined"}
            label={`${found.element.getAttribute('data-testid')}`} />

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
                                        whiteSpace: 'nowrap',
                                        minWidth: 24,
                                        textAlign: 'center',
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
      open={elements.length > 0}
      onClose={onClose}>
      <DialogTitle>Expect()</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {
            step === 1
              ? 'One of these elements with the data-testid might be of your interest for the expect statement.'
              : 'Choose one of the following expression outcomes for your expect statement.'
          }
        </DialogContentText>
        {previewSelection()}
        {
          step === 1
            ? (
                flagElements.map((object, idx) => (
                  <Chip
                    key={idx}
                    icon={object.flag ? <CheckCircleIcon /> : undefined}
                    sx={{
                      margin: '4px',
                    }}
                    variant={object.flag ? "filled" : "outlined"}
                    label={`${object.element.getAttribute('data-testid')}`}
                    clickable
                    onClick={() => {
                      // Reset
                      setFlagElements(elements.map((element, resetIndex) => ({ element, flag: idx === resetIndex })));
                    }} />
                ))
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
                          setOutcome((current) => ({ ...current, arguments: [ e.target.value ] } as ExpectStatement))
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
          disabled={step === 1 ? flagElements.every((object) => !object.flag) : !outcome?.keyword}
          onClick={increment}>
          Select
        </Button>
      </DialogActions>
    </Dialog>
  )
};
