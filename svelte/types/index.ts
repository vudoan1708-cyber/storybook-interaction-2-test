export type Status = 'on' | 'off';
export type EventType = 'click' | 'hover';

export type EnrichedStory = {
  id: string,
  kind: string,
  name: string,
  importPath?: string,
};
