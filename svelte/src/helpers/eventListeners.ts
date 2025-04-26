import type { Actors, EventType, NonInteractiveEventType, UserEventResult } from '../../types';

const __checkIfMany = (
  root: HTMLElement,
  target: HTMLElement,
  attributeValue: string | null
): Omit<NonNullable<UserEventResult['target']>, 'eventType'> => {
  const elements = root.querySelectorAll(`[data-testid="${attributeValue}"]`);
  if (elements.length === 1) {
    return {
      accessBy: 'queryByTestId',
      element: elements[0],
      accessAtIndex: 0,
    };
  }

  let finalElement: HTMLElement | null = null;
  let idx = 0;
  for (const element of elements) {
    if (target === element) {
      finalElement = element as HTMLElement;
      break;
    }
    idx++;
  }
  return {
    accessBy: 'queryAllByTestId',
    element: finalElement,
    accessAtIndex: idx,
  };
};

const __getElementByDataTestId = (
  root: HTMLElement,
  target: HTMLElement | null | undefined,
  eventType: EventType | NonInteractiveEventType,
  actors: Actors
): UserEventResult => {
  const parentIsRoot = target?.parentElement?.querySelector('#root');
  if (parentIsRoot) {
    return {
      status: 'warning',
      message: `No matching event found on the ${(target as any)?.nodeName} element with the last event: ${eventType}`,
    };
  }
  // if target element has a data-testid attribute and has the same event type
  const attributeValue = target?.getAttribute('data-testid');
  if (attributeValue) {
    if (actors[attributeValue] === eventType) {
      const found = __checkIfMany(root, target as HTMLElement, attributeValue);
      const returnObj = {
        success: {
          status: 'success',
          message: `Step recorded with ${eventType} event on ${(target as any)?.nodeName} element`,
        } as UserEventResult,
        error: {
          status: 'error',
          message: 'Internal error: Element not found',
        } as UserEventResult,
      };
      return {
        ...returnObj[found.element ? 'success' : 'error'],
        target: { ...found, eventType },
      };
    }
    return __getElementByDataTestId(root, target?.parentElement, eventType, actors);
  }
  return __getElementByDataTestId(root, target?.parentElement, eventType, actors);
};

export const onElementClick = (root: HTMLElement, e: Event, actors: Actors): UserEventResult => {
  return __getElementByDataTestId(root, e?.target as HTMLElement, 'click', actors);
};
export const onElementInput = (root: HTMLElement, e: Event, actors: Actors): UserEventResult => {
  return __getElementByDataTestId(root, e?.target as HTMLElement, 'input', actors);
};
export const onElementChange = (root: HTMLElement, e: Event, actors: Actors): UserEventResult => {
  return __getElementByDataTestId(root, e?.target as HTMLElement, 'change', actors);
};
