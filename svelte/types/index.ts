import { AlertColor } from '@mui/material';

export type Status = 'on' | 'off';
export type EventType = 'click' | 'hover' | 'input' | 'change';
export type Framework = 'svelte' | 'react' | 'angular';

export type JestQuery = 'queryByTestId' | 'queryAllByTestId';

export type EnrichedStory = {
  id: string;
  kind: string;
  name: string;
  importPath?: string;
};

export type UserEvent = {
  type: 'template' | 'script';
  eventName: string;
  element: string; // tag name or variable name
  handler?: string;
  location?: { line: number; column: number };
};

export type Actors = {
  [x: string]: EventType;
};

export type UserEventResult = {
  status: AlertColor;
  message?: string;
  target?: {
    eventType: EventType;
    accessBy: JestQuery;
    element: HTMLElement | Element | null;
    accessAtIndex: number;
  };
};

export type JavascriptUntouchedKeyword = 'await' | 'function' | 'new' | 'break' | 'continue' | 'const' | 'let';
export type FunctionExpression = {
  type: 'arrow_function';
  params: Array<any>;
  block: JestExpressionStatement;
};
export type ObjectExpression = {
  type: 'object';
  properties: {
    key: string;
    value: Argument;
  };
};
export type Argument = HTMLElement | Element | string | number | ObjectExpression | FunctionExpression;
export type JestMemberExpression = {
  object: string;
  property: string;
  arguments?: Array<Argument>;
};
export type JestExpressionStatement = {
  keyword?: JavascriptUntouchedKeyword;
  callee: JestMemberExpression;
};
