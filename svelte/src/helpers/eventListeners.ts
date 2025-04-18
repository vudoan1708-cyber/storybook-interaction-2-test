import { Actors, EventType } from "../../types";

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
) => {
  const parentIsRoot = target?.parentElement?.querySelector('#root');
  if (parentIsRoot) {
    console.error('No data-testid found in clicked element and its parent elements');
    return null;
  }
  // if target element has a data-testid attribute and has the same event type
  const attributeValue = target?.getAttribute('data-testid');
  if (attributeValue && actors[attributeValue]) {
    return __checkIfMany(root, target as HTMLElement, attributeValue);
  }
  return __getElementByDataTestId(root, target?.parentElement, eventType, actors);
};

export const onElementClick = (root: HTMLElement, e: Event, actors: Actors) => {
  return __getElementByDataTestId(root, e?.target as HTMLElement, 'click', actors);
};
