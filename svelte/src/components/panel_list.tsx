import React, { useEffect, useRef } from 'react';
import { JestExpressionStatement } from '../../types';

import Code from './code';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';

import styled from '@emotion/styled';

export default ({ list, onItemRemove }: { list: Array<JestExpressionStatement>, onItemRemove: (idx: number) => void }) => {
  const footerRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const OlStyle = styled.ol<{ footerHeight: number, headerHeight: number }>`
    position: relative;
    max-height: ${({ footerHeight, headerHeight }) => `calc(100% - ${footerHeight}px - ${headerHeight}px - 14px)`};
    overflow-y: auto;
  `;

  useEffect(() => {
    footerRef.current = document.querySelector('footer');
    headerRef.current = document.querySelector('#i2t-header');
  }, []);

  return (
    <>
      {list.length > 0
        ? (
          <OlStyle footerHeight={footerRef.current?.offsetHeight ?? 0} headerHeight={headerRef.current?.offsetHeight ?? 0}>
            {list?.map((item, idx) => (
              <li key={idx}>
                <Code item={item} />
                <Tooltip title="Remove" arrow>
                  <IconButton aria-label="delete" onClick={() => { onItemRemove(idx); }}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </li>
            ))}
          </OlStyle>
          )
        : <h3 style={{ textAlign: 'center', color: 'rgb(100, 100, 100)' }}>No user interactions found.</h3>}
    </>
  )
}
