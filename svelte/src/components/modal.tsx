import React, { ReactElement, useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import styled from '@emotion/styled';

import { EXPECT_STATEMENTS } from '../helpers';

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
  onSubmit: ({ element, not, outcome }: { element: Element | null, not: boolean, outcome: string }) => void,
}) => {
  const [ step, setStep ] = useState<number>(1);
  const [ flagElements, setFlagElements ] = useState<FlagElement[]>(elements.map((element) => ({ element, flag: false })));
  const [ outcome, setOutcome ] = useState<string>('');
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
        not,
        outcome,
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
          <Chip sx={{
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
                    .<Chip sx={{
                        margin: '4px',
                      }}
                      variant={outcome ? "filled" : "outlined"}
                      label={outcome} />
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
                      icon={statement === outcome ? <CheckCircleIcon /> : undefined}
                      sx={{ margin: '4px' }}
                      variant={statement === outcome ? "filled" : "outlined"}
                      label={statement}
                      clickable
                      onClick={() => {
                        // Reset
                        setOutcome(statement);
                      }} />
                  ))
                )}
              </>
        }
      </DialogContent>
      <DialogActions>
        <Button onClick={backOrClose}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button type="submit" disabled={flagElements.every((object) => !object.flag)} onClick={increment}>Select</Button>
      </DialogActions>
    </Dialog>
  )
};
