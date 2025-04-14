export type Status = 'on' | 'off';
export type EventType = 'click' | 'hover';

export type PatchedEventTarget = {
  _listeners?: Record<EventType, EventListener>;
};
