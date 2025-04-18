import { Actors, EventType, UserEventResult } from "../../types";

const __checkIfMany = (root: HTMLElement, target: HTMLElement, attributeValue: string | null) => {
  const elements = root.querySelectorAll(`[data-testid="${attributeValue}"]`);
  if (elements.length === 1) {
    return elements[0];
  }

  let finalElement: HTMLElement | null = null;
  for (const element of elements) {
    if (target === element) {
      finalElement = element as HTMLElement;
      break;
    }
  }
  console.log('finalElement', finalElement);
  return finalElement;
};

const __getElementByDataTestId = (
  root: HTMLElement,
  target: HTMLElement | null | undefined,
  eventType: EventType,
  actors: Actors
): UserEventResult => {
  const parentIsRoot = target?.parentElement?.querySelector('#root');
  if (parentIsRoot) {
    return {
      status: 'error',
      message: `${(target as any)?.nodeName} doesn't have a data-testid and neither do its parent elements`,
    };
  }
  // if target element has a data-testid attribute and has the same event type
  const attributeValue = target?.getAttribute('data-testid');
  if (attributeValue) {
    if (actors[attributeValue] === eventType) {
      return {
        status: 'success',
        element: __checkIfMany(root, target as HTMLElement, attributeValue),
        message: `Step recorded with ${eventType} event on ${(target as any)?.nodeName}`,
      };
    }
    return {
      status: 'warning',
      message: `No matching event found on the ${(target as any)?.nodeName} element with the last event: ${eventType}`,
    };
  }
  return __getElementByDataTestId(root, target?.parentElement, eventType, actors);
};

export const onElementClick = (root: HTMLElement, e: Event, actors: Actors): UserEventResult => {
  return __getElementByDataTestId(root, e?.target as HTMLElement, 'click', actors);
};
export const onElementInput = (root: HTMLElement, e: Event, actors: Actors): UserEventResult => {
  return __getElementByDataTestId(root, e?.target as HTMLElement, 'input', actors);
};
