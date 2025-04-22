import React, { useState } from 'react';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { EXPECT_STATEMENTS } from '../helpers';

type FlagElement = { element: Element, flag: boolean };

export default ({ elements, onClose }: { elements: Element[], onClose: () => void }) => {
  const [ step, setStep ] = useState<number>(1);
  const [ flagElements, setFlagElements ] = useState<FlagElement[]>(elements.map((element) => ({ element, flag: false })));
  console.log('elements', elements);
  const backOrClose = () => {
    console.log('step', step);
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
      onClose();
    }
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
        {
          step === 1
            ? (
                flagElements.map((object, idx) => (
                  <Chip
                    key={idx}
                    icon={<CheckCircleIcon />}
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
            : (
                EXPECT_STATEMENTS.map((statement, idx) => (
                  <Chip
                    key={idx}
                    icon={<CheckCircleIcon />}
                    sx={{ margin: '4px' }}
                    variant="outlined"
                    label={statement}
                    clickable
                    onClick={() => {
                      // Reset
                      setFlagElements(elements.map((element, resetIndex) => ({ element, flag: idx === resetIndex })));
                    }} />
                ))
              )
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
