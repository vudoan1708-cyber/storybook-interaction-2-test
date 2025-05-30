import { AlertColor } from '@mui/material';

export type Status = 'on' | 'off';
export type NonInteractiveEventType = 'waitForElementToBeRemoved' | 'expect' | 'not' | 'toBeInTheDocument';
export type EventType = 'click' | 'hover' | 'input' | 'change';
export type Framework = 'svelte' | 'react' | 'angular';

export type JestQuery = 'queryByTestId' | 'queryAllByTestId';
export type JestLifeCycleFunction =
  | JestQuery
  | Exclude<NonInteractiveEventType, 'not' | 'toBeInTheDocument'>
  | 'beforeAll'
  | 'beforeEach'
  | 'afterEach'
  | 'afterAll'
  | 'render'
  | 'waitFor'
  | 'waitForElementToBeRemoved'
  | 'userEvent'
  | 'fireEvent';

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
    eventType: EventType | NonInteractiveEventType;
    accessBy?: JestQuery;
    element: HTMLElement | Element | string | null;
    accessAtIndex: number;
  };
};

export type JavascriptUntouchedKeyword =
  | 'await'
  | 'function'
  | 'new'
  | 'break'
  | 'continue'
  | 'const'
  | 'let'
  | 'import'
  | 'export';
export type FunctionExpression = {
  type: 'arrow_function';
  params: Array<any>;
  block: JestExpressionStatement;
};
export type ObjectExpression = {
  type: 'object';
  properties:
    | { key: string; value: Argument }
    | Array<{ key: string; value: Argument }>
};
export type Argument =
  | HTMLElement
  | Element
  | string
  | number
  | ObjectExpression
  | FunctionExpression;
export type JestMemberExpression = {
  object: JestLifeCycleFunction;
  property?: string;
  arguments?: Array<Argument>;
  chained?: JestExpressionStatement; // Chaining operation like expect().toBeInTheDocument()
  noParen?: boolean;
};
export type ImportExportKind = 'named' | 'default';
export  type JestDeclarationExpression = {
  importDeclaration: Array<{
    declarationSyntax: ImportExportKind;
    keywords: Set<Omit<JestLifeCycleFunction, JestQuery>>;
    source: JestImportPath;
  }>;
  variableDeclaration: Array<{
    declarationSyntax: ImportExportKind;
    keywords: Set<JestQuery>;
    callee: JestMemberExpression;
  }>;
}
export type JestExpressionStatement = {
  keyword?: JavascriptUntouchedKeyword;
  callee: JestMemberExpression;
};

export type JestImportPath =
  | '@jest/global'
  | '@testing-library/jest-dom/extend-expect'
  | '@testing-library/svelte'
  | '@testing-library/react'
  | '@testing-library/angular'
  | '@testing-library/user-event';
type FromType<T> = T extends 'importDeclaration' ? JestImportPath : 'render';
export type DeclarationTemplate = {
  [x in JestLifeCycleFunction]: {
    kind: 'importDeclaration' | 'variableDeclaration';
    from: FromType<DeclarationTemplate[x]['kind']>;
    declarationSyntax: ImportExportKind;
  };
};

export type ExpectStatement = {
  keyword:
  | 'toBeInTheDocument'
  | 'toBeNull'
  | 'toBeUndefined'
  | 'toBe'
  | 'toHaveTextContent'
  | 'toHaveStyle'
  | 'toHaveLength'
  | 'toEqual'
  | 'toStrictEqual'
  | 'toHaveBeenCalled'
  | 'toHaveBeenCalledWith'
  | 'toHaveBeenCalledTimes';
  argumentTypes: Array<any>;
  arguments?: Array<any>;
};

// API
export type APICallRecord = {
  [url: string]: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    requestBody: BodyInit | null | undefined;
    responseBody?: any;
    times: number;
    status: number;
  };
};

// Settings
export type RecordingSettings = {
  status: Status;
};
