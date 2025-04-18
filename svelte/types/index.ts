export type Status = 'on' | 'off';
export type EventType = 'click' | 'hover' | 'input';

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
