import React, { useEffect, useRef, useState } from 'react';

import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';

import styled from '@emotion/styled';

import Code from './code';

import { JestDeclarationExpression, JestExpressionStatement } from '../../types';

export default ({
  actionList,
  importList,
  variableList,
  onItemRemove,
  onImportItemRemove,
  onVariableItemRemove,
}: {
  actionList: Array<JestExpressionStatement>,
  importList: JestDeclarationExpression['importDeclaration'],
  variableList: JestDeclarationExpression['variableDeclaration'],
  onItemRemove: (idx: number) => void,
  onImportItemRemove: (idx: number) => void,
  onVariableItemRemove: (idx: number) => void,
}) => {
  const [ noList, setNoList ] = useState<boolean>(true);
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
  useEffect(() => {
    setNoList(importList.length === 0 && variableList.length === 0 && actionList.length === 0);
  }, [ importList, variableList, actionList ]);

  return (
    <OlStyle footerHeight={footerRef.current?.offsetHeight ?? 0} headerHeight={headerRef.current?.offsetHeight ?? 0}>
      {importList.length > 0
        ? (
            importList?.map((item, idx) => (
              <li key={idx}>
                <Code item={item} kind="importDeclarations" />
                <Tooltip title="Remove" arrow>
                  <IconButton aria-label="delete" onClick={() => { onImportItemRemove(idx); }}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </li>
            ))
          )
        : null
      }
      {variableList.length > 0
        ? (
          variableList?.map((item, idx) => (
              <li key={idx}>
                <Code item={item} kind="variableDeclarations" />
                <Tooltip title="Remove" arrow>
                  <IconButton aria-label="delete" onClick={() => { onVariableItemRemove(idx); }}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </li>
            ))
          )
        : null
      }
      {
        actionList.length > 0
          ? (
              actionList?.map((item, idx) => (
                <li key={idx}>
                  <Code item={item} kind="statements" />
                  <Tooltip title="Remove" arrow>
                    <IconButton aria-label="delete" onClick={() => { onItemRemove(idx); }}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </li>
              ))
            )
          : null
      }

      {noList ? <h3 style={{ textAlign: 'center', color: 'rgb(100, 100, 100)' }}>No user interactions found.</h3> : null}
    </OlStyle>
  )
}
